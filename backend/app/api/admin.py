"""Admin panel API — ops dashboard, SOS, intel, inbox, city controls."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.auth import get_current_user
from app.api.contact import list_memory_messages, update_memory_status
from app.core.config import settings
from app.engine.simulator import simulator
from app.models.schemas import ContactStatusUpdate, GodModeRequest
from app.services.creative_modules import creative_modules
from app.services.live_engine import live_engine
from app.services.persistence import (
    get_platform_metrics,
    list_contact_messages,
    list_sos_reports,
    update_contact_message_status,
    update_sos_status,
)
from app.services.platform import get_public_state, reset_platform
from app.api.websocket import broadcast_event, broadcast_state

router = APIRouter(prefix="/admin", tags=["admin"])


class SosStatusUpdate(BaseModel):
    status: str = Field(min_length=2, max_length=32)
    note: str = ""


async def require_admin(
    user: Annotated[dict[str, Any] | None, Depends(get_current_user)],
) -> dict[str, Any]:
    if not user:
        if not settings.auth_required:
            return {"username": "guest", "role": "admin", "tenant": settings.default_tenant}
        raise HTTPException(401, "Authentication required")
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user


def _merge_sos() -> list[dict[str, Any]]:
    memory = creative_modules.list_sos(40)
    return memory


@router.get("/overview")
async def get_overview(
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
) -> dict[str, Any]:
    state = get_public_state()
    metrics = state.get("metrics") or {}
    sos = _merge_sos()
    intel = creative_modules.list_intel(40)
    db_sos = await list_sos_reports(20)
    inbox = await list_contact_messages(20)
    memory_inbox = list_memory_messages(20)
    platform = await get_platform_metrics()
    return {
        "tick": state.get("tick"),
        "city_health": metrics.get("city_health"),
        "metrics": metrics,
        "active_disaster": state.get("active_disaster"),
        "recovery_enabled": state.get("recovery_enabled"),
        "vehicles": len(state.get("vehicles") or []),
        "agents": state.get("active_agents") or [],
        "sos_count": len(sos) or len(db_sos),
        "intel_count": len(intel),
        "inbox_count": len(inbox) + len(memory_inbox),
        "platform": platform,
        "nodes": [
            {
                "id": n.id,
                "name": n.name,
                "type": n.type,
                "health": n.health,
                "status": n.status.value if hasattr(n.status, "value") else n.status,
            }
            for n in simulator.state.nodes
            if n.health < 80
        ][:8],
    }


@router.get("/sos")
async def get_sos(
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
) -> dict[str, Any]:
    memory = _merge_sos()
    db_reports = await list_sos_reports(40)
    seen: set[str] = {str(r.get("id")) for r in memory}
    merged = list(memory)
    for row in db_reports:
        if str(row.get("id")) not in seen:
            merged.append(row)
    return {"reports": merged, "total": len(merged)}


@router.patch("/sos/{sos_id}")
async def patch_sos(
    sos_id: str,
    body: SosStatusUpdate,
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
) -> dict[str, Any]:
    updated = creative_modules.set_sos_status(sos_id, body.status, body.note)
    if not updated and sos_id.isdigit():
        updated = await update_sos_status(int(sos_id), body.status)
    if not updated:
        raise HTTPException(404, "SOS not found")
    if body.status == "dispatched":
        vehicle = live_engine.dispatch_to_location(
            float(updated.get("latitude") or settings.city_center_lat),
            float(updated.get("longitude") or settings.city_center_lng),
        )
        updated["vehicle_id"] = vehicle.id
        await broadcast_event("sos_dispatch", {"report": updated, "vehicle": vehicle.model_dump()})
    await broadcast_state()
    return {"ok": True, "report": updated}


@router.get("/intel")
async def get_intel(
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
) -> dict[str, Any]:
    reports = creative_modules.list_intel(50)
    return {"reports": reports, "total": len(reports)}


@router.post("/god-mode")
async def admin_god_mode(
    body: GodModeRequest,
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
) -> dict[str, Any]:
    simulator.god_mode(body.action, body.node_id)
    await broadcast_state()
    return {"ok": True, "state": get_public_state()}


@router.post("/reset")
async def admin_reset(
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
) -> dict[str, Any]:
    state = reset_platform()
    await broadcast_state()
    return {"ok": True, "state": state}


@router.get("/messages")
async def get_messages(
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
    limit: int = 50,
) -> dict[str, Any]:
    db_messages = await list_contact_messages(limit)
    memory_messages = list_memory_messages(limit)

    seen_ids: set[str] = set()
    merged: list[dict[str, Any]] = []

    for msg in db_messages:
        mid = str(msg["id"])
        if mid not in seen_ids:
            seen_ids.add(mid)
            merged.append(msg)

    for msg in memory_messages:
        mid = str(msg["id"])
        if mid not in seen_ids:
            seen_ids.add(mid)
            merged.append(msg)

    merged.sort(key=lambda m: m.get("created_at") or "", reverse=True)
    new_count = sum(1 for m in merged if m.get("status") == "new")

    return {
        "messages": merged[:limit],
        "total": len(merged),
        "new_count": new_count,
    }


@router.patch("/messages/{message_id}")
async def patch_message_status(
    message_id: str,
    body: ContactStatusUpdate,
    _admin: Annotated[dict[str, Any], Depends(require_admin)],
) -> dict[str, Any]:
    updated = None
    if message_id.isdigit():
        updated = await update_contact_message_status(int(message_id), body.status)
    if not updated:
        updated = update_memory_status(message_id, body.status)
    if not updated:
        raise HTTPException(404, "Message not found")
    return {"ok": True, "message": updated}
