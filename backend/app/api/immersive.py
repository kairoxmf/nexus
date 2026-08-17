"""Phase 9 Immersive Crisis API."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.engine.simulator import simulator
from app.services.immersive_modules import immersive_modules
from app.services.live_engine import live_engine
from app.services.platform import get_public_state
from app.api.websocket import broadcast_state

router = APIRouter(prefix="/immersive", tags=["immersive"])


class CinemaStart(BaseModel):
    locale: str = "en"


class NegotiationStart(BaseModel):
    city_id: str = "nyc"
    offer: str = "500 MW emergency power + 200 medical beds"


class HistoricalReplay(BaseModel):
    event_id: str = "virginia_2011"


class VoiceCommand(BaseModel):
    transcript: str
    locale: str = "en"


class ArRoute(BaseModel):
    from_latitude: float = 38.9072
    from_longitude: float = -77.0369


class PushAlert(BaseModel):
    title: str = "Crisis Alert"
    body: str = "Emergency notification from NEXUS Citizen App"
    title_fa: str = ""
    body_fa: str = ""


class Crisis2v2Start(BaseModel):
    team_a: str = "Recovery Alpha"
    team_b: str = "Recovery Beta"


@router.get("/state")
async def immersive_state() -> dict[str, Any]:
    return get_public_state().get("immersive", {})


@router.post("/cinema/start")
async def start_cinema(body: CinemaStart) -> dict[str, Any]:
    result = {**immersive_modules.start_cinema(simulator, body.locale), "state": get_public_state()}
    await broadcast_state()
    return result


@router.post("/cinema/stop")
async def stop_cinema() -> dict[str, Any]:
    result = {**immersive_modules.stop_cinema(), "state": get_public_state()}
    await broadcast_state()
    return result


@router.post("/climate/start")
async def start_climate() -> dict[str, Any]:
    return {**immersive_modules.start_climate_2050(), "state": get_public_state()}


@router.post("/diplomatic/negotiate")
async def negotiate(body: NegotiationStart) -> dict[str, Any]:
    return {**immersive_modules.start_diplomatic_negotiation(body.city_id, body.offer), "state": get_public_state()}


@router.post("/historical/replay")
async def historical_replay(body: HistoricalReplay) -> dict[str, Any]:
    return {**immersive_modules.start_historical_replay(body.event_id), "state": get_public_state()}


@router.post("/spectator/enable")
async def enable_spectator() -> dict[str, Any]:
    return {**immersive_modules.enable_spectator(), "state": get_public_state()}


@router.post("/multiplayer/2v2/start")
async def start_2v2(body: Crisis2v2Start) -> dict[str, Any]:
    return {**immersive_modules.start_2v2(body.team_a, body.team_b), "state": get_public_state()}


@router.post("/voice/command")
async def voice_command(body: VoiceCommand) -> dict[str, Any]:
    return {**immersive_modules.voice_command(body.transcript, body.locale), "state": get_public_state()}


@router.post("/ar/route")
async def ar_route(body: ArRoute) -> dict[str, Any]:
    return {**immersive_modules.generate_ar_route(body.from_latitude, body.from_longitude), "state": get_public_state()}


@router.post("/push/send")
async def push_send(body: PushAlert) -> dict[str, Any]:
    return {**immersive_modules.send_push_alert(body.title, body.body, body.title_fa, body.body_fa), "state": get_public_state()}


@router.post("/push/subscribe")
async def push_subscribe() -> dict[str, Any]:
    return {**immersive_modules.subscribe_push(), "state": get_public_state()}


@router.get("/briefing/fa")
async def persian_briefing() -> dict[str, Any]:
    payload = immersive_modules.public_payload(simulator, live_engine)
    return payload.get("persian_ai", {})
