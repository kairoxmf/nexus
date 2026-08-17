"""REST API routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_user
from app.engine.city_data import DISASTER_CONFIG
from app.engine.simulator import simulator
from app.services.platform import get_public_state, reset_platform
from app.models.schemas import GodModeRequest, StrategyComparisonRequest, TriggerDisasterRequest, WhatIfRequest

router = APIRouter(prefix="/api/v1")


@router.get("")
async def platform_info() -> dict[str, Any]:
    return {
        "platform": "NEXUS City Recovery",
        "version": "1.0.0",
        "description": "AI-powered autonomous city recovery and crisis simulation",
        "modules": [
            "digital_twin", "crisis_sandbox", "god_mode", "multi_agent_ai",
            "ai_debate", "explainable_ai", "prediction_engine", "what_if",
            "autonomous_recovery", "replay", "city_dna", "simulation_lab",
            "live_units", "citizen_platform", "multi_llm", "auth", "persistence",
        ],
    }


@router.get("/state")
async def get_state() -> dict[str, Any]:
    return get_public_state()


@router.post("/state/reset")
async def reset_state(_user=Depends(require_user)) -> dict[str, Any]:
    return reset_platform()


@router.get("/city/nodes")
async def get_nodes() -> dict[str, Any]:
    return {"nodes": [n.model_dump() for n in simulator.state.nodes]}


@router.get("/city/roads")
async def get_roads() -> dict[str, Any]:
    return {"roads": simulator.get_roads()}


@router.get("/disasters")
async def list_disasters() -> dict[str, Any]:
    return {
        "disasters": [
            {"id": k, "label": v["label"], "color": v["color"]}
            for k, v in DISASTER_CONFIG.items()
        ]
    }


@router.post("/disaster/trigger")
async def trigger_disaster(body: TriggerDisasterRequest, _user=Depends(require_user)) -> dict[str, Any]:
    simulator.trigger_disaster(
        body.disaster_type,
        body.latitude,
        body.longitude,
        body.magnitude,
        body.radius,
    )
    return get_public_state()


@router.post("/recovery/toggle")
async def toggle_recovery(enabled: bool = True, _user=Depends(require_user)) -> dict[str, Any]:
    simulator.toggle_recovery(enabled)
    return get_public_state()


@router.post("/god-mode")
async def god_mode(body: GodModeRequest, _user=Depends(require_user)) -> dict[str, Any]:
    simulator.god_mode(body.action, body.node_id)
    return get_public_state()


@router.get("/predictions")
async def get_predictions() -> dict[str, Any]:
    return {"predictions": [p.model_dump() for p in simulator.generate_predictions()]}


@router.post("/what-if")
async def what_if(body: WhatIfRequest) -> dict[str, Any]:
    return simulator.what_if(body.scenario, body.node_id, body.magnitude_multiplier)


@router.get("/cascade-chain")
async def cascade_chain() -> dict[str, Any]:
    return {"chains": simulator.get_cascade_chain()}


@router.get("/metrics")
async def metrics() -> dict[str, Any]:
    return simulator.state.metrics.model_dump()


@router.get("/city-dna")
async def city_dna() -> dict[str, Any]:
    return {"dna": simulator.state.city_dna}


@router.get("/debate/latest")
async def latest_debate() -> dict[str, Any]:
    if not simulator.state.last_debate:
        raise HTTPException(404, "No debate recorded yet")
    return simulator.state.last_debate.model_dump()


@router.get("/replay/{index}")
async def replay_at(index: int) -> dict[str, Any]:
    snap = simulator.replay_at(index)
    if not snap:
        raise HTTPException(404, "Replay index out of range")
    return snap


@router.get("/replay/count")
async def replay_count() -> dict[str, int]:
    return {"count": simulator.replay_count}


@router.post("/strategy/compare")
async def compare_strategies(body: StrategyComparisonRequest) -> dict[str, Any]:
    base_health = simulator.state.metrics.city_health
    results = []
    labels = {
        "minimize_deaths": "Minimize Deaths",
        "minimize_cost": "Minimize Economic Loss",
        "fastest_recovery": "Fastest Recovery",
        "balanced": "Balanced Optimization",
    }
    for i, s in enumerate(body.strategies):
        score = base_health + (i + 1) * 3.5 - len([n for n in simulator.state.nodes if n.health < 50]) * 2
        results.append({
            "strategy": s,
            "label": labels.get(s, s),
            "projected_recovery": round(min(100, max(0, score + 15)), 1),
            "lives_saved_index": round(min(100, score + 10), 1),
            "economic_cost_index": round(max(0, 100 - score + 20), 1),
            "time_to_recovery_hours": round(max(12, 120 - score), 0),
        })
    return {"strategies": results, "current_health": base_health}


@router.get("/agents")
async def list_agents() -> dict[str, Any]:
    agents = [
        "Commander AI", "Emergency AI", "Medical AI", "Transportation AI",
        "Power AI", "Water AI", "Fire AI", "Police AI", "Food AI",
        "Construction AI", "Economic AI", "Communication AI",
    ]
    return {
        "agents": agents,
        "active": simulator.state.active_agents,
    }
