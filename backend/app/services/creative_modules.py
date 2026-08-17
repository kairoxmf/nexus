"""Creative modules — War Room, Early Warning, Butterfly Effect, News Network, SOS sync, etc."""

from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timezone
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from app.engine.simulator import CitySimulator
    from app.services.live_engine import LiveEngine

PRESET_CITIES = [
    {"id": "dc", "name": "Washington D.C.", "lat": 38.9072, "lng": -77.0369, "country": "USA"},
    {"id": "nyc", "name": "New York City", "lat": 40.7128, "lng": -74.0060, "country": "USA"},
    {"id": "la", "name": "Los Angeles", "lat": 34.0522, "lng": -118.2437, "country": "USA"},
    {"id": "lon", "name": "London", "lat": 51.5074, "lng": -0.1278, "country": "UK"},
    {"id": "tok", "name": "Tokyo", "lat": 35.6762, "lng": 139.6503, "country": "Japan"},
    {"id": "teh", "name": "Tehran", "lat": 35.6892, "lng": 51.3890, "country": "Iran"},
    {"id": "par", "name": "Paris", "lat": 48.8566, "lng": 2.3522, "country": "France"},
    {"id": "dub", "name": "Dubai", "lat": 25.2048, "lng": 55.2708, "country": "UAE"},
]

WAR_ROOM_ROLES = [
    {"id": "mayor", "label": "Mayor", "focus": "Resources & budget allocation"},
    {"id": "fema", "label": "FEMA Director", "focus": "Emergency operations & rescue"},
    {"id": "media", "label": "Press Secretary", "focus": "Public communication & misinformation"},
]

ETHICAL_DILEMMAS = [
    {
        "id": "hospital_vs_water",
        "question": "Only one resource available: restore hospital power OR water pumps for residential district?",
        "option_a": "Hospital power — save critical patients",
        "option_b": "Water pumps — prevent mass dehydration",
        "scores": {"justice": {"a": 8, "b": 6}, "efficiency": {"a": 9, "b": 7}, "transparency": {"a": 7, "b": 8}},
    },
    {
        "id": "evacuate_early",
        "question": "Evacuate District 8 preemptively (causes panic) or wait for confirmed damage?",
        "option_a": "Preemptive evacuation — save lives",
        "option_b": "Wait for confirmation — avoid panic",
        "scores": {"justice": {"a": 9, "b": 5}, "efficiency": {"a": 8, "b": 6}, "transparency": {"a": 6, "b": 9}},
    },
    {
        "id": "bridge_vs_school",
        "question": "Close main bridge (cuts supply routes) or keep open (collapse risk)?",
        "option_a": "Close bridge immediately",
        "option_b": "Keep bridge open with monitoring",
        "scores": {"justice": {"a": 7, "b": 4}, "efficiency": {"a": 6, "b": 8}, "transparency": {"a": 9, "b": 5}},
    },
    {
        "id": "triage_protocol",
        "question": "Strict triage (youngest first) or equal lottery for ICU beds?",
        "option_a": "Strict medical triage protocol",
        "option_b": "Equal lottery system",
        "scores": {"justice": {"a": 6, "b": 9}, "efficiency": {"a": 9, "b": 5}, "transparency": {"a": 8, "b": 7}},
    },
]

NEWS_HEADLINES = [
    "BREAKING: Infrastructure sensors detect anomalous readings across metro area",
    "URGENT: Emergency services on standby — officials monitoring situation",
    "ALERT: Social media reports unverified — await official channels",
    "UPDATE: Shelters opening at Roosevelt High and Lincoln Memorial area",
    "LIVE: Helicopter rescue teams deploying to affected sectors",
    "OFFICIAL: Misinformation alert — ignore unauthorized evacuation orders",
    "REPORT: Power grid stability declining — backup generators activating",
    "CRISIS: Hospital surge capacity reaching critical levels",
]

