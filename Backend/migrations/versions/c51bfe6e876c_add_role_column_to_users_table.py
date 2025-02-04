"""Add role column to Users table

Revision ID: c51bfe6e876c
Revises: ad4039d4fd35
Create Date: 2025-01-28 11:30:55.558942

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c51bfe6e876c'
down_revision = 'ad4039d4fd35'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('role', sa.String(length=50), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Users', schema=None) as batch_op:
        batch_op.drop_column('role')

    # ### end Alembic commands ###
