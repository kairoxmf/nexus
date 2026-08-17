"""FastAPI dependencies — auth guards."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import Depends, HTTPException

from app.api.auth import get_current_user
from app.core.config import settings


async def require_user(
    user: Annotated[dict[str, Any] | None, Depends(get_current_user)],
) -> dict[str, Any]:
    if not settings.auth_required:
        return user or {"username": "guest", "role": "admin", "tenant": settings.default_tenant}
    if not user:
        raise HTTPException(401, "Authentication required")
    return user


async def require_role(*roles: str):
    async def _guard(user: Annotated[dict[str, Any], Depends(require_user)]) -> dict[str, Any]:
        if user.get("role") not in roles and user.get("role") != "admin":
            raise HTTPException(403, f"Requires role: {', '.join(roles)}")
        return user

    return _guard


CommandUser = Annotated[dict[str, Any], Depends(require_user)]
