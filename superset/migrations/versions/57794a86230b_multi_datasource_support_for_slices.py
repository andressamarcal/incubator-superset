# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""multi_datasource_support_for_slices

Revision ID: 57794a86230b
Revises: def97f26fdfb
Create Date: 2019-08-26 12:01:06.171609

"""

# revision identifiers, used by Alembic.
revision = '57794a86230b'
down_revision = 'def97f26fdfb'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table('slice_perms',
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.Column('changed_on', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slice_id', sa.Integer(), nullable=True),
    sa.Column('perm', sa.String(length=1000), nullable=True),
    sa.Column('created_by_fk', sa.Integer(), nullable=True),
    sa.Column('changed_by_fk', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['changed_by_fk'], ['ab_user.id'], ),
    sa.ForeignKeyConstraint(['created_by_fk'], ['ab_user.id'], ),
    sa.ForeignKeyConstraint(['slice_id'], ['slices.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    op.create_table('slice__druid_datasource',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('datasource_id', sa.Integer(), nullable=True),
    sa.Column('slice_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['datasource_id'], ['datasources.id'], ),
    sa.ForeignKeyConstraint(['slice_id'], ['slices.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    op.create_table('slice__table_datasource',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('datasource_id', sa.Integer(), nullable=True),
    sa.Column('slice_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['datasource_id'], ['tables.id'], ),
    sa.ForeignKeyConstraint(['slice_id'], ['slices.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    op.drop_column('slices', 'datasource_id')
    op.drop_column('slices', 'datasource_name')
    op.drop_column('slices', 'perm')


def downgrade():
    op.add_column('slices', sa.Column('datasource_name', sa.VARCHAR(length=2000), nullable=True))
    op.add_column('slices', sa.Column('perm', sa.VARCHAR(length=2000), nullable=True))
    op.add_column('slices', sa.Column('datasource_id', sa.INTEGER(), nullable=True))

    op.drop_table('slice__table_datasource')
    op.drop_table('slice__druid_datasource')
    op.drop_table('slice_perms')
