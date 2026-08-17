"""Scenario library — preset crisis scenarios for one-click launch."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.deps import require_user
from app.engine.simulator import simulator
from app.services.creative_modules import creative_modules
from app.services.immersive_modules import immersive_modules
from app.services.platform import get_public_state

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

SCENARIO_PRESETS: list[dict[str, Any]] = [
    {
        "id": "virginia_2011",
        "name": "Virginia Earthquake 2011",
        "name_fa": "زلزله ویرجینیا ۲۰۱۱",
        "description": "M5.8 quake felt across DC — infrastructure stress test",
        "disaster_type": "earthquake",
        "magnitude": 5.8,
        "radius": 600,
        "latitude": 38.9072,
        "longitude": -77.0369,
        "city_id": "dc",
        "locale": "en",
    },
    {
        "id": "tehran_earthquake",
        "name": "Tehran Earthquake Scenario",
        "name_fa": "سناریوی زلزله تهران",
        "description": "Major quake in Tehran metropolitan area — Persian-first crisis mode",
        "disaster_type": "earthquake",
        "magnitude": 7.2,
        "radius": 1200,
        "latitude": 35.6892,
        "longitude": 51.389,
        "city_id": "teh",
        "locale": "fa",
    },
    {
        "id": "dc_flood",
        "name": "Potomac Flood Surge",
        "name_fa": "سیلاب پotomac",
        "description": "Double rainfall event — water network cascade",
        "disaster_type": "flood",
        "magnitude": 8,
        "radius": 1000,
        "latitude": 38.895,
        "longitude": -77.042,
        "city_id": "dc",
        "locale": "en",
    },
    {
        "id": "grid_blackout",
        "name": "Grid Blackout Cascade",
        "name_fa": "قطعی سراسری برق",
        "description": "Power grid failure with hospital overload",
        "disaster_type": "blackout",
        "magnitude": 9,
        "radius": 1500,
        "latitude": 38.9072,
        "longitude": -77.0369,
        "city_id": "dc",
        "locale": "en",
    },
    {
        "id": "katrina_style",
        "name": "Hurricane Landfall",
        "name_fa": "طوفان ساحلی",
        "description": "Katrina-style hurricane — transport and shelter stress",
        "disaster_type": "hurricane",
        "magnitude": 7,
        "radius": 2000,
        "latitude": 38.88,
        "longitude": -77.05,
        "city_id": "dc",
        "locale": "en",
    },
    {
        "id": "crisis_60",
        "name": "Crisis in 60 Seconds",
        "name_fa": "بحران در ۶۰ ثانیه",
        "description": "Full demo flow — disaster, debate, recovery, cinema",
        "disaster_type": "earthquake",
        "magnitude": 6.5,
        "radius": 800,
        "latitude": 38.9072,
        "longitude": -77.0369,
        "city_id": "dc",
        "locale": "en",
        "auto_recovery": True,
        "auto_cinema": True,
        "auto_debate": True,
    },
]


class RunScenarioRequest(BaseModel):
    scenario_id: str = Field(min_length=1)


@router.get("")
async def list_scenarios() -> dict[str, Any]:
    return {"scenarios": SCENARIO_PRESETS}


@router.post("/run")
async def run_scenario(body: RunScenarioRequest, _user=Depends(require_user)) -> dict[str, Any]:
    preset = next((s for s in SCENARIO_PRESETS if s["id"] == body.scenario_id), None)
    if not preset:
        return {"ok": False, "error": "unknown_scenario"}

    city_id = preset.get("city_id", "dc")
    creative_modules.select_city(city_id)

    simulator.trigger_disaster(
        preset["disaster_type"],
        preset["latitude"],
        preset["longitude"],
        preset["magnitude"],
        preset["radius"],
    )

    if preset.get("auto_recovery"):
        simulator.toggle_recovery(True)

    if preset.get("auto_debate"):
        damaged = [n for n in simulator.state.nodes if n.health < 90]
        simulator.state.last_debate = simulator._run_debate(damaged)

    cinema = None
    if preset.get("auto_cinema"):
        cinema = immersive_modules.start_cinema(simulator, preset.get("locale", "en"))

    return {
        "ok": True,
        "scenario": preset,
        "city_id": city_id,
        "cinema": cinema,
        "state": get_public_state(),
    }
