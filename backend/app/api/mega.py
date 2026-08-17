"""Mega feature module API — Federated Network, Challenge, Social, Black Box, etc."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.engine.simulator import simulator
from app.services.live_engine import live_engine
from app.services.mega_modules import mega_modules
from app.services.platform import get_public_state

router = APIRouter(prefix="/mega", tags=["mega"])


class ChallengeStart(BaseModel):
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard|expert)$")
    human_strategy: str = "Community-first gradual response"


class HumanDecision(BaseModel):
    phase: str
    decision: str


class CommanderChat(BaseModel):
    message: str


@router.get("/state")
async def mega_state() -> dict[str, Any]:
    return get_public_state().get("mega", {})


@router.post("/challenge/start")
async def start_challenge(body: ChallengeStart) -> dict[str, Any]:
    result = mega_modules.start_challenge(body.difficulty, body.human_strategy)
    return {**result, "state": get_public_state()}


@router.post("/challenge/decision")
async def submit_decision(body: HumanDecision) -> dict[str, Any]:
    return {**mega_modules.submit_human_decision(body.phase, body.decision), "state": get_public_state()}


@router.get("/black-box/export")
async def export_black_box() -> JSONResponse:
    data = mega_modules.export_black_box()
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": "attachment; filename=nexus-black-box-export.json"},
    )


@router.post("/movie/generate")
async def generate_movie() -> dict[str, Any]:
    movie = mega_modules.regenerate_movie(simulator)
    return {"ok": True, "movie": movie}


@router.get("/movie/export")
async def export_movie() -> JSONResponse:
    data = mega_modules.export_movie()
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": "attachment; filename=nexus-disaster-movie-storyboard.json"},
    )


@router.post("/commander/chat")
async def commander_chat(body: CommanderChat) -> dict[str, Any]:
    msg = body.message.lower()
    if "hospital" in msg or "power" in msg:
        reply = "Hospital Alpha backup generators have 14 minutes remaining. Recommend immediate deployment of mobile power units to Sector 3."
    elif "evacuat" in msg:
        reply = "District 8 evacuation is recommended with 92% confidence. 3 helicopter corridors are available. Shall I initiate?"
    elif "bridge" in msg:
        reply = "Bridge 5 structural integrity at 42%. Collapse probability 92% within 2 hours. Close bridge and redirect traffic via I-395."
    else:
        reply = (
            f"Commander AI monitoring {len(simulator.state.nodes)} infrastructure nodes. "
            f"City health at {simulator.state.metrics.city_health:.0f}%. "
            "Ask about hospitals, evacuation, bridges, or resource allocation."
        )
    return {
        "response": reply,
        "confidence": 0.88,
        "alerts": mega_modules.public_payload(simulator, live_engine)["crisis_commander"]["alerts"][:5],
    }


@router.get("/federated/routes")
async def federated_routes() -> dict[str, Any]:
    payload = mega_modules.public_payload(simulator, live_engine)
    return {
        "routes": payload["federated_network"]["supply_routes"],
        "cities": payload["federated_network"]["cities"],
    }


@router.get("/social/feed")
async def social_feed(limit: int = 50) -> dict[str, Any]:
    payload = mega_modules.public_payload(simulator, live_engine)
    social = payload["social_network"]
    social["posts"] = social["posts"][:limit]
    return social


@router.get("/drones")
async def drone_swarm() -> dict[str, Any]:
    return mega_modules.public_payload(simulator, live_engine)["drone_swarm"]


@router.get("/knowledge/compare")
async def knowledge_compare() -> dict[str, Any]:
    return mega_modules.public_payload(simulator, live_engine)["knowledge_engine"]


@router.get("/failure-chains")
async def failure_chains() -> dict[str, Any]:
    return mega_modules.public_payload(simulator, live_engine)["failure_chain"]
