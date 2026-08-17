"""Phase 9 — Immersive Crisis: Cinema, Social, Diplomacy, Climate, Multiplayer, Persian AI, Realism."""

from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timezone
from typing import Any, TYPE_CHECKING

from app.core.config import settings

if TYPE_CHECKING:
    from app.engine.simulator import CitySimulator
    from app.services.live_engine import LiveEngine

HISTORICAL_EVENTS = [
    {
        "id": "virginia_2011",
        "name": "Virginia Earthquake 2011",
        "name_fa": "زلزله ویرجینیا ۲۰۱۱",
        "date": "2011-08-23",
        "magnitude": 5.8,
        "epicenter": {"lat": 37.936, "lng": -77.933},
        "impact_dc": "Washington Monument closed for 3 years; Capitol evacuated; tremors felt across East Coast",
        "impact_dc_fa": "بازدید از بنای واشنگتن ۳ سال تعطیل؛ کاپیتول تخلیه شد؛ لرزش در کل ساحل شرقی احساس شد",
    },
    {
        "id": "katrina_2005",
        "name": "Hurricane Katrina 2005",
        "name_fa": "طوفان کاترینا ۲۰۰۵",
        "date": "2005-08-29",
        "magnitude": 0,
        "epicenter": {"lat": 29.95, "lng": -90.07},
        "impact_dc": "Federal emergency coordination hub; 500+ FEMA staff deployed from DC",
        "impact_dc_fa": "مرکز هماهنگی اضطراری فدرال؛ بیش از ۵۰۰ نفر از FEMA از DC اعزام شدند",
    },
]

MAYOR_SOCIAL_TEMPLATES = [
    "Mayor's decision to {action} draws mixed reactions across the district.",
    "Breaking: Public trust index shifts after {action} announcement.",
    "Viral thread: Residents debate whether {action} was the right call.",
    "Poll: 52% support / 48% oppose the latest {action} policy.",
    "Misinformation alert: False claims about {action} spreading on social media.",
]

MAYOR_SOCIAL_TEMPLATES_FA = [
    "تصمیم شهردار برای {action} واکنش‌های متفاوتی در منطقه برانگیخته است.",
    "فوری: شاخص اعتماد عمومی پس از اعلام {action} تغییر کرد.",
    "بحث داغ: ساکنان درباره درست بودن {action} اختلاف نظر دارند.",
    "نظرسنجی: ۵۲٪ موافق / ۴۸٪ مخالف سیاست {action}.",
    "هشدار اطلاعات نادرست: ادعاهای نادرست درباره {action} در شبکه‌های اجتماعی.",
]

CINEMA_SHOTS = [
    {"camera": "aerial_wide", "duration_sec": 8, "subtitle": "The city holds its breath...", "music": "tension_low"},
    {"camera": "street_level", "duration_sec": 6, "subtitle": "Emergency lights pierce the darkness", "music": "pulse_rising"},
    {"camera": "monument_orbit", "duration_sec": 10, "subtitle": "Monuments stand witness to crisis", "music": "orchestral_swell"},
    {"camera": "command_center", "duration_sec": 7, "subtitle": "Decisions made in seconds, consequences for years", "music": "decision_theme"},
    {"camera": "metro_tunnel", "duration_sec": 5, "subtitle": "Underground lifeline — last route home", "music": "underground_pulse"},
    {"camera": "recovery_timelapse", "duration_sec": 12, "subtitle": "Recovery begins at dawn", "music": "hope_crescendo"},
]

