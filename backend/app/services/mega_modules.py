"""Mega AI modules — Federated Network, Challenge Mode, Social Sim, Black Box, etc."""

from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timezone
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from app.engine.simulator import CitySimulator
    from app.services.live_engine import LiveEngine

# ── Federated cities ──────────────────────────────────────────────────────────

FEDERATED_CITIES = [
    {"id": "dc", "name": "Washington D.C.", "lat": 38.9072, "lng": -77.0369, "population_m": 0.71,
     "resources": {"power_mw": 420, "food_tons": 850, "rescue_teams": 48, "medical_beds": 3200, "water_m3": 12000}},
    {"id": "nyc", "name": "New York City", "lat": 40.7128, "lng": -74.0060, "population_m": 8.34,
     "resources": {"power_mw": 5200, "food_tons": 12000, "rescue_teams": 220, "medical_beds": 28000, "water_m3": 95000}},
    {"id": "chi", "name": "Chicago", "lat": 41.8781, "lng": -87.6298, "population_m": 2.75,
     "resources": {"power_mw": 2100, "food_tons": 5400, "rescue_teams": 95, "medical_beds": 9800, "water_m3": 42000}},
    {"id": "la", "name": "Los Angeles", "lat": 34.0522, "lng": -118.2437, "population_m": 3.98,
     "resources": {"power_mw": 3800, "food_tons": 7800, "rescue_teams": 140, "medical_beds": 15000, "water_m3": 68000}},
    {"id": "lon", "name": "London", "lat": 51.5074, "lng": -0.1278, "population_m": 9.0,
     "resources": {"power_mw": 4800, "food_tons": 11000, "rescue_teams": 180, "medical_beds": 24000, "water_m3": 88000}},
    {"id": "tok", "name": "Tokyo", "lat": 35.6762, "lng": 139.6503, "population_m": 14.0,
     "resources": {"power_mw": 9200, "food_tons": 18000, "rescue_teams": 310, "medical_beds": 42000, "water_m3": 140000}},
]

HISTORICAL_DISASTERS = [
    {"id": "tohoku_2011", "name": "2011 Tōhoku Earthquake", "type": "earthquake", "magnitude": 9.1,
     "deaths": 19747, "lessons": ["Tsunami wall height", "Nuclear backup power", "Early warning systems"]},
    {"id": "katrina_2005", "name": "Hurricane Katrina 2005", "type": "hurricane", "magnitude": 5,
     "deaths": 1836, "lessons": ["Levee maintenance", "Evacuation logistics", "Federal coordination"]},
    {"id": "covid_2020", "name": "COVID-19 Pandemic", "type": "pandemic", "magnitude": 10,
     "deaths": 7000000, "lessons": ["Hospital surge capacity", "Supply chain redundancy", "Remote governance"]},
    {"id": "fukushima_2011", "name": "Fukushima Nuclear Accident", "type": "nuclear", "magnitude": 7,
     "deaths": 573, "lessons": ["Generator placement", "Evacuation zones", "Cross-border aid"]},
    {"id": "beirut_2020", "name": "Beirut Port Explosion", "type": "industrial", "magnitude": 6,
     "deaths": 218, "lessons": ["Hazmat storage", "Port security", "International medical aid"]},
    {"id": "camp_fire_2018", "name": "Camp Fire Wildfire 2018", "type": "wildfire", "magnitude": 8,
     "deaths": 85, "lessons": ["Evacuation alerts", "Grid de-energization", "Urban-wildland interface"]},
]

SOCIAL_TEMPLATES = [
    ("I need help near the bridge!", False, "rescue"),
    ("The bridge collapsed on 14th St", True, "infrastructure"),
    ("There is no water in our district", False, "utility"),
    ("The hospital is full — avoid ER", False, "health"),
    ("I found survivors in the basement", False, "rescue"),
    ("Government says everything is fine (it's NOT)", True, "misinformation"),
    ("Fake evacuation order circulating", True, "misinformation"),
    ("Power back in Sector 7!", False, "utility"),
    ("Helicopters landing at Lincoln Memorial", False, "response"),
    ("My family is trapped — please send help", False, "rescue"),
    ("Rumors of looting are exaggerated", True, "misinformation"),
    ("Shelter at Roosevelt High has space", False, "shelter"),
]

DRONE_TYPES = ["search", "medical", "fire", "mapping", "communication", "supply", "inspection"]


