"""Citizen platform API — SOS, routes, shelters, family safety."""

from __future__ import annotations

import math
import uuid
from typing import Any

from fastapi import APIRouter

from app.core.config import settings
from app.engine.simulator import simulator
from app.models.schemas import CitizenChatRequest, FamilyCheckRequest, SafeRouteRequest, SOSRequest
from app.services.llm_router import llm_router
from app.services.persistence import list_sos_reports, save_sos_report

router = APIRouter(prefix="/citizen", tags=["citizen"])

_SOS_STORE: list[dict[str, Any]] = []
_FAMILY_REGISTRY: dict[str, dict[str, Any]] = {
    "fam-001": {"name": "Alex Rivera", "name_fa": "الکس ریورا", "status": "safe", "lat": 38.9072, "lng": -77.0369},
    "fam-002": {"name": "Jordan Hale", "name_fa": "جردن هیل", "status": "evacuating", "lat": 38.8951, "lng": -77.0365},
    "fam-003": {"name": "Maya Chen", "name_fa": "مایا چن", "status": "safe", "lat": 38.9101, "lng": -77.0447},
    "fam-004": {"name": "Sam Okonkwo", "name_fa": "سام اوکونکو", "status": "shelter", "lat": 38.8898, "lng": -76.9925},
}


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


@router.get("/shelters")
async def list_shelters() -> dict[str, Any]:
    shelters = []
    for node in simulator.state.nodes:
        if node.type in ("hospital", "warehouse", "residential") and node.health > 30:
            shelters.append({
                "id": node.id,
                "name": node.name,
                "latitude": node.latitude,
                "longitude": node.longitude,
                "capacity_pct": node.capacity,
                "status": node.status.value,
            })
    shelters.sort(key=lambda s: s["capacity_pct"], reverse=True)
    return {"shelters": shelters[:12]}


@router.post("/sos")
async def submit_sos(body: SOSRequest) -> dict[str, Any]:
    from app.services.creative_modules import creative_modules
    from app.services.live_engine import live_engine
    from app.api.websocket import broadcast_event, broadcast_state

    report = {
        "id": str(uuid.uuid4())[:8],
        "latitude": body.latitude,
        "longitude": body.longitude,
        "message": body.message,
        "contact": body.contact,
        "status": "dispatched",
        "eta_minutes": 8,
    }
    _SOS_STORE.append(report)
    db_meta = await save_sos_report(body.latitude, body.longitude, body.message, body.contact, "dispatched")
    if db_meta:
        report["db_id"] = db_meta["db_id"]
    synced = creative_modules.register_sos(report)
    vehicle = live_engine.dispatch_to_location(body.latitude, body.longitude)
    await broadcast_event("sos", {"report": synced, "vehicle": vehicle.model_dump()})
    await broadcast_state()
    return {"ok": True, "report": report, "synced": synced, "vehicle_id": vehicle.id}


@router.get("/sos/active")
async def active_sos() -> dict[str, Any]:
    db_reports = await list_sos_reports(20)
    if db_reports:
        return {"reports": db_reports}
    return {"reports": _SOS_STORE[-20:]}


@router.post("/route/safe")
async def safe_route(body: SafeRouteRequest) -> dict[str, Any]:
    dest_lat = body.to_latitude or settings.city_center_lat + 0.01
    dest_lng = body.to_longitude or settings.city_center_lng - 0.01
    waypoints = [
        {"latitude": body.from_latitude, "longitude": body.from_longitude},
        {"latitude": (body.from_latitude + dest_lat) / 2, "longitude": body.from_longitude},
        {"latitude": dest_lat, "longitude": dest_lng},
    ]
    risk = "moderate" if simulator.state.active_disaster else "low"
    return {
        "distance_km": round(_haversine_km(body.from_latitude, body.from_longitude, dest_lat, dest_lng), 2),
        "eta_minutes": 18,
        "risk_level": risk,
        "waypoints": waypoints,
        "avoid_zones": [
            {"latitude": n.latitude, "longitude": n.longitude, "reason": n.name}
            for n in simulator.state.nodes
            if n.health < 30
        ][:5],
    }


@router.post("/family/check")
async def family_check(body: FamilyCheckRequest) -> dict[str, Any]:
    members = []
    for mid in body.member_ids or list(_FAMILY_REGISTRY.keys()):
        m = _FAMILY_REGISTRY.get(mid)
        if m:
            members.append({"id": mid, **m})
    return {"members": members}


@router.post("/assistant")
async def citizen_assistant(body: CitizenChatRequest) -> dict[str, Any]:
    result = await llm_router.chat("citizen", body.message, body.context)
    return result
