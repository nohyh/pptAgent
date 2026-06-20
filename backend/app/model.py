from datetime import datetime
from sqlalchemy import ForeignKey, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base


class Project(Base):
    __tablename__ = "projects"
    id : Mapped[str] =mapped_column(String(50),primary_key=True)
    title :Mapped[str] =mapped_column()
    presentation_data: Mapped[dict] =mapped_column(JSONB)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
    owner_id : Mapped[str | None] = mapped_column(String(50),ForeignKey("users.id"), nullable=True)

class User(Base):
    __tablename__ = "users"
    id : Mapped[str] = mapped_column(String(50),primary_key=True)
    username : Mapped[str | None] = mapped_column(String(255), nullable=True)
    email : Mapped[str | None] = mapped_column(String(255), nullable=True)
    generation_quota : Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now())
    updated_at : Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())
