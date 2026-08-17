"""PostgreSQL persistence — snapshots and SOS reports."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from sqlalchemy import select, func

from app.core.config import settings
from app.db.models import SOSReport, SimulationSnapshot, ContactMessage
from app.db.session import Base, async_session, engine
from app.services.platform import get_public_state

logger = logging.getLogger("nexus.persistence")

_db_ready = False


async def init_database() -> bool:
    global _db_ready
    try:
        async def _setup() -> None:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)

        await asyncio.wait_for(_setup(), timeout=5)
        _db_ready = True
        logger.info("Database connected and schema ready")
        return True
    except Exception as exc:
        _db_ready = False
        logger.warning("Database unavailable — running in memory mode: %s", exc)
        return False


def database_ready() -> bool:
    return _db_ready


async def persist_snapshot() -> None:
    if not _db_ready:
        return
    state = get_public_state()
    tick = int(state.get("tick", 0))
    if tick == 0 or tick % settings.snapshot_interval != 0:
        return
    try:
        async with async_session() as session:
            session.add(
                SimulationSnapshot(
                    tenant=settings.default_tenant,
                    tick=tick,
                    city_health=float(state.get("metrics", {}).get("city_health", 0)),
                    payload_json=json.dumps(state, default=str),
                )
            )
            await session.commit()
    except Exception as exc:
        logger.warning("Snapshot persist failed: %s", exc)


async def save_sos_report(
    latitude: float,
    longitude: float,
    message: str,
    contact: str | None = None,
    status: str = "open",
) -> dict[str, Any] | None:
    if not _db_ready:
        return None
    try:
        async with async_session() as session:
            row = SOSReport(
                tenant=settings.default_tenant,
                latitude=latitude,
                longitude=longitude,
                message=message,
                contact=contact,
                status=status,
            )
            session.add(row)
            await session.commit()
            await session.refresh(row)
            return {"db_id": row.id, "created_at": row.created_at.isoformat()}
    except Exception as exc:
        logger.warning("SOS persist failed: %s", exc)
        return None


async def list_sos_reports(limit: int = 20) -> list[dict[str, Any]]:
    if not _db_ready:
        return []
    try:
        async with async_session() as session:
            result = await session.execute(
                select(SOSReport).order_by(SOSReport.id.desc()).limit(limit)
            )
            rows = result.scalars().all()
            return [
                {
                    "id": str(r.id),
                    "latitude": r.latitude,
                    "longitude": r.longitude,
                    "message": r.message,
                    "contact": r.contact,
                    "status": r.status,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in rows
            ]
    except Exception as exc:
        logger.warning("SOS list failed: %s", exc)
        return []


async def get_platform_metrics() -> dict[str, Any]:
    metrics: dict[str, Any] = {
        "database_connected": _db_ready,
        "auth_required": settings.auth_required,
        "default_tenant": settings.default_tenant,
    }
    if _db_ready:
        try:
            async with async_session() as session:
                snap_count = await session.scalar(select(func.count()).select_from(SimulationSnapshot))
                sos_count = await session.scalar(select(func.count()).select_from(SOSReport))
                contact_count = await session.scalar(select(func.count()).select_from(ContactMessage))
                metrics["snapshots_total"] = snap_count or 0
                metrics["sos_reports_total"] = sos_count or 0
                metrics["contact_messages_total"] = contact_count or 0
        except Exception:
            pass
    return metrics


async def save_contact_message(name: str, email: str, message: str) -> dict[str, Any] | None:
    if not _db_ready:
        return None
    try:
        async with async_session() as session:
            row = ContactMessage(
                tenant=settings.default_tenant,
                name=name.strip() or "Anonymous",
                email=email.strip(),
                message=message.strip(),
                status="new",
            )
            session.add(row)
            await session.commit()
            await session.refresh(row)
            return {
                "id": str(row.id),
                "name": row.name,
                "email": row.email,
                "message": row.message,
                "status": row.status,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
    except Exception as exc:
        logger.warning("Contact message persist failed: %s", exc)
        return None


async def list_contact_messages(limit: int = 50) -> list[dict[str, Any]]:
    if not _db_ready:
        return []
    try:
        async with async_session() as session:
            result = await session.execute(
                select(ContactMessage).order_by(ContactMessage.id.desc()).limit(limit)
            )
            rows = result.scalars().all()
            return [
                {
                    "id": str(r.id),
                    "name": r.name,
                    "email": r.email,
                    "message": r.message,
                    "status": r.status,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in rows
            ]
    except Exception as exc:
        logger.warning("Contact message list failed: %s", exc)
        return []


async def update_sos_status(report_id: int, status: str) -> dict[str, Any] | None:
    if not _db_ready:
        return None
    try:
        async with async_session() as session:
            result = await session.execute(select(SOSReport).where(SOSReport.id == report_id))
            row = result.scalar_one_or_none()
            if not row:
                return None
            row.status = status
            await session.commit()
            await session.refresh(row)
            return {
                "id": str(row.id),
                "latitude": row.latitude,
                "longitude": row.longitude,
                "message": row.message,
                "contact": row.contact,
                "status": row.status,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
    except Exception as exc:
        logger.warning("SOS status update failed: %s", exc)
        return None


async def update_contact_message_status(message_id: int, status: str) -> dict[str, Any] | None:
    if not _db_ready:
        return None
    try:
        async with async_session() as session:
            result = await session.execute(
                select(ContactMessage).where(ContactMessage.id == message_id)
            )
            row = result.scalar_one_or_none()
            if not row:
                return None
            row.status = status
            await session.commit()
            await session.refresh(row)
            return {
                "id": str(row.id),
                "name": row.name,
                "email": row.email,
                "message": row.message,
                "status": row.status,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
    except Exception as exc:
        logger.warning("Contact message update failed: %s", exc)
        return None
