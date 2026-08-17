"""Advanced AI module API."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.advanced_platform import advanced_platform
from app.services.platform import get_public_state

router = APIRouter(prefix="/advanced", tags=["advanced"])


class FutureSelect(BaseModel):
    future_id: str


@router.post("/time-machine/select")
async def select_future(body: FutureSelect) -> dict:
    advanced_platform.select_future(body.future_id)
    return {"ok": True, "selected": body.future_id, "state": get_public_state()}


@router.get("/state")
async def advanced_state() -> dict:
    return get_public_state().get("advanced", {})