CINEMA_SHOTS_FA = [
    {"camera": "aerial_wide", "duration_sec": 8, "subtitle": "شهر نفسش را حبس کرده...", "music": "tension_low"},
    {"camera": "street_level", "duration_sec": 6, "subtitle": "چراغ‌های اضطراری تاریکی را می‌شکافند", "music": "pulse_rising"},
    {"camera": "monument_orbit", "duration_sec": 10, "subtitle": "بناهای تاریخی شاهد بحران هستند", "music": "orchestral_swell"},
    {"camera": "command_center", "duration_sec": 7, "subtitle": "تصمیم در ثانیه‌ها، پیامد در سال‌ها", "music": "decision_theme"},
    {"camera": "metro_tunnel", "duration_sec": 5, "subtitle": "رگ حیاتی زیرزمین — آخرین مسیر بازگشت", "music": "underground_pulse"},
    {"camera": "recovery_timelapse", "duration_sec": 12, "subtitle": "بازیابی با طلوع آغاز می‌شود", "music": "hope_crescendo"},
]

NEWS_ANCHOR_SCRIPTS = [
    "Good evening. This is Crisis News Network with live coverage from Washington D.C.",
    "Breaking: Infrastructure health has dropped to critical levels in multiple sectors.",
    "Metro officials confirm limited service on Red and Blue lines using emergency power.",
    "The Mayor's office has issued a public briefing — details at the top of the hour.",
]

NEWS_ANCHOR_SCRIPTS_FA = [
    "عصر بخیر. این شبکه خبری بحران با پوشش زنده از واشنگتن دی‌سی.",
    "فوری: سلامت زیرساخت در چند بخش به سطح بحرانی رسیده است.",
    "مسئولان متro تأیید کردند: سرویس محدود در خطوط قرمز و آبی با برق اضطراری.",
    "دفتر شهردار بریفینگ عمومی صادر کرده — جزئیات در ابتدای ساعت.",
]

FEDERATED_CITIES = [
    {"id": "nyc", "name": "New York City", "lat": 40.7128, "lng": -74.006},
    {"id": "la", "name": "Los Angeles", "lat": 34.0522, "lng": -118.2437},
    {"id": "chi", "name": "Chicago", "lat": 41.8781, "lng": -87.6298},
    {"id": "lon", "name": "London", "lat": 51.5074, "lng": -0.1278},
    {"id": "tok", "name": "Tokyo", "lat": 35.6762, "lng": 139.6503},
]


