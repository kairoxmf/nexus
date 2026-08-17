"""Multi-LLM router with graceful fallback when API keys are absent."""

from __future__ import annotations

import re
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.engine.simulator import simulator
from app.services.ai_trainer import ai_trainer

LOCALE_LANGUAGE = {
    "fa": "Persian (Farsi)",
    "ar": "Arabic",
    "es": "Spanish",
    "fr": "French",
    "en": "English",
}

LANG_PREFIXES = (
    "Language=fa. فقط به فارسی روان جواب بده.",
    "فقط و فقط به فارسی روان پاسخ بده.",
    "Language=ar. أجب بالعربية فقط.",
    "أجب بالعربية فقط.",
    "Language=es. Responde solo en español.",
    "Responde solo en español.",
    "Language=fr. Réponds uniquement en français.",
    "Réponds uniquement en français.",
)

USER_LANG_WRAP = {
    "fa": "مهم: پاسخ را فقط به فارسی بنویس. هیچ جمله‌ای به انگلیسی ننویس.\n\nسوال کاربر:\n{q}",
    "ar": "مهم: أجب بالعربية فقط. لا تستخدم الإنجليزية.\n\nسؤال المستخدم:\n{q}",
    "es": "Importante: responde SOLO en español.\n\nPregunta del usuario:\n{q}",
    "fr": "Important: réponds UNIQUEMENT en français.\n\nQuestion de l'utilisateur:\n{q}",
}


