"""Change busType to string

Revision ID: 451af3d50e03
Revises: ed08006f74d2
Create Date: 2025-01-30 04:35:49.088528

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '451af3d50e03'
down_revision = 'ed08006f74d2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Buses', schema=None) as batch_op:
        batch_op.alter_column('busType',
               existing_type=sa.VARCHAR(length=13),
               type_=sa.String(length=50),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Buses', schema=None) as batch_op:
        batch_op.alter_column('busType',
               existing_type=sa.String(length=50),
               type_=sa.VARCHAR(length=13),
               existing_nullable=False)

    # ### end Alembic commands ###
