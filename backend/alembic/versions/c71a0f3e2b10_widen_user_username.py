"""widen_user_username

Revision ID: c71a0f3e2b10
Revises: 8b91c2d4a7ef
Create Date: 2026-06-18 23:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c71a0f3e2b10'
down_revision: Union[str, Sequence[str], None] = '8b91c2d4a7ef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "username",
        existing_type=sa.String(length=20),
        type_=sa.String(length=255),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "username",
        existing_type=sa.String(length=255),
        type_=sa.String(length=20),
        nullable=False,
    )
