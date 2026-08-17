"""Initial schema

Revision ID: 001
"""

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "simulation_snapshots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant", sa.String(64), index=True),
        sa.Column("tick", sa.Integer(), index=True),
        sa.Column("city_health", sa.Float()),
        sa.Column("payload_json", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )
    op.create_table(
        "sos_reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant", sa.String(64), index=True),
        sa.Column("latitude", sa.Float()),
        sa.Column("longitude", sa.Float()),
        sa.Column("message", sa.Text()),
        sa.Column("contact", sa.String(128), nullable=True),
        sa.Column("status", sa.String(32)),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )


def downgrade() -> None:
    op.drop_table("sos_reports")
    op.drop_table("simulation_snapshots")
