"""JWT auth and demo RBAC users."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_USERS: dict[str, dict[str, str]] = {
    "commander": {"password": "nexus123", "role": "admin", "tenant": "dc-metro"},
    "analyst": {"password": "nexus123", "role": "analyst", "tenant": "dc-metro"},
    "citizen": {"password": "nexus123", "role": "citizen", "tenant": "dc-metro"},
}


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def authenticate_user(username: str, password: str) -> Optional[dict[str, str]]:
    user = DEMO_USERS.get(username)
    if not user or user["password"] != password:
        return None
    return {"username": username, "role": user["role"], "tenant": user["tenant"]}


def create_access_token(data: dict[str, Any], expires_minutes: int | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.jwt_expire_minutes
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> Optional[dict[str, Any]]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
