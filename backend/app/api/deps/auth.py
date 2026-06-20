from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.auth_service import AuthUser, ensure_local_user, verify_supabase_token


bearer_scheme = HTTPBearer(auto_error=False)

# 检测是否有token，校验并返回用户信息
async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> AuthUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="请先登录")

    claims = verify_supabase_token(credentials.credentials)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="登录状态无效或已过期")

    return await ensure_local_user(
        db,
        AuthUser(id=user_id, email=claims.get("email")),
    )
