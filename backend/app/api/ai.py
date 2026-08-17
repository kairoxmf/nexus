"""Real AI endpoints — multi-LLM copilot, mayor, debate, briefing."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from app.models.schemas import AIChatRequest, BriefingRequest
from app.services.ai_trainer import ai_trainer
from app.services.briefing import generate_briefing_pdf_bytes, generate_replay_report
from app.services.llm_router import llm_router

router = APIRouter(prefix="/ai", tags=["ai"])


class AutoTrainRequest(BaseModel):
    enabled: bool = True
    interval_sec: int = Field(default=60, ge=20, le=300)
    episodes: int = Field(default=5, ge=1, le=20)


class TrainCycleRequest(BaseModel):
    episodes: int = Field(default=8, ge=1, le=30)


def _ctx_with_locale(body: AIChatRequest) -> dict[str, Any]:
    ctx = dict(body.context or {})
    # Body locale wins — never let a stale context.locale force English
    ctx["locale"] = (body.locale or ctx.get("locale") or "en").split("-")[0][:2]
    return ctx


@router.post("/chat")
async def ai_chat(body: AIChatRequest) -> dict[str, Any]:
    return await llm_router.chat(body.role, body.message, _ctx_with_locale(body))


@router.post("/copilot")
async def copilot(body: AIChatRequest) -> dict[str, Any]:
    return await llm_router.chat("copilot", body.message, _ctx_with_locale(body))


@router.post("/mayor")
async def mayor_brief(body: AIChatRequest) -> dict[str, Any]:
    return await llm_router.chat("mayor", body.message, _ctx_with_locale(body))


@router.post("/debate")
async def ai_debate(body: AIChatRequest) -> dict[str, Any]:
    return await llm_router.chat("debate", body.message, _ctx_with_locale(body))


@router.get("/briefing/replay-report")
async def replay_report() -> dict[str, Any]:
    return generate_replay_report()


@router.post("/briefing/export", response_model=None)
async def export_briefing(body: BriefingRequest):
    report = generate_replay_report()
    if body.format == "pdf":
        pdf = generate_briefing_pdf_bytes(report)
        return Response(content=pdf, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=nexus-briefing.pdf"
        })
    return report


@router.get("/training/status")
async def training_status() -> dict[str, Any]:
    return ai_trainer.get_status()


@router.post("/training/run")
async def training_run(body: TrainCycleRequest) -> dict[str, Any]:
    return await ai_trainer.run_cycle(episodes=body.episodes)


@router.post("/training/auto")
async def training_auto(body: AutoTrainRequest) -> dict[str, Any]:
    if body.enabled:
        await ai_trainer.start_auto(interval_sec=body.interval_sec, episodes=body.episodes)
    else:
        await ai_trainer.stop_auto()
    return ai_trainer.get_status()


@router.get("/training/export")
async def training_export() -> JSONResponse:
    data = ai_trainer.export_training()
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": "attachment; filename=nexus-ai-training-export.json"},
    )
