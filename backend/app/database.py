from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
from app.config import ASYNC_DATABASE_URL

# 未设置时使用的备用 URL
DATABASE_URL = ASYNC_DATABASE_URL or "postgresql+asyncpg://postgres:postgres@localhost:5432/ppt_agent"

# 创建异步数据库引擎
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

# 创建异步会话工厂
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# 所有 SQLAlchemy 模型的声明式基类
class Base(DeclarativeBase):
    pass

# 获取数据库会话的 FastAPI 依赖项
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
