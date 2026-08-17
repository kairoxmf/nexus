"""Extended module API — Games, Advanced AI, Realism, Organizational."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.engine.simulator import simulator
from app.services.extended_modules import extended_modules
from app.services.platform import get_public_state

router = APIRouter(prefix="/extended", tags=["extended"])


class EscapeStart(BaseModel):
    room_id: str = "substation_alpha"


class EscapeSolve(BaseModel):
    puzzle_id: str
    answer: str


class SpeedrunStart(BaseModel):
    category: str = "full_recovery"


class AdversarialToggle(BaseModel):
    active: bool


class SatelliteMessage(BaseModel):
    phone_id: str
    message: str


class OsmImport(BaseModel):
    city_id: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius_km: float = 5


class CertExam(BaseModel):
    module_id: str
    score: int = Field(ge=0, le=100)


class MarketOrder(BaseModel):
    resource: str
    quantity: float = Field(gt=0)
    side: str = Field(pattern="^(buy|sell)$")


@router.get("/state")
async def extended_state() -> dict[str, Any]:
    return get_public_state().get("extended", {})


@router.post("/escape/start")
async def start_escape(body: EscapeStart) -> dict[str, Any]:
    return {**extended_modules.start_escape_room(body.room_id), "state": get_public_state()}


@router.post("/escape/solve")
async def solve_escape(body: EscapeSolve) -> dict[str, Any]:
    return {**extended_modules.solve_escape_puzzle(body.puzzle_id, body.answer), "state": get_public_state()}


@router.post("/roulette/spin")
async def spin_roulette() -> dict[str, Any]:
    return {**extended_modules.spin_roulette(), "state": get_public_state()}


@router.post("/speedrun/start")
async def start_speedrun(body: SpeedrunStart) -> dict[str, Any]:
    return {**extended_modules.start_speedrun(body.category), "state": get_public_state()}


@router.post("/adversarial/toggle")
async def toggle_adversarial(body: AdversarialToggle) -> dict[str, Any]:
    return {**extended_modules.toggle_adversarial(body.active), "state": get_public_state()}


@router.post("/red-team/scan")
async def red_team_scan() -> dict[str, Any]:
    return {**extended_modules.run_red_team(simulator), "state": get_public_state()}


@router.post("/satellite/send")
async def satellite_send(body: SatelliteMessage) -> dict[str, Any]:
    return {**extended_modules.send_satellite_message(body.phone_id, body.message), "state": get_public_state()}


@router.post("/osm/import")
async def osm_import(body: OsmImport) -> dict[str, Any]:
    return {
        **extended_modules.import_osm(body.city_id, body.latitude, body.longitude, body.radius_km),
        "state": get_public_state(),
    }


@router.post("/certification/submit")
async def submit_cert(body: CertExam) -> dict[str, Any]:
    return {**extended_modules.submit_cert_exam(body.module_id, body.score), "state": get_public_state()}


@router.post("/marketplace/order")
async def marketplace_order(body: MarketOrder) -> dict[str, Any]:
    return {**extended_modules.marketplace_order(body.resource, body.quantity, body.side), "state": get_public_state()}


@router.get("/ledger/verify")
async def verify_ledger() -> dict[str, Any]:
    return extended_modules.verify_ledger()


@router.get("/ledger/export")
async def export_ledger() -> JSONResponse:
    data = extended_modules.export_ledger()
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": "attachment; filename=nexus-blockchain-ledger.json"},
    )