class LLMRouter:
    def __init__(self) -> None:
        self.groq_key = settings.groq_api_key
        self.openai_key = settings.openai_api_key
        self.anthropic_key = settings.anthropic_api_key
        self.gemini_key = settings.gemini_api_key

    async def _call_groq(self, system: str, user: str) -> Optional[str]:
        if not self.groq_key:
            return None
        async with httpx.AsyncClient(timeout=45) as client:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.groq_key}"},
                json={
                    "model": settings.groq_model,
                    "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                    "max_tokens": 800,
                    "temperature": 0.4,
                },
            )
            if r.status_code != 200:
                return None
            return r.json()["choices"][0]["message"]["content"]

    async def _call_openai(self, system: str, user: str) -> Optional[str]:
        if not self.openai_key:
            return None
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.openai_key}"},
                json={
                    "model": settings.openai_model,
                    "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                    "max_tokens": 500,
                },
            )
            if r.status_code != 200:
                return None
            return r.json()["choices"][0]["message"]["content"]

    async def _call_anthropic(self, system: str, user: str) -> Optional[str]:
        if not self.anthropic_key:
            return None
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.anthropic_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": settings.anthropic_model,
                    "max_tokens": 500,
                    "system": system,
                    "messages": [{"role": "user", "content": user}],
                },
            )
            if r.status_code != 200:
                return None
            return r.json()["content"][0]["text"]

    async def _call_gemini(self, system: str, user: str) -> Optional[str]:
        if not self.gemini_key:
            return None
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={self.gemini_key}"
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                url,
                json={
                    "systemInstruction": {"parts": [{"text": system}]},
                    "contents": [{"role": "user", "parts": [{"text": user}]}],
                },
            )
            if r.status_code != 200:
                return None
            return r.json()["candidates"][0]["content"]["parts"][0]["text"]

    def _clean_user_message(self, message: str) -> str:
        clean = message.strip()
        for prefix in LANG_PREFIXES:
            clean = clean.replace(prefix, "").strip()
        if "Simulation context:" in clean:
            clean = clean.split("Simulation context:")[0].strip()
        return clean

    def _detect_locale(self, message: str, hinted: str) -> str:
        """Prefer script in the user text; otherwise honor the client hint."""
        hint = (hinted or "en").split("-")[0][:2].lower()
        if hint not in LOCALE_LANGUAGE:
            hint = "en"

        raw = message or ""
        # Explicit Language=xx marker from frontend
        m = re.search(r"Language\s*=\s*(fa|ar|es|fr|en)\b", raw, re.I)
        if m:
            return m.group(1).lower()

        if any("\u0600" <= c <= "\u06ff" for c in raw):
            if re.search(r"[\u0750-\u077F]|(?:\bال\b|\bفي\b|\bهذا\b|\bأن\b)", raw):
                return "ar"
            return "fa"

        low = raw.lower()
        if re.search(
            r"\b(salam|chetor|khub|khoob|lotfan|vaziat|shahr|mikham|nexus|neksus)\b",
            low,
        ):
            return "fa"

        return hint

    def _fallback(self, role: str, message: str, locale: str = "en") -> str:
        m = simulator.state.metrics
        nodes_bad = [n.name for n in simulator.state.nodes if n.health < 50]
        priority = nodes_bad[0] if nodes_bad else None
        recovery = simulator.state.recovery_mode
        disaster = simulator.state.active_disaster or "none"
        q = self._clean_user_message(message)
        q_low = q.lower()
        short_q = (q[:80] + "…") if len(q) > 80 else q

        if locale == "fa":
            if role == "mayor":
                target = priority or "پایداری شبکه برق"
                return (
                    f"خلاصه شهردار: سلامت شهر {m.city_health:.0f}٪. "
                    f"اولویت فوری: {target}. "
                    f"بازیابی خودکار {'فعال' if recovery else 'در حالت آماده‌باش'}."
                )
            if role == "debate":
                return (
                    "اجماع AI: Medical AI به بیمارستان‌ها، Power AI به پست‌های برق، "
                    f"Transport AI برای کریدورهای تخلیه. اثر پیش‌بینی: تثبیت {m.city_health:.0f}٪."
                )
            if "زلزله" in q or "earthquake" in q_low:
                return (
                    "پس از زلزله، اولویت‌های NEXUS:\n"
                    "۱) برق و اکسیژن بیمارستان‌های سطح یک\n"
                    "۲) باز کردن کریدورهای تخلیه و مسیر آمبولانس\n"
                    "۳) تثبیت شبکه آب و برق حیاتی\n"
                    "۴) فعال‌سازی بازیابی خودکار اگر غیرفعال است\n"
                    f"وضعیت فعلی: سلامت {m.city_health:.0f}٪، بحران: {disaster}."
                )
            if any(k in q_low for k in ("کیستی", "کی هستی", "چی هستی", "who are you", "what are you")):
                return (
                    "من دستیار سه‌بعدی NEXUS هستم — برای مدیریت بحران واشنگتن دی‌سی. "
                    "می‌توانی از من وضعیت شهر، ناوبری صفحات، بازیابی خودکار یا استراتژی بپرسی."
                )
            if any(k in q for k in ("وضعیت شهر", "سلامت شهر")) or q_low in ("status", "city status", "health"):
                return (
                    f"سلامت شهر {m.city_health:.0f}٪، شاخص ایمنی {m.safety_index:.0f}٪. "
                    f"بحران فعال: {'ندارد' if disaster == 'none' else disaster}. "
                    f"بازیابی خودکار: {'فعال' if recovery else 'خاموش'}."
                )
            # Acknowledge the actual question instead of dumping unrelated city metrics
            return (
                f"سوالت را گرفتم: «{short_q}». "
                "من دستیار بحران NEXUS هستم و فعلاً روی سوالات شهر، نقشه، بازیابی و استراتژی تمرکز دارم. "
                f"اگر منظورت وضعیت شهر است: سلامت {m.city_health:.0f}٪، بحران: "
                f"{'ندارد' if disaster == 'none' else disaster}."
            )

        if locale == "ar":
            return (
                f"مساعد NEXUS: صحة المدينة {m.city_health:.0f}٪. "
                "الأولوية: المستشفيات، الممرات الطارئة، شبكة الكهرباء."
            )

        if locale == "es":
            return (
                f"Copiloto NEXUS: salud urbana {m.city_health:.0f}%. "
                "Prioridad: hospitales, corredores de evacuación, red eléctrica."
            )

        if locale == "fr":
            return (
                f"Copilote NEXUS: santé de la ville {m.city_health:.0f}%. "
                "Priorité: hôpitaux, couloirs d'évacuation, réseau électrique."
            )

        if role == "mayor":
            return (
                f"Mayor briefing: City health at {m.city_health:.0f}%. "
                f"Prioritize {priority or 'grid stability'} and open shelters. "
                f"Recovery mode {'active' if recovery else 'standby'}."
            )
        if role == "debate":
            return (
                "Rule-based consensus: Deploy Medical AI to hospitals, Power AI to substations, "
                f"Transport AI for evacuation corridors. Expected impact: stabilize {m.city_health:.0f}% baseline."
            )
        if any(k in q_low for k in ("who are you", "what are you", "what is nexus")):
            return (
                "I'm the NEXUS 3D companion for Washington D.C. crisis ops. "
                "Ask about city status, navigation, recovery, or strategy."
            )
        if any(k in q_low for k in ("city status", "city health")) or q_low in ("status", "health"):
            return (
                f"City health {m.city_health:.0f}%, safety {m.safety_index:.0f}%. "
                f"Active crisis: {disaster}. Recovery: {'on' if recovery else 'off'}."
            )
        return (
            f"Got your question: \"{short_q}\". "
            "I'm the NEXUS crisis assistant — I focus on city ops, map, recovery, and strategy. "
            f"If you meant city status: health {m.city_health:.0f}%, crisis: {disaster}."
        )

    def _system_prompt(self, role: str, locale: str) -> str:
        lang = LOCALE_LANGUAGE.get(locale, "English")
        if locale == "fa":
            lang_rule = (
                "LANGUAGE RULE (highest priority): پاسخ را فقط به فارسی بنویس. "
                "Do not write English sentences. Technical terms may stay in English only as short words."
            )
        elif locale == "ar":
            lang_rule = "LANGUAGE RULE (highest priority): أجب بالعربية فقط. Do not write English sentences."
        elif locale != "en":
            lang_rule = f"LANGUAGE RULE (highest priority): Respond ONLY in {lang}. Do not use English."
        else:
            lang_rule = "LANGUAGE RULE: Respond in English."

        base = (
            f"{lang_rule}\n"
            "You are NEXUS, an AI companion and crisis intelligence system for Washington D.C. "
            "ALWAYS answer the user's actual question first. "
            "Do NOT ignore their question to recite city health metrics unless they asked for status. "
            "Be concise and helpful. Use numbered lists only when listing steps."
        )
        if role == "mayor":
            return base + " You are the AI Mayor advisor. Be executive and clear."
        if role == "debate":
            return base + " You moderate a multi-agent AI debate on disaster recovery strategy."
        return base

    def _wrap_user(self, cleaned: str, locale: str) -> str:
        wrap = USER_LANG_WRAP.get(locale)
        if wrap:
            return wrap.format(q=cleaned)
        return cleaned

    async def chat(self, role: str, message: str, context: Optional[dict[str, Any]] = None) -> dict[str, Any]:
        ctx = context or {}
        hinted = str(ctx.get("locale") or "en")
        locale = self._detect_locale(message, hinted)

        system = self._system_prompt(role, locale)
        knowledge = ai_trainer.get_knowledge_block()
        if knowledge:
            system += f"\n\n{knowledge}"
        # Don't leak localization prefixes into the model as if they were the user topic
        cleaned = self._clean_user_message(message)
        user = self._wrap_user(cleaned, locale)
        if ctx:
            # Keep locale out of simulation dump; already in system prompt
            sim_ctx = {k: v for k, v in ctx.items() if k != "locale"}
            if sim_ctx:
                user += f"\n\nSimulation context: {sim_ctx}"

        provider = "fallback"
        text: Optional[str] = None
        # Groq first (fast); then OpenAI / others
        for name, fn in [
            ("groq", self._call_groq),
            ("openai", self._call_openai),
            ("anthropic", self._call_anthropic),
            ("gemini", self._call_gemini),
        ]:
            text = await fn(system, user)
            if text:
                provider = name
                break

        if not text:
            text = self._fallback(role, message, locale)
            provider = "rule_engine"

        return {"role": role, "response": text.strip(), "provider": provider, "locale": locale}


llm_router = LLMRouter()