class ImmersiveModules:
    def __init__(self) -> None:
        self._tick = 0
        self._rng = random.Random(99)
        # Crisis Cinema
        self._cinema_active = False
        self._cinema_progress = 0.0
        self._cinema_shots: list[dict[str, Any]] = []
        # Mayor Social
        self._social_posts: list[dict[str, Any]] = []
        self._public_trust = 62.0
        # Diplomatic War Room
        self._negotiations: list[dict[str, Any]] = []
        # Climate 2050
        self._climate_2050_active = False
        self._climate_year = 2026
        # AR Evacuation
        self._ar_routes: list[dict[str, Any]] = []
        # Persian AI
        self._persian_briefing: dict[str, Any] = {}
        self._voice_log: list[dict[str, Any]] = []
        # News Anchor
        self._anchor_segment = 0
        self._anchor_scripts: list[dict[str, Any]] = []
        # Multiplayer
        self._spectator_count = 0
        self._spectator_mode = False
        self._crisis_2v2: dict[str, Any] | None = None
        self._leaderboard: list[dict[str, Any]] = [
            {"player": "Commander_Alpha", "mode": "speedrun", "score": 842, "time_sec": 342},
            {"player": "FEMA_Ops", "mode": "certification", "score": 780, "time_sec": None},
            {"player": "DC_Resilience", "mode": "speedrun", "score": 720, "time_sec": 398},
            {"player": "CrisisRunner", "mode": "2v2", "score": 690, "time_sec": 512},
            {"player": "MetroHero", "mode": "speedrun", "score": 650, "time_sec": 445},
        ]
        # Realism
        self._weather_live: dict[str, Any] = {}
        self._historical_replay: dict[str, Any] | None = None
        self._push_subscribers = 0
        self._last_push: list[dict[str, Any]] = []
        # Map layer
        self._metro_operational_pct = 95.0
        self._traffic_lights_active = 8

    def reset(self) -> None:
        self.__init__()

    def tick(self, sim: CitySimulator, live: LiveEngine) -> None:
        self._tick += 1
        # DashboardMetrics is a Pydantic model — use attributes, not dict.get
        power = float(sim.state.metrics.power_grid)
        disaster = sim.state.active_disaster

        if disaster:
            self._metro_operational_pct = max(25, self._metro_operational_pct - 0.05)
            if power < 40:
                self._metro_operational_pct = max(15, self._metro_operational_pct - 0.1)
        else:
            self._metro_operational_pct = min(95, self._metro_operational_pct + 0.02)

        if self._cinema_active:
            total_sec = sum(s.get("duration_sec", 5) for s in self._cinema_shots) or 48
            tick_sec = settings.sim_tick_ms / 1000
            self._cinema_progress = min(1.0, self._cinema_progress + tick_sec / total_sec)
            if self._cinema_progress >= 1.0:
                self._cinema_active = False

        if self._tick % 40 == 0 and disaster:
            self._spawn_social_post(sim)
            self._spawn_anchor_segment()

        if self._climate_2050_active and self._tick % 60 == 0:
            self._climate_year = min(2050, self._climate_year + 1)

        if self._crisis_2v2 and self._crisis_2v2.get("active"):
            self._tick_2v2(sim)

        if self._tick % 120 == 0:
            self._refresh_weather_stub(sim)

        if self._tick % 200 == 0:
            self._update_persian_briefing(sim)

    def _spawn_social_post(self, sim: CitySimulator) -> None:
        action = "emergency metro activation" if sim.state.active_disaster else "recovery budget allocation"
        action_fa = "فعال‌سازی اضطراری متro" if sim.state.active_disaster else "تخصیص بودجه بازیابی"
        tpl = self._rng.choice(MAYOR_SOCIAL_TEMPLATES)
        tpl_fa = self._rng.choice(MAYOR_SOCIAL_TEMPLATES_FA)
        delta = self._rng.uniform(-8, 5)
        self._public_trust = max(10, min(95, self._public_trust + delta))
        post = {
            "id": str(uuid.uuid4())[:8],
            "author": self._rng.choice(["@DCResident", "@CapitolHillNews", "@MetroRider", "@FEMAWatch", "@MayorOffice"]),
            "text": tpl.format(action=action),
            "text_fa": tpl_fa.format(action=action_fa),
            "likes": self._rng.randint(12, 2400),
            "retweets": self._rng.randint(3, 890),
            "sentiment": "negative" if delta < 0 else "positive" if delta > 2 else "mixed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "verified": self._rng.random() > 0.7,
        }
        self._social_posts.insert(0, post)
        self._social_posts = self._social_posts[:50]

    def _spawn_anchor_segment(self) -> None:
        idx = self._anchor_segment % len(NEWS_ANCHOR_SCRIPTS)
        self._anchor_scripts.append({
            "text": NEWS_ANCHOR_SCRIPTS[idx],
            "text_fa": NEWS_ANCHOR_SCRIPTS_FA[idx],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        self._anchor_segment += 1
        self._anchor_scripts = self._anchor_scripts[-20:]

    def _refresh_weather_stub(self, sim: CitySimulator) -> None:
        w = sim.state.weather or {}
        self._weather_live = {
            "source": "openweather_stub",
            "city": "Washington,DC,US",
            "temp_c": w.get("temperature_c", 22),
            "condition": w.get("condition", "clear"),
            "wind_kmh": w.get("wind_speed_kmh", 12),
            "humidity_pct": 55 + self._rng.randint(-10, 15),
            "description": w.get("condition", "Partly cloudy over the National Mall"),
            "description_fa": "نیمه ابری بر فراز مال ملی",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "api_note": "Set OPENWEATHER_API_KEY for live data",
        }

    def _update_persian_briefing(self, sim: CitySimulator) -> None:
        m = sim.state.metrics
        disaster = sim.state.active_disaster.value if sim.state.active_disaster else "normal"
        self._persian_briefing = {
            "title": "بریفینگ عملیاتی بحران — واشنگتن دی‌سی",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "summary_fa": (
                f"سلامت شهر {m.city_health:.0f}٪ — "
                f"شبکه برق {m.power_grid:.0f}٪ — "
                f"حمل‌ونقل {m.transport:.0f}٪. "
                f"بحران فعال: {disaster}. مترو در {self._metro_operational_pct:.0f}٪ ظرفیت."
            ),
            "summary_en": (
                f"City health {m.city_health:.0f}% — "
                f"Power {m.power_grid:.0f}% — "
                f"Transport {m.transport:.0f}%."
            ),
            "feed_fa": [
                "شبکه خبری بحران: وضعیت مترو را از نزدیکترین ایستگاه بررسی کنید.",
                "پادکست بحران: گوش دهید به تحلیل تصمیمات ۷۲ ساعت گذشته.",
                "تیکر خبری: مسیرهای امداد اولویت‌دار در K Street فعال است.",
            ],
            "podcast_teaser_fa": "در این قسمت: آیا تصمیم شهردار برای فعال‌سازی مترو درست بود؟",
            "news_ticker_fa": "● فوری: خطوط مترو با برق اضطراری — سرویس محدود ادامه دارد ●",
        }

    def _tick_2v2(self, sim: CitySimulator) -> None:
        if not self._crisis_2v2:
            return
        t = self._crisis_2v2
        t["elapsed_sec"] = t.get("elapsed_sec", 0) + 1
        t["team_a_score"] = t.get("team_a_score", 50) + self._rng.uniform(-1, 2)
        t["team_b_score"] = t.get("team_b_score", 50) + self._rng.uniform(-2, 1.5)
        adv = t.get("adversarial_ai_score", 40)
        t["adversarial_ai_score"] = adv + self._rng.uniform(0, 1.5)
        if t["elapsed_sec"] > 600:
            t["active"] = False
            t["winner"] = "team_a" if t["team_a_score"] > t["team_b_score"] else "team_b"

    def start_cinema(self, sim: CitySimulator, locale: str = "en") -> dict[str, Any]:
        shots = CINEMA_SHOTS_FA if locale == "fa" else CINEMA_SHOTS
        self._cinema_active = True
        self._cinema_progress = 0.0
        self._cinema_shots = [
            {**s, "scene": i + 1, "title": f"Act {i + 1}"}
            for i, s in enumerate(shots)
        ]
        return {"ok": True, "cinema": self._cinema_payload(sim)}

    def stop_cinema(self) -> dict[str, Any]:
        self._cinema_active = False
        return {"ok": True}

    def start_climate_2050(self) -> dict[str, Any]:
        self._climate_2050_active = True
        self._climate_year = 2026
        return {"ok": True, "climate": self._climate_payload()}

    def start_historical_replay(self, event_id: str) -> dict[str, Any]:
        event = next((e for e in HISTORICAL_EVENTS if e["id"] == event_id), HISTORICAL_EVENTS[0])
        self._historical_replay = {
            **event,
            "progress_pct": 0,
            "active": True,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        return {"ok": True, "replay": self._historical_replay}

    def start_diplomatic_negotiation(self, city_id: str, offer: str) -> dict[str, Any]:
        city = next((c for c in FEDERATED_CITIES if c["id"] == city_id), FEDERATED_CITIES[0])
        confidence = self._rng.uniform(0.55, 0.92)
        accepted = confidence > 0.65
        neg = {
            "id": str(uuid.uuid4())[:8],
            "from_city": "Washington D.C.",
            "to_city": city["name"],
            "offer": offer,
            "counter_offer": f"{self._rng.randint(50, 200)} MW emergency power" if accepted else "Request deferred — local crisis priority",
            "status": "accepted" if accepted else "negotiating",
            "ai_confidence": round(confidence, 2),
            "ai_reasoning": "Mutual aid treaty aligns with federated resilience protocol §4.2" if accepted else "Partner city capacity constrained",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._negotiations.insert(0, neg)
        self._negotiations = self._negotiations[:20]
        return {"ok": True, "negotiation": neg}

    def enable_spectator(self, count: int = 1) -> dict[str, Any]:
        self._spectator_mode = True
        self._spectator_count += count
        return {"ok": True, "spectators": self._spectator_count}

    def start_2v2(self, team_a: str = "Recovery Alpha", team_b: str = "Recovery Beta") -> dict[str, Any]:
        self._crisis_2v2 = {
            "active": True,
            "team_a": team_a,
            "team_b": team_b,
            "team_a_score": 50,
            "team_b_score": 50,
            "adversarial_ai_score": 40,
            "adversarial_active": True,
            "elapsed_sec": 0,
            "winner": None,
        }
        return {"ok": True, "match": self._crisis_2v2}

    def voice_command(self, transcript: str, locale: str = "en") -> dict[str, Any]:
        lower = transcript.lower()
        fa = locale == "fa" or any("\u0600" <= c <= "\u06ff" for c in transcript)
        if any(w in lower for w in ["metro", "subway", "متro", "مترو"]):
            response = "Metro operating at {:.0f}% capacity. Red and Blue lines on emergency power.".format(self._metro_operational_pct)
            response_fa = f"متro در {self._metro_operational_pct:.0f}٪ ظرفیت فعال است. خطوط قرمز و آبی با برق اضطراری."
        elif any(w in lower for w in ["trust", "social", "اعتماد", "شبکه"]):
            response = f"Public trust index: {self._public_trust:.0f}%. Social feed updating live."
            response_fa = f"شاخص اعتماد عمومی: {self._public_trust:.0f}٪. فید اجتماعی به‌روز است."
        elif any(w in lower for w in ["weather", "forecast", "آب", "هوا"]):
            w = self._weather_live
            response = f"Weather: {w.get('condition', 'clear')}, {w.get('temp_c', 22)}°C, wind {w.get('wind_kmh', 12)} km/h."
            response_fa = f"آب‌وهوا: {w.get('description_fa', 'پاک')}, {w.get('temp_c', 22)}°C."
        else:
            response = "Crisis Commander online. Ask about metro, weather, trust index, or recovery status."
            response_fa = "فرمانده بحران آنلاین است. درباره متro، آب‌وهوا، اعتماد عمومی یا وضعیت بازیابی بپرسید."

        entry = {
            "id": str(uuid.uuid4())[:8],
            "transcript": transcript,
            "response": response_fa if fa else response,
            "response_en": response,
            "response_fa": response_fa,
            "tts_ready": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._voice_log.insert(0, entry)
        self._voice_log = self._voice_log[:30]
        return {"ok": True, **entry}

    def generate_ar_route(self, from_lat: float, from_lng: float) -> dict[str, Any]:
        route = {
            "id": str(uuid.uuid4())[:8],
            "from": {"lat": from_lat, "lng": from_lng},
            "to": {"lat": 38.897, "lng": -77.028, "name": "Metro Center Shelter", "name_fa": "پناهگاه مترو سنتر"},
            "waypoints": [
                {"lat": from_lat + 0.002, "lng": from_lng + 0.001},
                {"lat": from_lat + 0.004, "lng": from_lng + 0.003},
                {"lat": 38.897, "lng": -77.028},
            ],
            "distance_m": self._rng.randint(400, 2200),
            "eta_min": self._rng.randint(5, 18),
            "ar_overlay": "webxr_evacuation_path",
            "hazards": ["fallen_debris_sector_3"] if self._rng.random() > 0.5 else [],
        }
        self._ar_routes.insert(0, route)
        self._ar_routes = self._ar_routes[:10]
        return {"ok": True, "route": route}

    def send_push_alert(self, title: str, body: str, title_fa: str = "", body_fa: str = "") -> dict[str, Any]:
        alert = {
            "id": str(uuid.uuid4())[:8],
            "title": title,
            "body": body,
            "title_fa": title_fa or title,
            "body_fa": body_fa or body,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "delivered_to": self._push_subscribers or 1,
        }
        self._last_push.insert(0, alert)
        self._last_push = self._last_push[:20]
        self._push_subscribers = max(1, self._push_subscribers)
        return {"ok": True, "alert": alert}

    def subscribe_push(self) -> dict[str, Any]:
        self._push_subscribers += 1
        return {"ok": True, "subscribers": self._push_subscribers}

    def _cinema_payload(self, sim: CitySimulator) -> dict[str, Any]:
        return {
            "active": self._cinema_active,
            "progress_pct": round(self._cinema_progress * 100, 1),
            "shots": self._cinema_shots,
            "total_duration_sec": sum(s.get("duration_sec", 5) for s in self._cinema_shots),
            "soundtrack": "Crisis Symphony — Immersive Mix",
            "disaster": sim.state.active_disaster,
        }

    def _climate_payload(self) -> dict[str, Any]:
        years_elapsed = self._climate_year - 2026
        sea_rise = years_elapsed * 0.4
        return {
            "active": self._climate_2050_active,
            "current_year": self._climate_year,
            "scenario": "RCP8.5 — High emissions pathway",
            "sea_level_rise_cm": round(sea_rise, 1),
            "heat_days_per_year": 45 + years_elapsed * 2,
            "permanent_flood_zones": ["southwest_waterfront", "national_airport_perimeter"],
            "migration_influx_k": round(years_elapsed * 12.5, 1),
            "adaptation_budget_usd_b": round(2.4 + years_elapsed * 0.3, 1),
            "projections": [
                {"year": y, "health": max(30, 85 - (y - 2026) * 1.2), "population_k": 720 + (y - 2026) * 8}
                for y in range(2026, min(2051, self._climate_year + 5))
            ],
        }

    def public_payload(self, sim: CitySimulator, live: LiveEngine) -> dict[str, Any]:
        return {
            "cinema": self._cinema_payload(sim),
            "mayor_social": {
                "posts": self._social_posts[:20],
                "public_trust_index": round(self._public_trust, 1),
                "platform": "X / Twitter Simulator",
                "trending": ["#DCMetro", "#CrisisResponse", "#MayorBriefing"],
            },
            "diplomatic_war_room": {
                "negotiations": self._negotiations,
                "federated_cities": FEDERATED_CITIES,
                "active_sessions": len([n for n in self._negotiations if n.get("status") == "negotiating"]),
            },
            "climate_2050": self._climate_payload(),
            "ar_evacuation": {
                "routes": self._ar_routes,
                "webxr_supported": True,
                "active_routes": len(self._ar_routes),
            },
            "persian_ai": {
                "briefing": self._persian_briefing,
                "voice_log": self._voice_log[:10],
                "full_persian_mode": True,
            },
            "news_anchor": {
                "segments": self._anchor_scripts[-5:],
                "anchor_name": "CNN-Virtual Anchor",
                "anchor_name_fa": "خبرنگار مجازی شبکه بحران",
                "live": bool(sim.state.active_disaster),
            },
            "multiplayer": {
                "spectator_mode": self._spectator_mode,
                "spectator_count": self._spectator_count,
                "crisis_2v2": self._crisis_2v2,
            },
            "leaderboard": {
                "global": self._leaderboard,
                "categories": ["speedrun", "certification", "2v2"],
            },
            "realism": {
                "weather_live": self._weather_live,
                "historical_replay": self._historical_replay,
                "push_notifications": {
                    "subscribers": self._push_subscribers,
                    "recent": self._last_push[:5],
                    "pwa_enabled": True,
                },
                "historical_events": HISTORICAL_EVENTS,
            },
            "map_layer": {
                "metro_operational_pct": round(self._metro_operational_pct, 1),
                "traffic_lights_active": self._traffic_lights_active,
                "landmarks_loaded": ["white_house", "capitol", "lincoln_memorial", "pentagon", "washington_monument"],
                "priority_lanes_open": 3 if sim.state.active_disaster else 0,
            },
        }


immersive_modules = ImmersiveModules()
