"""Grid city simulation — 30×30 builder, NSGA-II, Q-Learning, PPO."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.engine.grid_simulator import grid_simulator
from app.engine.impact_matrix import BUILDING_COSTS, BUILDING_LABELS, BUILDABLE_TYPES, impact_matrix_rows
from app.engine.optimizer import run_nsga2
from app.engine.rl_agents import ppo_step, ppo_train, q_learning_step, q_learning_train
from app.models.schemas import GridApplyPlanRequest, GridBuildRequest, GridOptimizeRequest, GridRLTrainRequest, GridStepRequest

router = APIRouter(prefix="/grid-sim", tags=["grid-simulation"])


@router.get("/impact-matrix")
async def get_impact_matrix() -> dict[str, Any]:
    return {
        "rows": impact_matrix_rows(),
        "buildings": {s: BUILDING_LABELS[s] for s in BUILDABLE_TYPES},
        "costs": BUILDING_COSTS,
    }


@router.get("/state")
async def get_grid_state() -> dict[str, Any]:
    return grid_simulator.get_state()


@router.get("/export")
async def export_grid_city() -> JSONResponse:
    return JSONResponse(
        content={
            "format": "nexus_grid_city_v1",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "state": grid_simulator.get_state(),
            "impact_matrix": impact_matrix_rows(),
            "buildings": {s: BUILDING_LABELS[s] for s in BUILDABLE_TYPES},
            "costs": BUILDING_COSTS,
        },
        headers={"Content-Disposition": "attachment; filename=nexus-grid-city-export.json"},
    )


@router.post("/reset")
async def reset_grid() -> dict[str, Any]:
    grid_simulator.reset()
    return {"ok": True, "state": grid_simulator.get_state()}


@router.post("/build")
async def build_on_grid(body: GridBuildRequest) -> dict[str, Any]:
    ok, msg = grid_simulator.build(body.x, body.y, body.building)
    grid_simulator._recalculate()
    return {"ok": ok, "msg": msg, "state": grid_simulator.get_state()}


@router.post("/step")
async def step_grid(body: GridStepRequest) -> dict[str, Any]:
    action = None
    if body.x is not None and body.y is not None and body.building:
        action = (body.x, body.y, body.building)
    state, reward, done, info = grid_simulator.step(action)
    return {"state": state, "reward": reward, "done": done, **info}


@router.post("/optimize")
async def optimize_grid(body: GridOptimizeRequest) -> dict[str, Any]:
    result = run_nsga2(
        population_size=body.population_size,
        generations=body.generations,
        max_buildings=body.max_buildings,
        simulation_steps=body.simulation_steps,
    )
    return result


@router.post("/apply-plan")
async def apply_plan(body: GridApplyPlanRequest) -> dict[str, Any]:
    grid_simulator.reset()
    ok = grid_simulator.place_plan(body.plan)
    return {"ok": ok, "state": grid_simulator.get_state(), "plan": body.plan}


@router.post("/rl/step")
async def rl_step(algorithm: str = "q_learning") -> dict[str, Any]:
    if algorithm == "ppo":
        result = ppo_step(grid_simulator)
    else:
        result = q_learning_step(grid_simulator)
    return {**result, "state": grid_simulator.get_state()}


@router.post("/rl/train")
async def rl_train(body: GridRLTrainRequest) -> dict[str, Any]:
    results: dict[str, Any] = {}
    if body.algorithm in ("q_learning", "both"):
        results["q_learning"] = q_learning_train(body.episodes, body.steps_per_episode)
    if body.algorithm in ("ppo", "both"):
        results["ppo"] = ppo_train(body.episodes, body.steps_per_episode)
    return results
