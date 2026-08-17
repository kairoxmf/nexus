"""Simulation lab endpoints — enhanced what-if and cascade analytics."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from app.engine.simulator import simulator
from app.models.schemas import WhatIfRequest
from app.services.briefing import generate_replay_report

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/what-if")
async def simulation_what_if(body: WhatIfRequest) -> dict[str, Any]:
    result = simulator.what_if(body.scenario, body.node_id, body.magnitude_multiplier)
    return {
        **result,
        "scenario": body.scenario,
        "recommendation": _recommend(body.scenario, result),
    }


@router.get("/cascade-graph")
async def cascade_graph() -> dict[str, Any]:
    chains = simulator.get_cascade_chain()
    nodes = []
    edges = []
    seen: set[str] = set()
    for chain in chains:
        target = chain["node"]
        if target not in seen:
            nodes.append({"id": target, "label": target, "status": chain["status"]})
            seen.add(target)
        for cause in chain.get("caused_by", []):
            if cause not in seen:
                nodes.append({"id": cause, "label": cause, "status": "failed"})
                seen.add(cause)
            edges.append({"source": cause, "target": target, "type": "cascade"})
        for dep in chain.get("dependents", []):
            if dep not in seen:
                nodes.append({"id": dep, "label": dep, "status": "at_risk"})
                seen.add(dep)
            edges.append({"source": target, "target": dep, "type": "dependency"})
    return {"nodes": nodes, "edges": edges, "chains": chains}


@router.get("/replay-report")
async def simulation_replay_report() -> dict[str, Any]:
    return generate_replay_report()


def _recommend(scenario: str, result: dict[str, Any]) -> str:
    health = result.get("projected_city_health", 0)
    if health < 40:
        return f"Scenario '{scenario}' is high risk. Pre-position medical and power assets before execution."
    if health < 70:
        return f"Scenario '{scenario}' causes moderate impact. Enable recovery mode and monitor cascade chains."
    return f"Scenario '{scenario}' is manageable with current resilience posture."
