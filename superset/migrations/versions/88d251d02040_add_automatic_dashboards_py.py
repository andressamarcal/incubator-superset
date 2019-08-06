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
"""add_automatic_dashboards.py

Revision ID: 88d251d02040
Revises: def97f26fdfb
Create Date: 2019-08-06 15:35:40.341455

"""

# revision identifiers, used by Alembic.
revision = '88d251d02040'
down_revision = 'def97f26fdfb'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table('automatic_dashboards',
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.Column('changed_on', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('datasource_type', sa.String(length=200), nullable=True),
    sa.Column('viz_type', sa.String(length=250), nullable=True),
    sa.Column('created_by_fk', sa.Integer(), nullable=True),
    sa.Column('changed_by_fk', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['changed_by_fk'], ['ab_user.id'], ),
    sa.ForeignKeyConstraint(['created_by_fk'], ['ab_user.id'], ),
    sa.ForeignKeyConstraint(['id'], ['dashboards.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('database_groups',
    sa.Column('created_on', sa.DateTime(), nullable=True),
    sa.Column('changed_on', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=250), nullable=True),
    sa.Column('dashboard_id', sa.Integer(), nullable=True),
    sa.Column('created_by_fk', sa.Integer(), nullable=True),
    sa.Column('changed_by_fk', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['changed_by_fk'], ['ab_user.id'], ),
    sa.ForeignKeyConstraint(['created_by_fk'], ['ab_user.id'], ),
    sa.ForeignKeyConstraint(['dashboard_id'], ['automatic_dashboards.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('dashboard_id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('databases_groups',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('database_group_id', sa.Integer(), nullable=True),
    sa.Column('database_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['database_group_id'], ['database_groups.id'], ),
    sa.ForeignKeyConstraint(['database_id'], ['dbs.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('database_group_id', 'database_id')
    )


def downgrade():
    op.drop_table('databases_groups')
    op.drop_table('database_groups')
    op.drop_table('automatic_dashboards')