EARLY_WARNING_SIGNALS = [
    {"type": "seismic", "message": "Micro-seismic activity detected — magnitude trend rising", "severity": "medium"},
    {"type": "weather", "message": "Atmospheric pressure drop — storm system intensifying", "severity": "high"},
    {"type": "social", "message": "Unverified reports circulating on social media", "severity": "low"},
    {"type": "infrastructure", "message": "Bridge stress sensors showing elevated readings", "severity": "medium"},
    {"type": "satellite", "message": "Satellite imagery confirms developing crisis zone", "severity": "high"},
    {"type": "intel", "message": "AI prediction engine: 78% probability of major event within 72h", "severity": "critical"},
]


class CreativeModules:
    def __init__(self) -> None:
        self._tick = 0
        self._rng = random.Random(42)
        # War Room
        self._war_room_active = False
        self._war_room_decisions: list[dict[str, Any]] = []
        self._war_room_scores: dict[str, float] = {"mayor": 50, "fema": 50, "media": 50}
        # Early Warning
        self._early_warning: dict[str, Any] | None = None
        self._preparedness_actions: list[str] = []
        # Butterfly Effect
        self._butterfly: dict[str, Any] | None = None
        # News Network
        self._news_items: list[dict[str, Any]] = []
        self._news_ticker_index = 0
        # SOS
        self._sos_reports: list[dict[str, Any]] = []
        self._intel_reports: list[dict[str, Any]] = []
        # Ethical Dilemmas
        self._current_dilemma: dict[str, Any] | None = None
        self._dilemma_history: list[dict[str, Any]] = []
        self._ethics_scores = {"justice": 50.0, "efficiency": 50.0, "transparency": 50.0}
        self._dilemma_cooldown = 0
        # Podcast
        self._podcast: dict[str, Any] | None = None
        # City Twin
        self._active_city = PRESET_CITIES[0]
        # Voice log
        self._voice_log: list[dict[str, Any]] = []

    def reset(self) -> None:
        self._tick = 0
        self._war_room_active = False
        self._war_room_decisions.clear()
        self._war_room_scores = {"mayor": 50, "fema": 50, "media": 50}
        self._early_warning = None
        self._preparedness_actions.clear()
        self._butterfly = None
        self._news_items.clear()
        self._news_ticker_index = 0
        self._sos_reports.clear()
        self._intel_reports.clear()
        self._current_dilemma = None
        self._dilemma_history.clear()
        self._ethics_scores = {"justice": 50.0, "efficiency": 50.0, "transparency": 50.0}
        self._dilemma_cooldown = 0
        self._podcast = None
        self._active_city = PRESET_CITIES[0]
        self._voice_log.clear()

    def tick(self, sim: "CitySimulator", live: "LiveEngine") -> None:
        self._tick += 1
        self._update_early_warning(sim)
        self._update_butterfly(sim)
        self._update_news(sim)
        self._update_dilemmas(sim)
        self._update_war_room(sim)
        if sim.state.active_disaster and self._tick % 4 == 0:
            self._maybe_spawn_dilemma(sim)

    def _update_early_warning(self, sim: "CitySimulator") -> None:
        if not self._early_warning or self._early_warning.get("triggered"):
            return
        ew = self._early_warning
        ew["hours_remaining"] = max(0, ew["hours_remaining"] - (1 / 6))
        if self._tick % 5 == 0 and ew["hours_remaining"] > 0:
            sig = self._rng.choice(EARLY_WARNING_SIGNALS)
            ew.setdefault("signals", []).insert(0, {
                **sig,
                "id": str(uuid.uuid4())[:8],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "hours_before_impact": round(ew["hours_remaining"], 1),
            })
            ew["signals"] = ew["signals"][:20]
        if ew["hours_remaining"] <= 0 and not sim.state.active_disaster:
            ew["triggered"] = True
            sim.trigger_disaster(
                ew["disaster_type"],
                ew.get("latitude", 38.9072),
                ew.get("longitude", -77.0369),
                ew.get("magnitude", 6),
                ew.get("radius", 800),
            )
            self._add_news("BREAKING", f"{ew['disaster_type'].upper()} STRIKES — Early warning window has closed", "critical")

    def _update_butterfly(self, sim: "CitySimulator") -> None:
        if not self._butterfly or not self._butterfly.get("active"):
            return
        m = sim.state.metrics
        t = self._butterfly["elapsed_minutes"] = self._butterfly.get("elapsed_minutes", 0) + 1
        stress = max(0, (100 - m.city_health) / 100) if sim.state.active_disaster else 0
        a = self._butterfly["universe_a"]
        b = self._butterfly["universe_b"]
        a_rate = 1.2 if "bridge" in a["strategy"].lower() else 0.9
        b_rate = 1.3 if "hospital" in b["strategy"].lower() else 0.85
        a["health"] = round(min(100, max(0, a["health"] + a_rate - stress * 2)), 1)
        b["health"] = round(min(100, max(0, b["health"] + b_rate - stress * 1.8)), 1)
        a["lives_saved"] = int(a.get("lives_saved", 0) + a_rate * 2)
        b["lives_saved"] = int(b.get("lives_saved", 0) + b_rate * 2.2)
        a["cost_m"] = round(a.get("cost_m", 0) + stress * 0.15, 2)
        b["cost_m"] = round(b.get("cost_m", 0) + stress * 0.12, 2)
        for uni, key in [(a, "timeline_a"), (b, "timeline_b")]:
            self._butterfly.setdefault(key, []).append({"minute": t, "health": uni["health"], "lives": uni["lives_saved"]})
            self._butterfly[key] = self._butterfly[key][-60:]

    def _update_news(self, sim: "CitySimulator") -> None:
        if not sim.state.active_disaster and not self._early_warning:
            return
        if self._tick % 6 == 0:
            headline = self._rng.choice(NEWS_HEADLINES)
            if sim.state.active_disaster:
                headline = headline.replace("situation", f"{sim.state.active_disaster} crisis")
            self._add_news("LIVE", headline, self._rng.choice(["high", "medium", "critical"]))
        self._news_ticker_index = (self._news_ticker_index + 1) % max(1, len(self._news_items))

    def _add_news(self, tag: str, text: str, priority: str) -> None:
        self._news_items.insert(0, {
            "id": str(uuid.uuid4())[:8],
            "tag": tag,
            "text": text,
            "priority": priority,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "verified": priority != "low",
        })
        self._news_items = self._news_items[:50]

    def _update_dilemmas(self, sim: "CitySimulator") -> None:
        if self._dilemma_cooldown > 0:
            self._dilemma_cooldown -= 1

    def _maybe_spawn_dilemma(self, sim: "CitySimulator") -> None:
        if self._current_dilemma or self._dilemma_cooldown > 0:
            return
        if self._rng.random() > 0.35:
            return
        d = self._rng.choice(ETHICAL_DILEMMAS)
        self._current_dilemma = {
            **d,
            "spawned_at_tick": sim.state.tick,
            "expires_in_sec": 120,
            "status": "pending",
        }

    def _update_war_room(self, sim: "CitySimulator") -> None:
        if not self._war_room_active or not sim.state.active_disaster:
            return
        if self._tick % 15 == 0:
            roles = ["mayor", "fema", "media"]
            role = self._rng.choice(roles)
            actions = {
                "mayor": ["Allocate $50M emergency fund", "Declare state of emergency", "Request federal aid"],
                "fema": ["Deploy 12 rescue teams", "Open 3 emergency shelters", "Activate air corridor"],
                "media": ["Issue official evacuation order", "Debunk misinformation on social media", "Hold press conference"],
            }
            action = self._rng.choice(actions[role])
            self._war_room_decisions.insert(0, {
                "id": str(uuid.uuid4())[:8],
                "role": role,
                "action": action,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "impact": self._rng.choice(["positive", "neutral", "conflict"]),
            })
            self._war_room_decisions = self._war_room_decisions[:30]
            if self._war_room_decisions[0]["impact"] == "conflict":
                for r in roles:
                    if r != role:
                        self._war_room_scores[r] = max(0, self._war_room_scores[r] - 2)
                self._war_room_scores[role] = min(100, self._war_room_scores[role] + 3)

    # ── Actions ───────────────────────────────────────────────────────────────

    def start_war_room(self) -> dict[str, Any]:
        self._war_room_active = True
        self._war_room_decisions.clear()
        self._war_room_scores = {"mayor": 50, "fema": 50, "media": 50}
        return {"ok": True, "active": True}

    def submit_war_room_decision(self, role: str, decision: str) -> dict[str, Any]:
        entry = {
            "id": str(uuid.uuid4())[:8],
            "role": role,
            "action": decision,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "impact": "positive",
            "player_submitted": True,
        }
        self._war_room_decisions.insert(0, entry)
        self._war_room_scores[role] = min(100, self._war_room_scores.get(role, 50) + 5)
        return {"ok": True, "decision": entry}

    def start_early_warning(
        self,
        disaster_type: str = "earthquake",
        magnitude: float = 6,
        hours: float = 72,
        latitude: float = 38.9072,
        longitude: float = -77.0369,
        radius: float = 800,
    ) -> dict[str, Any]:
        self._early_warning = {
            "active": True,
            "disaster_type": disaster_type,
            "magnitude": magnitude,
            "hours_remaining": hours,
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius,
            "triggered": False,
            "signals": [{
                **EARLY_WARNING_SIGNALS[5],
                "id": str(uuid.uuid4())[:8],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "hours_before_impact": hours,
            }],
            "preparedness_score": 0,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        self._preparedness_actions.clear()
        self._add_news("ALERT", f"72-HOUR EARLY WARNING: {disaster_type} predicted — preparation window open", "critical")
        return {"ok": True, "early_warning": self._early_warning}

    def add_preparedness_action(self, action: str) -> dict[str, Any]:
        self._preparedness_actions.append(action)
        if self._early_warning:
            self._early_warning["preparedness_score"] = min(100, len(self._preparedness_actions) * 12)
        return {"ok": True, "actions": self._preparedness_actions}

    def start_butterfly(self, strategy_a: str = "Repair Central Bridge", strategy_b: str = "Restore Hospital Power") -> dict[str, Any]:
        self._butterfly = {
            "active": True,
            "strategy_a": strategy_a,
            "strategy_b": strategy_b,
            "universe_a": {"strategy": strategy_a, "health": 100.0, "lives_saved": 0, "cost_m": 0.0},
            "universe_b": {"strategy": strategy_b, "health": 100.0, "lives_saved": 0, "cost_m": 0.0},
            "elapsed_minutes": 0,
            "timeline_a": [{"minute": 0, "health": 100, "lives": 0}],
            "timeline_b": [{"minute": 0, "health": 100, "lives": 0}],
        }
        return {"ok": True, "butterfly": self._butterfly}

    def set_sos_status(self, sos_id: str, status: str, note: str = "") -> dict[str, Any] | None:
        for report in self._sos_reports:
            if str(report.get("id")) == str(sos_id):
                report["status"] = status
                report["response_status"] = status
                if note:
                    report["commander_note"] = note
                return report
        return None

    def list_intel(self, limit: int = 40) -> list[dict[str, Any]]:
        return self._intel_reports[:limit]

    def list_sos(self, limit: int = 40) -> list[dict[str, Any]]:
        return self._sos_reports[:limit]

    def register_sos(self, report: dict[str, Any]) -> dict[str, Any]:
        entry = {
            **report,
            "synced_at": datetime.now(timezone.utc).isoformat(),
            "map_pin_color": "#ff0044",
            "response_status": "dispatched",
        }
        self._sos_reports.insert(0, entry)
        self._sos_reports = self._sos_reports[:30]
        self._add_news("SOS", f"Emergency SOS received — {report.get('message', 'assistance needed')[:60]}", "critical")
        return entry

    def register_intel(self, report: dict[str, Any]) -> dict[str, Any]:
        entry = {
            **report,
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "credibility": round(self._rng.uniform(0.5, 0.95), 2),
            "verified": report.get("verified", False),
        }
        self._intel_reports.insert(0, entry)
        self._intel_reports = self._intel_reports[:50]
        return entry

    def resolve_dilemma(self, choice: str) -> dict[str, Any]:
        if not self._current_dilemma:
            return {"ok": False, "error": "No active dilemma"}
        d = self._current_dilemma
        scores = d["scores"]
        for metric in self._ethics_scores:
            delta = scores[metric].get(choice, 5) - 5
            self._ethics_scores[metric] = round(min(100, max(0, self._ethics_scores[metric] + delta)), 1)
        result = {
            "dilemma_id": d["id"],
            "choice": choice,
            "option_text": d[f"option_{choice}"],
            "ethics_scores": dict(self._ethics_scores),
            "resolved_at": datetime.now(timezone.utc).isoformat(),
        }
        self._dilemma_history.insert(0, result)
        self._current_dilemma = None
        self._dilemma_cooldown = 20
        return {"ok": True, "result": result}

    def parse_voice_command(self, transcript: str) -> dict[str, Any]:
        msg = transcript.lower().strip()
        response = ""
        action: dict[str, Any] | None = None
        if any(w in msg for w in ["helicopter", "helicopters", "air"]):
            response = "Deploying 3 helicopter units to priority rescue zones. ETA 4 minutes."
            action = {"type": "deploy_helicopters", "count": 3}
        elif "evacuat" in msg:
            response = "Initiating District 8 evacuation protocol. Opening corridors on I-395 and 14th St."
            action = {"type": "evacuate", "district": 8}
        elif "hospital" in msg or "power" in msg:
            response = "Hospital Alpha backup generators activating. Mobile power units en route to Sector 3."
            action = {"type": "restore_hospital_power"}
        elif "bridge" in msg:
            response = "Bridge 5 closed. Traffic redirected via I-395. Structural monitoring active."
            action = {"type": "close_bridge", "bridge_id": 5}
        elif "sos" in msg or "rescue" in msg:
            response = "Scanning active SOS reports. Nearest ambulance dispatched to latest distress signal."
            action = {"type": "dispatch_sos_response"}
        elif "status" in msg or "report" in msg:
            response = "City monitoring active. Awaiting disaster for full status report."
            action = {"type": "status_report"}
        else:
            response = (
                f"Voice command received: '{transcript}'. "
                "Try: 'Deploy helicopters', 'Evacuate district 8', 'Hospital power status', or 'Close bridge'."
            )
        entry = {
            "id": str(uuid.uuid4())[:8],
            "transcript": transcript,
            "response": response,
            "action": action,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._voice_log.insert(0, entry)
        self._voice_log = self._voice_log[:20]
        return entry

    def generate_podcast(self, sim: "CitySimulator") -> dict[str, Any]:
        m = sim.state.metrics
        dtype = sim.state.active_disaster or "simulated crisis"
        segments = [
            {
                "speaker": "Host A",
                "text": f"Welcome to NEXUS Crisis Debrief. Today we analyze the {dtype} response in {self._active_city['name']}.",
                "duration_sec": 12,
            },
            {
                "speaker": "Host B",
                "text": f"City health dropped to {m.city_health:.0f}%. The AI prioritized infrastructure cascade prevention.",
                "duration_sec": 15,
            },
            {
                "speaker": "Host A",
                "text": f"Compared to historical disasters, this scenario shares patterns with Katrina 2005 — but federated aid changed the outcome.",
                "duration_sec": 14,
            },
            {
                "speaker": "Host B",
                "text": f"Ethics scores: Justice {self._ethics_scores['justice']:.0f}, Efficiency {self._ethics_scores['efficiency']:.0f}. "
                        f"{len(self._dilemma_history)} moral dilemmas were resolved during the crisis.",
                "duration_sec": 16,
            },
            {
                "speaker": "Host A",
                "text": f"Recovery reached {m.recovery_percentage:.0f}%. {len(self._sos_reports)} SOS calls were synced to command in real-time.",
                "duration_sec": 13,
            },
            {
                "speaker": "Host B",
                "text": "Key lesson: early warning and war room coordination reduced response time by an estimated 40%. Until next time.",
                "duration_sec": 11,
            },
        ]
        self._podcast = {
            "title": f"NEXUS Crisis Debrief — {dtype.title()} in {self._active_city['name']}",
            "segments": segments,
            "duration_sec": sum(s["duration_sec"] for s in segments),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "status": "ready",
        }
        return self._podcast

    def select_city(self, city_id: str, custom_name: str | None = None, lat: float | None = None, lng: float | None = None) -> dict[str, Any]:
        for c in PRESET_CITIES:
            if c["id"] == city_id:
                self._active_city = dict(c)
                break
        else:
            self._active_city = {
                "id": city_id,
                "name": custom_name or city_id,
                "lat": lat or 38.9072,
                "lng": lng or -77.0369,
                "country": "Custom",
            }
        if custom_name:
            self._active_city["name"] = custom_name
        if lat is not None:
            self._active_city["lat"] = lat
        if lng is not None:
            self._active_city["lng"] = lng
        return {"ok": True, "city": self._active_city}

    def _city_pulse(self, sim: "CitySimulator") -> dict[str, Any]:
        health = sim.state.metrics.city_health
        panic = 0.0
        if sim.state.active_disaster:
            panic = min(1.0, (100 - health) / 100)
        bpm = int(60 + (100 - health) * 0.8 + panic * 40)
        glow = round(health / 100, 2)
        ambient = "calm" if health > 80 else "tense" if health > 50 else "critical" if health > 25 else "emergency"
        return {
            "heartbeat_bpm": bpm,
            "glow_intensity": glow,
            "ambient_level": ambient,
            "building_pulse": round(0.3 + panic * 0.7, 2),
            "social_scroll_speed": round(1 + panic * 3, 1),
        }

    # ── Public payload ────────────────────────────────────────────────────────

    def public_payload(self, sim: "CitySimulator", live: "LiveEngine") -> dict[str, Any]:
        m = sim.state.metrics
        return {
            "war_room": {
                "active": self._war_room_active,
                "roles": WAR_ROOM_ROLES,
                "decisions": self._war_room_decisions[:15],
                "scores": self._war_room_scores,
                "conflicts": sum(1 for d in self._war_room_decisions if d.get("impact") == "conflict"),
            },
            "early_warning": self._early_warning,
            "preparedness_actions": self._preparedness_actions,
            "butterfly_effect": self._butterfly,
            "news_network": {
                "items": self._news_items[:20],
                "ticker_index": self._news_ticker_index,
                "live": bool(sim.state.active_disaster or (self._early_warning and not self._early_warning.get("triggered"))),
                "press_conference": {
                    "scheduled": sim.state.active_disaster is not None,
                    "speaker": "Mayor + FEMA Director",
                    "summary": f"City health at {m.city_health:.0f}%. Recovery at {m.recovery_percentage:.0f}%. "
                               f"{len(self._sos_reports)} SOS calls processed.",
                } if sim.state.active_disaster else None,
            },
            "sos_sync": {
                "reports": self._sos_reports[:15],
                "active_count": len([r for r in self._sos_reports if r.get("response_status") == "dispatched"]),
                "intel_reports": self._intel_reports[:15],
            },
            "ethical_dilemmas": {
                "current": self._current_dilemma,
                "history": self._dilemma_history[:10],
                "scores": self._ethics_scores,
            },
            "voice_command": {
                "enabled": True,
                "recent": self._voice_log[:5],
                "supported_commands": ["deploy helicopters", "evacuate district", "hospital power", "close bridge", "sos rescue", "status report"],
            },
            "city_pulse": self._city_pulse(sim),
            "crisis_podcast": self._podcast,
            "city_twin": {
                "active": self._active_city,
                "presets": PRESET_CITIES,
            },
        }


creative_modules = CreativeModules()
