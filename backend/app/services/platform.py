"""Merged platform state for API and WebSocket broadcasts."""

from __future__ import annotations

from typing import Any

from app.engine.simulator import simulator
from app.services.live_engine import live_engine


from app.services.advanced_platform import advanced_platform
from app.services.mega_modules import mega_modules
from app.services.creative_modules import creative_modules
from app.services.extended_modules import extended_modules
from app.services.immersive_modules import immersive_modules


def get_public_state() -> dict[str, Any]:
    base = simulator.public_state()
    base.update(live_engine.public_payload())
    base["advanced"] = advanced_platform.public_payload(simulator, live_engine)
    base["mega"] = mega_modules.public_payload(simulator, live_engine)
    base["creative"] = creative_modules.public_payload(simulator, live_engine)
    base["extended"] = extended_modules.public_payload(simulator, live_engine)
    base["immersive"] = immersive_modules.public_payload(simulator, live_engine)
    return base


def reset_platform() -> dict[str, Any]:
    simulator.reset()
    live_engine.reset()
    advanced_platform.reset()
    mega_modules.reset()
    creative_modules.reset()
    extended_modules.reset()
    immersive_modules.reset()
    return get_public_state()