class MegaModules:
    def __init__(self) -> None:
        self._tick = 0
        self._social_posts: list[dict[str, Any]] = []
        self._black_box: list[dict[str, Any]] = []
        self._drones: list[dict[str, Any]] = []
        self._supply_routes: list[dict[str, Any]] = []
        self._challenge: dict[str, Any] | None = None
        self._movie_scenes: list[dict[str, Any]] = []
        self._civilization_year = 2026
        self._civilization_history: list[dict[str, Any]] = []
        self._commander_alerts: list[dict[str, Any]] = []
        self._rng = random.Random(777)
        self._seed_drones(120)

    def reset(self) -> None:
        self._tick = 0
        self._social_posts.clear()
        self._black_box.clear()
        self._drones.clear()
        self._supply_routes.clear()
        self._challenge = None
        self._movie_scenes.clear()
        self._civilization_year = 2026
        self._civilization_history.clear()
        self._commander_alerts.clear()
        self._seed_drones(120)

    def _seed_drones(self, count: int) -> None:
        self._drones.clear()
        for i in range(count):
            dtype = self._rng.choice(DRONE_TYPES)
            self._drones.append({
                "id": f"drn-{i:04d}",
                "type": dtype,
                "latitude": 38.90 + self._rng.uniform(-0.05, 0.05),
                "longitude": -77.04 + self._rng.uniform(-0.06, 0.06),
                "altitude_m": self._rng.randint(30, 400),
                "battery_pct": self._rng.randint(40, 100),
                "status": self._rng.choice(["patrol", "deployed", "returning", "scanning"]),
                "mission": self._rng.choice(["survivor_search", "fire_map", "supply_drop", "bridge_inspect", "comms_relay"]),
                "speed_kmh": round(self._rng.uniform(25, 80), 1),
            })

    def tick(self, sim: "CitySimulator", live: "LiveEngine") -> None:
        self._tick += 1
        self._animate_drones()
        if sim.state.active_disaster:
            if self._tick % 3 == 0:
                self._add_social_post(sim)
            if self._tick % 5 == 0:
                self._record_black_box(sim, live)
            if self._tick % 8 == 0:
                self._update_supply_routes(sim)
            if self._tick % 4 == 0:
                self._update_commander_alerts(sim)
        if self._tick % 20 == 0:
            self._advance_civilization(sim)

    def _animate_drones(self) -> None:
        for d in self._drones:
            d["latitude"] += self._rng.uniform(-0.0003, 0.0003)
            d["longitude"] += self._rng.uniform(-0.0003, 0.0003)
            d["battery_pct"] = max(5, d["battery_pct"] - self._rng.uniform(0, 0.3))
            if d["battery_pct"] < 15:
                d["status"] = "returning"

    def _add_social_post(self, sim: "CitySimulator") -> None:
        tpl, is_false, category = self._rng.choice(SOCIAL_TEMPLATES)
        author = f"@{self._rng.choice(['citizen', 'local', 'dc_resident', 'anon'])}{self._rng.randint(100, 9999)}"
        credibility = round(self._rng.uniform(0.15, 0.95) if not is_false else self._rng.uniform(0.05, 0.35), 2)
        post = {
            "id": str(uuid.uuid4())[:8],
            "author": author,
            "text": tpl,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "likes": self._rng.randint(0, 500),
            "shares": self._rng.randint(0, 200),
            "is_misinformation": is_false,
            "credibility_score": credibility,
            "category": category,
            "panic_contribution": round(self._rng.uniform(0.01, 0.15) if is_false else self._rng.uniform(0, 0.05), 3),
            "urgent": category == "rescue" and not is_false,
            "verified": not is_false and credibility > 0.7,
            "lat": 38.90 + self._rng.uniform(-0.04, 0.04),
            "lng": -77.04 + self._rng.uniform(-0.05, 0.05),
        }
        self._social_posts.insert(0, post)
        self._social_posts = self._social_posts[:500]

    def _record_black_box(self, sim: "CitySimulator", live: "LiveEngine") -> None:
        m = sim.state.metrics
        alts = ["Deploy helicopters first", "Restore hospital power", "Evacuate district 8", "Open emergency corridors"]
        chosen = self._rng.choice(alts)
        entry = {
            "id": str(uuid.uuid4())[:12],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tick": sim.state.tick,
            "input_data": {
                "city_health": m.city_health,
                "active_disaster": sim.state.active_disaster,
                "vehicles_active": len(live.vehicles),
            },
            "sensor_data": {
                "weather": live.weather.model_dump() if hasattr(live.weather, "model_dump") else {},
                "nodes_critical": sum(1 for n in sim.state.nodes if n.health < 40),
            },
            "disaster_state": {
                "type": sim.state.active_disaster,
                "magnitude": sim.state.disaster_magnitude,
                "radius_m": sim.state.disaster_radius,
            },
            "available_resources": {
                "power_grid_pct": m.power_grid,
                "water_pct": m.water_network,
                "healthcare_pct": m.healthcare,
            },
            "predicted_outcomes": [
                {"strategy": a, "lives_saved_est": self._rng.randint(20, 120), "confidence": round(self._rng.uniform(0.5, 0.95), 2)}
                for a in alts
            ],
            "alternative_decisions": alts,
            "selected_decision": chosen,
            "confidence_score": round(self._rng.uniform(0.72, 0.96), 2),
            "reasoning": f"Selected '{chosen}' because city health at {m.city_health:.0f}% with {sim.state.active_disaster or 'no'} disaster active.",
            "execution_time_ms": self._rng.randint(12, 85),
            "result": "executed",
            "recovery_impact": round(self._rng.uniform(0.5, 4.2), 1),
        }
        self._black_box.insert(0, entry)
        self._black_box = self._black_box[:200]

    def _update_supply_routes(self, sim: "CitySimulator") -> None:
        if not sim.state.active_disaster:
            return
        self._supply_routes.clear()
        cities = FEDERATED_CITIES[:4]
        for i, src in enumerate(cities):
            dst = cities[(i + 1) % len(cities)]
            vehicle = self._rng.choice(["aircraft", "ship", "convoy"])
            self._supply_routes.append({
                "id": f"route-{i}",
                "from_city": src["id"],
                "to_city": dst["id"],
                "resource": self._rng.choice(["power", "food", "rescue_teams", "medical", "water"]),
                "quantity": self._rng.randint(50, 500),
                "vehicle_type": vehicle,
                "progress_pct": round(self._rng.uniform(10, 95), 1),
                "eta_hours": self._rng.randint(2, 18),
                "status": "in_transit",
            })

    def _update_commander_alerts(self, sim: "CitySimulator") -> None:
        alerts = []
        for node in sim.state.nodes:
            if node.type == "hospital" and node.health < 50:
                alerts.append({
                    "priority": "critical",
                    "message": f"{node.name} will lose backup power in {self._rng.randint(8, 20)} minutes",
                    "action": "Deploy generators immediately",
                    "confidence": 0.91,
                })
            if node.type == "bridge" and node.health < 45:
                alerts.append({
                    "priority": "high",
                    "message": f"{node.name} has {self._rng.randint(85, 98)}% collapse probability",
                    "action": "Evacuate surrounding district and close bridge",
                    "confidence": 0.88,
                })
        if sim.state.metrics.transport < 40:
            alerts.append({
                "priority": "high",
                "message": "Deploy helicopters before roads become inaccessible",
                "action": "Activate air evacuation corridor",
                "confidence": 0.84,
            })
        for a in alerts[:3]:
            a["id"] = str(uuid.uuid4())[:8]
            a["timestamp"] = datetime.now(timezone.utc).isoformat()
            self._commander_alerts.insert(0, a)
        self._commander_alerts = self._commander_alerts[:30]

    def _advance_civilization(self, sim: "CitySimulator") -> None:
        m = sim.state.metrics
        event = "peaceful_growth"
        if sim.state.active_disaster:
            event = f"disaster_{sim.state.active_disaster}"
        snap = {
            "year": self._civilization_year,
            "population_k": round(705 + self._tick * 0.02 + self._rng.uniform(-1, 3), 0),
            "gdp_index": round(m.economic_index + self._rng.uniform(-2, 3), 1),
            "infrastructure_score": round(m.city_health, 1),
            "event": event,
            "buildings_built": self._rng.randint(0, 12),
            "migration_net": self._rng.randint(-500, 2000),
        }
        self._civilization_history.append(snap)
        self._civilization_history = self._civilization_history[-50:]
        if not sim.state.active_disaster and self._tick % 60 == 0:
            self._civilization_year += 1

    # ── Public payloads ───────────────────────────────────────────────────────

    def _federated_network(self, sim: "CitySimulator") -> dict[str, Any]:
        m = sim.state.metrics
        cities = []
        for c in FEDERATED_CITIES:
            stress = 0.0
            if c["id"] == "dc" and sim.state.active_disaster:
                stress = max(0, (100 - m.city_health) / 100)
            cities.append({
                **c,
                "status": "crisis" if c["id"] == "dc" and sim.state.active_disaster else "stable",
                "health_pct": m.city_health if c["id"] == "dc" else round(self._rng.uniform(75, 98), 1),
                "needs": {"power": stress > 0.3, "food": False, "rescue": stress > 0.5} if c["id"] == "dc" else {},
            })
        negotiations = []
        if sim.state.active_disaster:
            negotiations = [
                {"from": "nyc", "to": "dc", "offer": "500 MW power", "request": "Mutual aid agreement renewal", "status": "accepted", "ai_confidence": 0.94},
                {"from": "chi", "to": "dc", "offer": "1200 tons food surplus", "request": "Medical capacity sharing", "status": "negotiating", "ai_confidence": 0.81},
                {"from": "tok", "to": "dc", "offer": "45 rescue teams", "request": "Refugee distribution support", "status": "accepted", "ai_confidence": 0.89},
            ]
        return {
            "cities": cities,
            "supply_routes": self._supply_routes,
            "negotiations": negotiations,
            "mutual_aid_agreements": [
                {"cities": ["dc", "nyc"], "type": "power_sharing", "capacity_mw": 200},
                {"cities": ["dc", "chi"], "type": "food_exchange", "capacity_tons": 800},
                {"cities": ["dc", "lon"], "type": "medical_capacity", "beds": 500},
            ],
            "network_resilience_score": round(min(98, 70 + m.recovery_percentage * 0.25), 1),
            "local_recovery_score": round(m.city_health, 1),
        }

    def _ai_vs_human(self, sim: "CitySimulator") -> dict[str, Any]:
        m = sim.state.metrics
        base = {
            "lives_saved": int(m.safety_index * 1.2),
            "recovery_time_hours": max(8, int(48 - m.recovery_percentage * 0.3)),
            "infrastructure_damage_pct": round(100 - m.city_health, 1),
            "economic_cost_usd_m": round((100 - m.city_health) * 2.5, 1),
            "resource_usage_pct": round(min(95, 100 - m.recovery_percentage + 20), 1),
            "citizen_satisfaction": round(m.citizen_satisfaction, 1),
            "power_recovery_pct": round(m.power_grid, 1),
            "water_recovery_pct": round(m.water_network, 1),
            "traffic_recovery_pct": round(m.transport, 1),
        }
        diff_mult = {"easy": 0.85, "medium": 1.0, "hard": 1.15, "expert": 1.3}
        diff = (self._challenge or {}).get("difficulty", "medium")
        mult = diff_mult.get(diff, 1.0)
        ai_scores = {}
        for k, v in base.items():
            if k == "recovery_time_hours":
                ai_scores[k] = max(6, int(v * 0.88))
            else:
                ai_scores[k] = round(v * 1.05, 1)
        human_scores = {k: round(v * mult * (0.9 if k != "recovery_time_hours" else 1.1), 1) for k, v in base.items()}
        if self._challenge:
            human_scores = self._challenge.get("human_scores", human_scores)
        winner = "ai" if ai_scores["lives_saved"] > human_scores.get("lives_saved", 0) else "human"
        return {
            "active": self._challenge is not None,
            "difficulty": diff,
            "disaster_type": sim.state.active_disaster or "earthquake",
            "ai_strategy": "Multi-agent coordinated recovery with predictive cascade prevention",
            "human_strategy": (self._challenge or {}).get("human_strategy", "Awaiting human decisions"),
            "ai_scores": ai_scores,
            "human_scores": human_scores,
            "winner": winner if sim.state.metrics.recovery_percentage > 30 else None,
            "analysis": self._challenge_analysis(ai_scores, human_scores, winner),
            "decision_comparison": [
                {"phase": "Immediate Response", "ai": "Deploy all emergency units within 4 min", "human": "Assess situation first, deploy selectively"},
                {"phase": "Power Grid", "ai": "Parallel repair of 3 substations", "human": "Single substation priority repair"},
                {"phase": "Evacuation", "ai": "District 8 preemptive evacuation", "human": "Wait for official confirmation"},
                {"phase": "Resource Allocation", "ai": "Hospital-first triage protocol", "human": "Equal distribution across sectors"},
            ],
        }

    def _challenge_analysis(self, ai: dict, human: dict, winner: str) -> str:
        if winner == "ai":
            return (
                f"AI saved {ai['lives_saved'] - human.get('lives_saved', 0):.0f} more lives through preemptive evacuation "
                f"and {human.get('recovery_time_hours', 0) - ai['recovery_time_hours']:.0f}h faster recovery."
            )
        return "Human strategy showed better citizen satisfaction through community-informed decisions."

    def _social_network(self, sim: "CitySimulator") -> dict[str, Any]:
        misinfo = sum(1 for p in self._social_posts if p.get("is_misinformation"))
        panic = min(1.0, sum(p.get("panic_contribution", 0) for p in self._social_posts[:50]))
        urgent = [p for p in self._social_posts if p.get("urgent")][:10]
        return {
            "posts": self._social_posts[:100],
            "total_posts": len(self._social_posts),
            "misinformation_count": misinfo,
            "misinformation_rate_pct": round(misinfo / max(1, len(self._social_posts)) * 100, 1),
            "panic_level": round(panic, 3),
            "urgent_rescue_requests": urgent,
            "official_announcements": [
                {"text": "Official: Evacuation routes on I-395 and 14th St are OPEN", "timestamp": datetime.now(timezone.utc).isoformat()},
                {"text": "Misinformation alert: Ignore unauthorized evacuation orders on social media", "timestamp": datetime.now(timezone.utc).isoformat()},
            ],
            "credibility_avg": round(sum(p.get("credibility_score", 0) for p in self._social_posts[:30]) / max(1, min(30, len(self._social_posts))), 2),
        }

    def _black_box_recorder(self) -> dict[str, Any]:
        return {
            "records": self._black_box[:50],
            "total_records": len(self._black_box),
            "decision_tree": self._build_decision_tree(),
        }

    def _build_decision_tree(self) -> dict[str, Any]:
        if not self._black_box:
            return {"root": "Awaiting disaster for AI decisions", "children": []}
        latest = self._black_box[0]
        return {
            "root": f"Tick {latest['tick']}: Evaluate disaster response",
            "children": [
                {"node": alt, "selected": alt == latest["selected_decision"], "confidence": latest["confidence_score"]}
                for alt in latest.get("alternative_decisions", [])
            ],
        }

    def _disaster_movie(self, sim: "CitySimulator") -> dict[str, Any]:
        if not self._movie_scenes and sim.state.active_disaster:
            self._generate_movie(sim)
        return {
            "scenes": self._movie_scenes,
            "duration_sec": len(self._movie_scenes) * 8,
            "status": "ready" if self._movie_scenes else "waiting_for_disaster",
            "export_format": "mp4",
            "narration_language": "en",
        }

    def _generate_movie(self, sim: "CitySimulator") -> None:
        dtype = sim.state.active_disaster or "earthquake"
        self._movie_scenes = [
            {"scene": 1, "title": "Disaster Beginning", "camera": "Wide aerial", "duration_sec": 8,
             "subtitle": f"A {dtype} strikes Washington D.C.", "narration": "At T+0, sensors detect catastrophic failure across critical infrastructure."},
            {"scene": 2, "title": "Infrastructure Collapse", "camera": "Ground-level tracking", "duration_sec": 10,
             "subtitle": "Bridges and power lines fail in cascade", "narration": "The AI identifies 3 cascade chains within 90 seconds of initial impact."},
            {"scene": 3, "title": "Citizen Evacuation", "camera": "Street-level drone", "duration_sec": 12,
             "subtitle": "Thousands evacuate via AI-guided routes", "narration": "Traffic brain opens 6 emergency corridors, reducing evacuation time by 34%."},
            {"scene": 4, "title": "Emergency Response", "camera": "Helicopter chase", "duration_sec": 10,
             "subtitle": "Rescue teams deploy from 4 directions", "narration": "127 autonomous drones coordinate with ground units for survivor detection."},
            {"scene": 5, "title": "AI Decision Making", "camera": "Command center interior", "duration_sec": 8,
             "subtitle": "Black box records every decision", "narration": "Multi-agent debate selects hospital power restoration as priority strategy."},
            {"scene": 6, "title": "Resource Distribution", "camera": "Satellite view", "duration_sec": 10,
             "subtitle": "Federated cities send aid convoys", "narration": "Chicago and NYC negotiate automatic resource sharing within the network."},
            {"scene": 7, "title": "Recovery Operations", "camera": "Time-lapse wide", "duration_sec": 12,
             "subtitle": "City health climbs from critical to stable", "narration": f"Recovery mode restores {sim.state.metrics.recovery_percentage:.0f}% of infrastructure."},
            {"scene": 8, "title": "Final Reconstruction", "camera": "Sunrise panoramic", "duration_sec": 10,
             "subtitle": "Washington D.C. rebuilds stronger", "narration": "AI Governor initiates long-term resilience upgrades for the next generation."},
        ]

    def _drone_swarm(self, sim: "CitySimulator") -> dict[str, Any]:
        by_type: dict[str, int] = {}
        for d in self._drones:
            by_type[d["type"]] = by_type.get(d["type"], 0) + 1
        return {
            "drones": self._drones,
            "total": len(self._drones),
            "by_type": by_type,
            "active_missions": sum(1 for d in self._drones if d["status"] == "deployed"),
            "survivors_detected": self._rng.randint(0, 15) if sim.state.active_disaster else 0,
            "buildings_mapped": self._rng.randint(50, 200),
            "flood_depth_readings": self._rng.randint(0, 8) if sim.state.active_disaster else 0,
            "fire_spread_zones": self._rng.randint(0, 5) if sim.state.active_disaster else 0,
            "medicine_delivered": self._rng.randint(0, 40) if sim.state.active_disaster else 0,
            "comms_restored_pct": round(min(95, sim.state.metrics.safety_index * 0.9), 1),
        }

    def _crisis_commander(self, sim: "CitySimulator") -> dict[str, Any]:
        return {
            "alerts": self._commander_alerts[:15],
            "monitoring_status": "active",
            "city_coverage_pct": 98.5,
            "proactive_recommendations": len(self._commander_alerts),
            "voice_enabled": True,
            "last_briefing": self._commander_alerts[0]["message"] if self._commander_alerts else "All systems nominal — monitoring 842 infrastructure nodes.",
        }

    def _knowledge_engine(self, sim: "CitySimulator") -> dict[str, Any]:
        dtype = sim.state.active_disaster or "earthquake"
        matches = []
        for h in HISTORICAL_DISASTERS:
            type_match = 1.0 if h["type"] == dtype else 0.3
            mag_diff = abs(h["magnitude"] - (sim.state.disaster_magnitude or 5))
            similarity = round(max(0, min(99, type_match * 70 + (10 - mag_diff) * 3 + self._rng.uniform(-5, 5))), 1)
            matches.append({**h, "similarity_pct": similarity})
        matches.sort(key=lambda x: x["similarity_pct"], reverse=True)
        best = matches[0] if matches else None
        return {
            "historical_matches": matches[:6],
            "best_match": best,
            "recommended_strategies": best["lessons"] if best else [],
            "key_differences": [
                "Current city has higher digital infrastructure dependency",
                "Federated aid network not available in historical event",
                "AI coordination reduces response time by estimated 40%",
            ],
            "comparison_summary": (
                f"Current scenario is {best['similarity_pct']}% similar to {best['name']}."
                if best else "No active disaster — knowledge engine in standby."
            ),
        }

    def _failure_chain_ai(self, sim: "CitySimulator") -> dict[str, Any]:
        chains = []
        nodes = {n.id: n for n in sim.state.nodes}
        for node in sim.state.nodes:
            if node.deps:
                chain = {"trigger": node.id, "trigger_health": node.health, "cascade": []}
                for dep_id in node.deps:
                    dep = nodes.get(dep_id)
                    if dep:
                        chain["cascade"].append({
                            "node": dep_id,
                            "name": dep.name,
                            "type": dep.type,
                            "predicted_failure_prob": round(max(0, min(99, (100 - node.health) * 0.8 + (100 - dep.health) * 0.3)), 1),
                        })
                if chain["cascade"]:
                    chains.append(chain)
        graph_nodes = [{"id": n.id, "label": n.name, "type": n.type, "health": n.health} for n in sim.state.nodes[:25]]
        graph_edges = [{"source": n.id, "target": d, "weight": round(100 - n.health, 1)} for n in sim.state.nodes for d in n.deps[:3]][:40]
        return {
            "failure_chains": chains[:10],
            "graph": {"nodes": graph_nodes, "edges": graph_edges},
            "predictions_count": len(chains),
            "highest_risk_chain": chains[0] if chains else None,
        }

    def _ai_governor(self, sim: "CitySimulator") -> dict[str, Any]:
        m = sim.state.metrics
        return {
            "governance_mode": "crisis" if sim.state.active_disaster else "peacetime",
            "budget_usd_b": 14.2,
            "healthcare_investment_pct": 22,
            "education_investment_pct": 18,
            "energy_investment_pct": 15,
            "transport_investment_pct": 20,
            "climate_adaptation_score": 74,
            "emergency_preparedness_score": round(min(95, 60 + m.recovery_percentage * 0.3), 1),
            "population_growth_pct": 1.2,
            "urban_expansion_projects": 3,
            "long_term_forecast": [
                {"year": 2027, "health": round(m.city_health + 5, 0), "gdp_growth": 2.1},
                {"year": 2028, "health": round(min(100, m.city_health + 12), 0), "gdp_growth": 2.8},
                {"year": 2030, "health": round(min(100, m.city_health + 20), 0), "gdp_growth": 3.2},
            ],
            "resilience_upgrades": [
                "Microgrid deployment in 12 districts",
                "Flood barrier expansion on Potomac",
                "Hospital surge capacity +40%",
            ],
        }

    def _civilization_simulator(self, sim: "CitySimulator") -> dict[str, Any]:
        m = sim.state.metrics
        return {
            "current_year": self._civilization_year,
            "simulation_age_years": self._civilization_year - 2020,
            "population_k": round(705 + len(self._civilization_history) * 2, 0),
            "gdp_index": round(m.economic_index, 1),
            "history": self._civilization_history[-20:],
            "life_events": {
                "births_today": self._rng.randint(20, 45),
                "deaths_today": self._rng.randint(8, 20),
                "migrations_in": self._rng.randint(50, 200),
                "migrations_out": self._rng.randint(20, 80),
            },
            "economy": {
                "growth_pct": round(m.economic_index / 10 - 5, 1),
                "unemployment_pct": round(max(2, 5 + (100 - m.city_health) * 0.05), 1),
                "construction_projects": self._rng.randint(5, 25),
            },
            "unique_history": "City has independent economic cycles, migration patterns, and infrastructure evolution since 2020.",
            "disaster_impact": f"Active disaster modifies all civilization metrics by {(100 - m.city_health) / 100:.0%}" if sim.state.active_disaster else None,
        }

    # ── Actions ───────────────────────────────────────────────────────────────

    def start_challenge(self, difficulty: str, human_strategy: str) -> dict[str, Any]:
        self._challenge = {
            "difficulty": difficulty,
            "human_strategy": human_strategy,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "human_scores": {},
        }
        return {"ok": True, "challenge": self._challenge}

    def submit_human_decision(self, phase: str, decision: str) -> dict[str, Any]:
        if self._challenge:
            self._challenge.setdefault("human_decisions", []).append({"phase": phase, "decision": decision})
        return {"ok": True}

    def export_black_box(self) -> dict[str, Any]:
        return {"records": self._black_box, "exported_at": datetime.now(timezone.utc).isoformat(), "format": "research_json"}

    def export_movie(self) -> dict[str, Any]:
        return {
            "scenes": self._movie_scenes,
            "format": "mp4_storyboard",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "note": "Full MP4 rendering requires ffmpeg pipeline — storyboard exported for preview.",
        }

    def regenerate_movie(self, sim: "CitySimulator") -> dict[str, Any]:
        self._movie_scenes.clear()
        self._generate_movie(sim)
        return self._disaster_movie(sim)

    def public_payload(self, sim: "CitySimulator", live: "LiveEngine") -> dict[str, Any]:
        return {
            "federated_network": self._federated_network(sim),
            "ai_vs_human": self._ai_vs_human(sim),
            "social_network": self._social_network(sim),
            "black_box": self._black_box_recorder(),
            "disaster_movie": self._disaster_movie(sim),
            "drone_swarm": self._drone_swarm(sim),
            "crisis_commander": self._crisis_commander(sim),
            "knowledge_engine": self._knowledge_engine(sim),
            "failure_chain": self._failure_chain_ai(sim),
            "ai_governor": self._ai_governor(sim),
            "civilization": self._civilization_simulator(sim),
        }


mega_modules = MegaModules()
