"""Authentication — OAuth2-style JWT for demo multi-tenant RBAC."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.core.security import authenticate_user, create_access_token, decode_token
from app.models.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    user = authenticate_user(body.username, body.password)
    if not user:
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user["username"], "role": user["role"], "tenant": user["tenant"]})
    return TokenResponse(access_token=token, role=user["role"], tenant=user["tenant"])


@router.post("/token")
async def token(form: Annotated[OAuth2PasswordRequestForm, Depends()]) -> dict[str, str]:
    user = authenticate_user(form.username, form.password)
    if not user:
        raise HTTPException(401, "Invalid credentials")
    access = create_access_token({"sub": user["username"], "role": user["role"], "tenant": user["tenant"]})
    return {"access_token": access, "token_type": "bearer"}


async def get_current_user(token: Annotated[str | None, Depends(oauth2_scheme)]) -> dict[str, Any] | None:
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return {"username": payload.get("sub"), "role": payload.get("role"), "tenant": payload.get("tenant")}


@router.get("/me")
async def me(user: Annotated[dict[str, Any] | None, Depends(get_current_user)]) -> dict[str, Any]:
    if not user:
        return {"authenticated": False, "demo_users": ["commander", "analyst", "citizen"]}
    return {"authenticated": True, **user}
