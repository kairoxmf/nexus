"""Public contact form API."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter

from app.models.schemas import ContactSubmitRequest
from app.services.persistence import save_contact_message

router = APIRouter(prefix="/contact", tags=["contact"])

_MEMORY_STORE: list[dict[str, Any]] = []


@router.post("")
async def submit_contact(body: ContactSubmitRequest) -> dict[str, Any]:
    record = {
        "id": str(uuid.uuid4())[:8],
        "name": body.name.strip() or "Anonymous",
        "email": body.email.strip(),
        "message": body.message.strip(),
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _MEMORY_STORE.insert(0, record)
    if len(_MEMORY_STORE) > 200:
        _MEMORY_STORE.pop()

    db_row = await save_contact_message(body.name, body.email, body.message)
    if db_row:
        record["db_id"] = db_row["id"]
        record["id"] = db_row["id"]

    return {"ok": True, "message": record}


def list_memory_messages(limit: int = 50) -> list[dict[str, Any]]:
    return _MEMORY_STORE[:limit]


def update_memory_status(message_id: str, status: str) -> dict[str, Any] | None:
    for row in _MEMORY_STORE:
        if row["id"] == message_id:
            row["status"] = status
            return row
    return None
