"""add_user_table_and_owner_id

Revision ID: 6046b5d9f425
Revises: 05ea9c1fe372
Create Date: 2026-06-16 13:53:34.349188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6046b5d9f425'
down_revision: Union[str, Sequence[str], None] = '05ea9c1fe372'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
    sa.Column('id', sa.String(length=50), nullable=False),
    sa.Column('username', sa.String(length=255), nullable=True),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('generation_quota', sa.Integer(), server_default='3', nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column('projects', sa.Column('owner_id', sa.String(length=50), nullable=True))
    op.create_foreign_key('fk_projects_owner_id_users', 'projects', 'users', ['owner_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_projects_owner_id_users', 'projects', type_='foreignkey')
    op.drop_column('projects', 'owner_id')
    op.drop_table('users')
