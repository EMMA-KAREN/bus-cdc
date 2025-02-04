"""Fixed column naming for dateOfBirth

Revision ID: b518563f7d1e
Revises: 384bd2f8570b
Create Date: 2025-01-28 11:47:19.695554

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b518563f7d1e'
down_revision = '384bd2f8570b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('date_of_birth', sa.Date(), nullable=True))
        batch_op.drop_column('dateOfBirth')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('Users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('dateOfBirth', sa.DATE(), nullable=True))
        batch_op.drop_column('date_of_birth')

    # ### end Alembic commands ###
