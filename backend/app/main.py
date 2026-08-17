"""NEXUS City Recovery Platform — FastAPI Application."""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.auth import router as auth_router
from app.api.citizen import router as citizen_router
from app.api.ai import router as ai_router
from app.api.advanced import router as advanced_router
from app.api.mega import router as mega_router
from app.api.creative import router as creative_router
from app.api.extended import router as extended_router
from app.api.immersive import router as immersive_router
from app.api.contact import router as contact_router
from app.api.admin import router as admin_router
from app.api.scenarios import router as scenarios_router
from app.api.simulation import router as simulation_router
from app.api.grid_simulation import router as grid_simulation_router
from app.core.config import settings
from app.engine.simulator import simulator
from app.services.live_engine import live_engine
from app.services.persistence import init_database, persist_snapshot
from app.services.platform import get_public_state


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_database()
    task = asyncio.create_task(_simulation_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


async def _simulation_loop() -> None:
    import logging

    log = logging.getLogger("nexus.simloop")
    from app.services.advanced_platform import advanced_platform
    from app.services.mega_modules import mega_modules
    from app.services.creative_modules import creative_modules
    from app.services.extended_modules import extended_modules
    from app.services.immersive_modules import immersive_modules
    from app.api.websocket import broadcast_state

    while True:
        await asyncio.sleep(settings.sim_tick_ms / 1000)
        try:
            simulator.tick()
            live_engine.tick(simulator)
            for name, fn in (
                ("advanced", lambda: advanced_platform.tick(simulator, live_engine)),
                ("mega", lambda: mega_modules.tick(simulator, live_engine)),
                ("creative", lambda: creative_modules.tick(simulator, live_engine)),
                ("extended", lambda: extended_modules.tick(simulator, live_engine)),
                ("immersive", lambda: immersive_modules.tick(simulator, live_engine)),
            ):
                try:
                    fn()
                except Exception:
                    log.exception("Module tick failed (%s) — continuing simulation", name)
            await persist_snapshot()
            await broadcast_state()
        except Exception:
            # Never let a single crash freeze city health / recovery forever.
            log.exception("Simulation loop iteration failed — will retry next tick")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered autonomous city recovery and crisis simulation platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_router, prefix="/api/v1")
app.include_router(citizen_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(simulation_router, prefix="/api/v1")
app.include_router(scenarios_router, prefix="/api/v1")
app.include_router(grid_simulation_router, prefix="/api/v1")
app.include_router(advanced_router, prefix="/api/v1")
app.include_router(mega_router, prefix="/api/v1")
app.include_router(creative_router, prefix="/api/v1")
app.include_router(extended_router, prefix="/api/v1")
app.include_router(immersive_router, prefix="/api/v1")
app.include_router(contact_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, Any]:
    from app.services.persistence import database_ready, get_platform_metrics
    platform = await get_platform_metrics()
    return {
        "status": "healthy",
        "service": "nexus-backend",
        "version": settings.app_version,
        "tick": simulator.state.tick,
        "database": database_ready(),
        **platform,
    }


@app.get("/metrics")
async def metrics() -> dict[str, Any]:
    from app.api.websocket import manager
    from app.services.persistence import get_platform_metrics
    state = get_public_state()
    platform = await get_platform_metrics()
    return {
        **platform,
        "simulation_tick": state.get("tick"),
        "city_health": state.get("metrics", {}).get("city_health"),
        "active_disaster": state.get("active_disaster"),
        "vehicles_active": len(state.get("vehicles", [])),
        "websocket_clients": len(manager.active),
    }


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    from app.api.websocket import manager
    await manager.connect(ws)
    try:
        await ws.send_json({"type": "state", "data": get_public_state()})
        while True:
            msg = await ws.receive_json()
            if msg.get("type") == "ping":
                await ws.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(ws)
