from dataclasses import dataclass
from typing import Any

import jwt
from fastapi import HTTPException
from jwt import PyJWKClient, PyJWTError
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import SUPABASE_JWT_AUDIENCE, SUPABASE_URL
from app.model import User


DEFAULT_GENERATION_QUOTA = 3
# 作品集演示账号：保留 profile 中的额度数字，但生成时不做扣减。
UNLIMITED_QUOTA_EMAILS = {"jamesel398@gmail.com"}


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str | None = None
    generation_quota: int | None = None
    is_unlimited_quota: bool = False


def is_unlimited_quota_email(email: str | None) -> bool:
    return bool(email and email.lower() in UNLIMITED_QUOTA_EMAILS)


_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if not SUPABASE_URL:
        raise HTTPException(status_code=500, detail="SUPABASE_URL 未配置")
    if _jwks_client is None:
        jwks_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


def verify_supabase_token(token: str) -> dict[str, Any]:
    # 后端只信任 Supabase JWT，不接受前端传 owner_id，避免项目越权。
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA"],
            audience=SUPABASE_JWT_AUDIENCE,
            issuer=f"{SUPABASE_URL.rstrip('/')}/auth/v1" if SUPABASE_URL else None,
        )
    except PyJWTError:
        raise HTTPException(status_code=401, detail="登录状态无效或已过期")


async def ensure_local_user(db: AsyncSession, auth_user: AuthUser) -> AuthUser:
    # Supabase Auth 负责登录，本地 users 表只保存业务字段：邮箱、额度、项目关联。
    user = await db.get(User, auth_user.id)
    if user is None:
        user = User(
            id=auth_user.id,
            email=auth_user.email,
            username=auth_user.email,
            generation_quota=DEFAULT_GENERATION_QUOTA,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif auth_user.email and user.email != auth_user.email:
        user.email = auth_user.email
        if not user.username:
            user.username = auth_user.email
        await db.commit()
        await db.refresh(user)

    return AuthUser(
        id=user.id,
        email=user.email,
        generation_quota=user.generation_quota,
        is_unlimited_quota=is_unlimited_quota_email(user.email),
    )

# 扣除额度
async def reserve_generation_quota(db: AsyncSession, user_id: str) -> int:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    if is_unlimited_quota_email(user.email):
        return user.generation_quota

    # 用数据库条件更新做原子预占，避免并发请求把额度扣成负数。
    stmt = (
        update(User)
        .where(User.id == user_id, User.generation_quota > 0)
        .values(generation_quota=User.generation_quota - 1)
        .returning(User.generation_quota)
    )
    result = await db.execute(stmt)
    remaining = result.scalar_one_or_none()
    if remaining is None:
        await db.rollback()
        raise HTTPException(status_code=402, detail="生成额度不足")
    await db.commit()
    return remaining

# 失败时返还额度
async def refund_generation_quota(db: AsyncSession, user_id: str) -> int:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    if is_unlimited_quota_email(user.email):
        return user.generation_quota

    # 只有生成失败才返还；成功生成后保留扣减结果。
    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(generation_quota=User.generation_quota + 1)
        .returning(User.generation_quota)
    )
    result = await db.execute(stmt)
    remaining = result.scalar_one()
    await db.commit()
    return remaining

# 获取用户信息
async def get_user_profile(db: AsyncSession, user_id: str) -> AuthUser:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return AuthUser(
        id=user.id,
        email=user.email,
        generation_quota=user.generation_quota,
        is_unlimited_quota=is_unlimited_quota_email(user.email),
    )
