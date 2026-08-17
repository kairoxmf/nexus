"""Creative feature module API."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.engine.simulator import simulator
from app.services.creative_modules import creative_modules, PRESET_CITIES
from app.services.live_engine import live_engine
from app.services.platform import get_public_state

router = APIRouter(prefix="/creative", tags=["creative"])


class WarRoomDecision(BaseModel):
    role: str = Field(pattern="^(mayor|fema|media)$")
    decision: str


class EarlyWarningStart(BaseModel):
    disaster_type: str = "earthquake"
    magnitude: float = 6
    hours: float = 72
    latitude: float = 38.9072
    longitude: float = -77.0369
    radius: float = 800


class PreparednessAction(BaseModel):
    action: str


class ButterflyStart(BaseModel):
    strategy_a: str = "Repair Central Bridge"
    strategy_b: str = "Restore Hospital Power"


class DilemmaChoice(BaseModel):
    choice: str = Field(pattern="^(a|b)$")


class VoiceCommand(BaseModel):
    transcript: str


class CitySelect(BaseModel):
    city_id: str
    custom_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class IntelReport(BaseModel):
    latitude: float
    longitude: float
    message: str
    category: str = "general"
    verified: bool = False


class SOSDispatchRequest(BaseModel):
    sos_id: str
    unit_type: str = "ambulance"
    message: str | None = None


@router.get("/state")
async def creative_state() -> dict[str, Any]:
    return get_public_state().get("creative", {})


@router.get("/cities")
async def list_cities() -> dict[str, Any]:
    return {"presets": PRESET_CITIES, "active": creative_modules._active_city}


@router.post("/war-room/start")
async def start_war_room() -> dict[str, Any]:
    return {**creative_modules.start_war_room(), "state": get_public_state()}


@router.post("/war-room/decision")
async def war_room_decision(body: WarRoomDecision) -> dict[str, Any]:
    return {**creative_modules.submit_war_room_decision(body.role, body.decision), "state": get_public_state()}


@router.post("/early-warning/start")
async def start_early_warning(body: EarlyWarningStart) -> dict[str, Any]:
    return {**creative_modules.start_early_warning(
        body.disaster_type, body.magnitude, body.hours, body.latitude, body.longitude, body.radius
    ), "state": get_public_state()}


@router.post("/early-warning/prepare")
async def preparedness(body: PreparednessAction) -> dict[str, Any]:
    return {**creative_modules.add_preparedness_action(body.action), "state": get_public_state()}


@router.post("/butterfly/start")
async def start_butterfly(body: ButterflyStart) -> dict[str, Any]:
    return {**creative_modules.start_butterfly(body.strategy_a, body.strategy_b), "state": get_public_state()}


@router.post("/dilemma/resolve")
async def resolve_dilemma(body: DilemmaChoice) -> dict[str, Any]:
    return {**creative_modules.resolve_dilemma(body.choice), "state": get_public_state()}


@router.post("/voice/command")
async def voice_command(body: VoiceCommand) -> dict[str, Any]:
    result = creative_modules.parse_voice_command(body.transcript)
    action = result.get("action") or {}
    if action.get("type") == "dispatch_sos_response" and creative_modules._sos_reports:
        sos = creative_modules._sos_reports[0]
        live_engine.dispatch_to_location(sos["latitude"], sos["longitude"])
    return {**result, "state": get_public_state()}


@router.post("/podcast/generate")
async def generate_podcast() -> dict[str, Any]:
    podcast = creative_modules.generate_podcast(simulator)
    return {"ok": True, "podcast": podcast, "state": get_public_state()}


@router.post("/city/select")
async def select_city(body: CitySelect) -> dict[str, Any]:
    return {**creative_modules.select_city(body.city_id, body.custom_name, body.latitude, body.longitude), "state": get_public_state()}


@router.post("/intel/report")
async def submit_intel(body: IntelReport) -> dict[str, Any]:
    entry = creative_modules.register_intel(body.model_dump())
    return {"ok": True, "report": entry, "state": get_public_state()}


@router.post("/sos/dispatch")
async def dispatch_sos(body: SOSDispatchRequest) -> dict[str, Any]:
    from app.api.websocket import broadcast_event, broadcast_state

    reports = creative_modules._sos_reports
    report = next((r for r in reports if r.get("id") == body.sos_id), None)
    if not report:
        return {"ok": False, "error": "sos_not_found"}

    vehicle = live_engine.dispatch_to_location(report["latitude"], report["longitude"])
    report["status"] = "dispatched"
    report["unit_type"] = body.unit_type
    report["commander_note"] = body.message or "Unit dispatched from Command Center"
    report["eta_minutes"] = max(3, report.get("eta_minutes", 8) - 2)

    await broadcast_event("sos_dispatch", {"report": report, "vehicle": vehicle.model_dump()})
    await broadcast_state()
    return {"ok": True, "report": report, "vehicle": vehicle.model_dump(), "state": get_public_state()}


@router.get("/news/feed")
async def news_feed() -> dict[str, Any]:
    payload = creative_modules.public_payload(simulator, live_engine)
    return payload["news_network"]
