"""add_auth_user_profile_fields

Revision ID: 8b91c2d4a7ef
Revises: 6046b5d9f425
Create Date: 2026-06-18 23:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8b91c2d4a7ef'
down_revision: Union[str, Sequence[str], None] = '6046b5d9f425'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}

    if "email" not in user_columns:
        op.add_column("users", sa.Column("email", sa.String(length=255), nullable=True))
    if "generation_quota" not in user_columns:
        op.add_column(
            "users",
            sa.Column("generation_quota", sa.Integer(), server_default="3", nullable=False),
        )
    if "created_at" not in user_columns:
        op.add_column(
            "users",
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        )
    if "updated_at" not in user_columns:
        op.add_column(
            "users",
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        )

    project_columns = {
        column["name"]: column
        for column in inspector.get_columns("projects")
    }
    owner_column = project_columns.get("owner_id")
    if owner_column and not owner_column.get("nullable", True):
        op.alter_column("projects", "owner_id", existing_type=sa.String(length=50), nullable=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_columns = {column["name"] for column in inspector.get_columns("users")}

    for column_name in ["updated_at", "created_at", "generation_quota", "email"]:
        if column_name in user_columns:
            op.drop_column("users", column_name)
