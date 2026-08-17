"""WebSocket connection manager and broadcast."""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import WebSocket

from app.services.platform import get_public_state, reset_platform


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self.active.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict[str, Any]) -> None:
        dead: list[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


async def broadcast_state() -> None:
    if not manager.active:
        return
    await manager.broadcast({
        "type": "state",
        "data": get_public_state(),
    })


async def broadcast_event(event_type: str, data: dict[str, Any]) -> None:
    if not manager.active:
        return
    await manager.broadcast({
        "type": event_type,
        "data": data,
    })
