"""Advanced AI modules — Time Machine, Self-Evolving AI, Digital Citizens, etc."""

from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timezone
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from app.engine.simulator import CitySimulator
    from app.services.live_engine import LiveEngine

FIRST_NAMES = ["Alex", "Jordan", "Sam", "Maria", "Chen", "Aisha", "David", "Elena", "James", "Fatima"]
OCCUPATIONS = ["Teacher", "Engineer", "Nurse", "Driver", "Student", "Retail Worker", "Firefighter"]
PERSONALITIES = ["Calm", "Anxious", "Helpful", "Skeptical", "Leader", "Passive"]


class AdvancedPlatform:
    def __init__(self) -> None:
        self.selected_future: str = "future_a"
        self.ai_version = "1.0"
        self.learning_history: list[dict[str, Any]] = []
        self.decision_log: list[dict[str, Any]] = []
        self._citizens: list[dict[str, Any]] = []
        self._citizen_seed = 0
        self._last_disaster: str | None = None
        self._tick_counter = 0

    def reset(self) -> None:
        self.selected_future = "future_a"
        self.ai_version = "1.0"
        self.learning_history.clear()
        self.decision_log.clear()
        self._citizens.clear()
        self._citizen_seed = 0
        self._last_disaster = None
        self._tick_counter = 0

    def select_future(self, future_id: str) -> None:
        if future_id in ("future_a", "future_b"):
            self.selected_future = future_id

    def _ensure_citizens(self, count: int = 48) -> None:
        if len(self._citizens) >= count:
            return
        rng = random.Random(42)
        for i in range(len(self._citizens), count):
            self._citizens.append({
                "id": str(uuid.uuid4())[:8],
                "name": f"{rng.choice(FIRST_NAMES)} {rng.choice(['M.', 'K.', 'R.', 'S.'])}",
                "age": rng.randint(19, 72),
                "occupation": rng.choice(OCCUPATIONS),
                "family_members": rng.randint(1, 5),
                "health_status": rng.choice(["Healthy", "Injured", "Critical", "Healthy", "Healthy"]),
                "mobility": rng.choice(["Full", "Limited", "Wheelchair", "Full"]),
                "vehicle_ownership": rng.choice([True, False, False]),
                "panic_level": round(rng.uniform(0.05, 0.35), 2),
                "personality": rng.choice(PERSONALITIES),
                "behavior": rng.choice(["Evacuating", "Sheltering", "Helping Others", "Ignoring Warnings", "Trapped"]),
                "latitude": 38.90 + rng.uniform(-0.04, 0.04),
                "longitude": -77.04 + rng.uniform(-0.05, 0.05),
                "routine": rng.choice(["Commute", "Work", "School", "Home", "Emergency Shift"]),
            })

    def _animate_citizens(self, sim: "CitySimulator") -> None:
        stress = max(0, 100 - sim.state.metrics.city_health) / 100
        for c in self._citizens:
            c["panic_level"] = min(1.0, c["panic_level"] + random.uniform(-0.02, 0.04) * (1 + stress))
            if sim.state.active_disaster and random.random() < 0.08:
                c["behavior"] = random.choice(["Evacuating", "Panicking", "Helping Others", "Trapped", "Sheltering"])
            c["latitude"] += random.uniform(-0.00008, 0.00008)
            c["longitude"] += random.uniform(-0.00008, 0.00008)

    def _time_machine(self, sim: "CitySimulator") -> dict[str, Any]:
        health = sim.state.metrics.city_health
        mag = sim.state.disaster_magnitude or 5
        futures = [
            {
                "id": "future_a",
                "label": "Future A",
                "strategy": "Repair Central Bridge",
                "recovery_hours": max(12, int(22 - health * 0.04)),
                "lives_saved": int(40 + health * 0.12),
                "cost_usd_m": round(1.8 + mag * 0.08, 1),
                "infrastructure_recovery_pct": min(98, int(85 + health * 0.06)),
                "probability": 0.58,
                "confidence": 0.82,
                "explanation": "Bridge repair restores transport corridors fastest, enabling supply routes and evacuation.",
                "timeline": [{"hour": h, "health": min(100, health + h * 2.5)} for h in range(0, 19, 3)],
            },
            {
                "id": "future_b",
                "label": "Future B",
                "strategy": "Restore Hospital Power",
                "recovery_hours": max(10, int(16 - health * 0.03)),
                "lives_saved": int(36 + health * 0.1),
                "cost_usd_m": round(0.9 + mag * 0.05, 1),
                "infrastructure_recovery_pct": min(95, int(78 + health * 0.05)),
                "probability": 0.52,
                "confidence": 0.79,
                "explanation": "Hospital power priority reduces mortality and stabilizes healthcare capacity under surge load.",
                "timeline": [{"hour": h, "health": min(100, health + h * 2.1)} for h in range(0, 15, 3)],
            },
        ]
        return {
            "futures": futures,
            "selected": self.selected_future,
            "comparison_note": "Switch between futures to compare consequences before committing resources.",
        }

    def _self_evolving_ai(self, sim: "CitySimulator") -> dict[str, Any]:
        perf = sim.state.metrics.city_health
        prev = self.learning_history[-1]["performance"] if self.learning_history else 72.0
        improvement = round(max(0, perf - prev), 1)
        if sim.state.active_disaster and sim.state.active_disaster != self._last_disaster:
            self._last_disaster = str(sim.state.active_disaster)
            parts = self.ai_version.split(".")
            major = int(parts[0]) if parts else 1
            minor = int(parts[1]) if len(parts) > 1 else 0
            if improvement > 5:
                self.ai_version = f"{major}.{minor + 1}"
            self.learning_history.append({
                "version": self.ai_version,
                "performance": perf,
                "improvement_pct": improvement,
                "mistakes_corrected": random.randint(1, 4),
                "strategy_changes": random.randint(1, 3),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            self.learning_history = self.learning_history[-12:]

        return {
            "version": self.ai_version,
            "previous_performance": prev,
            "current_performance": perf,
            "learning_progress": min(100, len(self.learning_history) * 8 + 20),
            "improvement_percentage": improvement,
            "mistakes_corrected": self.learning_history[-1]["mistakes_corrected"] if self.learning_history else 0,
            "strategy_changes": self.learning_history[-1]["strategy_changes"] if self.learning_history else 0,
            "timeline": self.learning_history,
        }

    def _hospital_brains(self, sim: "CitySimulator") -> list[dict[str, Any]]:
        brains = []
        for node in sim.state.nodes:
            if node.type != "hospital":
                continue
            load = max(0, 100 - node.health)
            brains.append({
                "hospital_id": node.id,
                "name": node.name,
                "beds_total": 420,
                "beds_available": max(0, int(420 * (node.health / 100))),
                "icu_capacity_pct": max(0, int(node.health - 10)),
                "doctors": 85,
                "nurses": 210,
                "medicine_inventory_pct": max(20, int(node.health * 0.9)),
                "blood_supply_pct": max(15, int(node.health * 0.85)),
                "generator_status": "Online" if node.health > 30 else "Critical",
                "oxygen_supply_pct": max(10, int(node.health * 0.8)),
                "ambulance_dispatch": min(12, int(load / 8)),
                "patient_queue": int(load * 1.2),
                "overload_risk": "High" if load > 55 else "Moderate" if load > 35 else "Low",
                "survival_capacity_pct": max(5, int(node.health * 0.75)),
                "health_score": node.health,
            })
        return brains

    def _traffic_brain(self, sim: "CitySimulator", live: "LiveEngine") -> dict[str, Any]:
        vehicles = live.vehicles
        congestion = min(100, len(vehicles) * 4 + max(0, 60 - sim.state.metrics.transport))
        return {
            "traffic_lights_controlled": 842,
            "congestion_index": congestion,
            "emergency_corridors_open": max(1, 4 - int(congestion / 25)),
            "priority_lanes": 6,
            "fastest_rescue_routes": [
                {"from": "Central Command", "to": "hosp1", "eta_min": 8, "status": "clear"},
                {"from": "Grid Hub", "to": "hosp2", "eta_min": 11, "status": "moderate"},
            ],
            "damaged_roads_avoided": sum(1 for n in sim.state.nodes if n.health < 40),
            "active_vehicles": len(vehicles),
            "update_interval_sec": 1,
            "coordination": ["Ambulance", "Police", "Fire", "Supply"],
        }

    def _economy(self, sim: "CitySimulator") -> dict[str, Any]:
        m = sim.state.metrics
        return {
            "gdp_index": round(m.economic_index, 1),
            "business_activity_pct": round(m.economic_index * 0.95, 1),
            "employment_pct": round(min(98, 88 + m.recovery_percentage * 0.08), 1),
            "fuel_price_index": round(100 + (100 - m.power_grid) * 0.15, 1),
            "food_price_index": round(100 + (100 - m.water_network) * 0.1, 1),
            "transport_cost_index": round(100 + (100 - m.transport) * 0.12, 1),
            "infrastructure_cost_usd_m": round(2.1 + (100 - m.city_health) * 0.04, 2),
            "government_budget_usd_b": 14.2,
            "recovery_budget_usd_m": round(50 + m.recovery_percentage * 0.8, 1),
            "insurance_loss_usd_m": round((100 - m.city_health) * 1.8, 1),
            "economic_growth_forecast_pct": round(m.economic_index / 10 - 5, 1),
            "short_term_impact": "Moderate contraction during active disaster",
            "long_term_forecast": "Recovery to baseline within 6–18 months depending on strategy",
        }

    def _climate_ai(self, live: "LiveEngine", sim: "CitySimulator") -> dict[str, Any]:
        w = live.weather
        return {
            "rain_mm": w.precipitation_mm,
            "snow": "Active" if w.condition == "snow" else "None",
            "wind_kmh": w.wind_speed_kmh,
            "heatwave_risk": "Elevated" if w.temperature_c > 35 else "Normal",
            "humidity_pct": 62,
            "wildfire_risk": "High" if w.overlay == "smoke" else "Low",
            "sea_level_impact": "Minimal — inland metro",
            "climate_change_factor": 1.08,
            "seasonal_effect": "Summer surge demand",
            "impacts": {
                "fire_spread": "Accelerated" if w.temperature_c > 32 else "Normal",
                "flood_expansion": "Active" if w.precipitation_mm > 30 else "Stable",
                "power_consumption": f"+{int((w.temperature_c - 20) * 2)}%",
                "road_conditions": w.condition,
            },
            "adaptation": "Recovery strategy auto-adjusted to current weather overlay",
        }

    def _infrastructure_genome(self, sim: "CitySimulator") -> dict[str, Any]:
        dna = sim.state.city_dna
        score = sum(dna.values()) / max(1, len(dna))
        weak = sorted(dna.items(), key=lambda x: x[1])[:3]
        nodes = sim.state.nodes
        deps = [(n.id, n.deps) for n in nodes if n.deps]
        return {
            "city_dna_score": round(score, 1),
            "transportation_resilience": dna.get("traffic_resilience", 0),
            "power_grid_stability": dna.get("power_resilience", 0),
            "water_network_stability": dna.get("water_resilience", 0),
            "healthcare_capacity": dna.get("medical_resilience", 0),
            "communication_reliability": dna.get("comm_resilience", 70),
            "emergency_response_speed": dna.get("emergency_resilience", 75),
            "weak_points": [{"key": k, "score": v} for k, v in weak],
            "cascade_risks": [
                {"trigger": n.id, "downstream": n.deps[:3]} for n in nodes if n.health < 45 and n.deps
            ][:5],
            "dependency_graph": deps[:20],
        }

    def _press_conference(self, sim: "CitySimulator") -> dict[str, Any]:
        m = sim.state.metrics
        lost = max(0, int((100 - m.safety_index) * 12))
        saved = max(0, int(m.safety_index * 8))
        return {
            "headline": "Emergency Briefing — Washington D.C. Recovery Command",
            "lives_saved": saved,
            "lives_lost": lost,
            "buildings_damaged": sum(1 for n in sim.state.nodes if n.health < 60),
            "infrastructure_status": f"City health {m.city_health:.0f}% — recovery {m.recovery_percentage:.0f}%",
            "recovery_progress_pct": m.recovery_percentage,
            "current_risks": sim.state.active_disaster or "Monitoring",
            "future_predictions": f"{len(sim.state.predictions)} active forecasts",
            "resource_usage": "Elevated — emergency reserves deployed",
            "economic_loss_usd_m": round((100 - m.city_health) * 2.1, 1),
            "next_steps": [
                "Stabilize power grid sectors",
                "Expand hospital surge capacity",
                "Open priority evacuation corridors",
            ],
            "speech": (
                f"Citizens of Washington, our unified AI command has stabilized {m.city_health:.0f}% of critical "
                f"infrastructure. {saved} lives protected. Recovery operations continue under {self.ai_version} intelligence."
            ),
        }

    def _research_report(self, sim: "CitySimulator") -> dict[str, Any]:
        return {
            "title": "NEXUS Simulation Research Report",
            "executive_summary": "Post-disaster analysis of AI-coordinated recovery operations in Washington D.C.",
            "disaster_timeline": f"Tick T+0 to T+{sim.state.tick}",
            "ai_decisions": len(sim.state.log),
            "success_analysis": f"Recovery at {sim.state.metrics.recovery_percentage:.0f}%",
            "failure_analysis": f"{sum(1 for n in sim.state.nodes if n.health < 40)} critical node failures",
            "alternative_strategies": ["Repair Central Bridge", "Restore Hospital Power"],
            "lessons_learned": [
                "Early hospital power restoration reduces mortality",
                "Transport corridors unlock cascade recovery",
            ],
            "performance_metrics": (
                sim.state.metrics.model_dump()
                if hasattr(sim.state.metrics, "model_dump")
                else dict(sim.state.metrics)
            ),
            "optimization_suggestions": [
                "Pre-position generators at tier-1 hospitals",
                "Activate traffic brain 30 minutes earlier",
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def _multiplayer(self) -> dict[str, Any]:
        roles = [
            "Mayor", "Emergency Commander", "Hospital Director", "Fire Chief",
            "Police Chief", "Power Grid Manager", "Transportation Manager", "AI Supervisor",
        ]
        return {
            "mode": "cooperative",
            "connected_players": 1,
            "roles_available": roles,
            "voice_chat": "Ready",
            "live_chat": "Active",
            "voting_active": False,
            "shared_dashboards": True,
            "sync_status": "Real-Time",
            "action_history": self.decision_log[-8:],
            "scoreboard": [{"role": "AI Supervisor", "score": 920, "player": "commander"}],
        }

    def tick(self, sim: "CitySimulator", live: "LiveEngine") -> None:
        self._tick_counter += 1
        self._ensure_citizens()
        self._animate_citizens(sim)
        if sim.state.log and len(self.decision_log) < 50:
            last = sim.state.log[-1]
            self.decision_log.append({"tick": sim.state.tick, "text": last.text[:120]})

    def public_payload(self, sim: "CitySimulator", live: "LiveEngine") -> dict[str, Any]:
        return {
            "time_machine": self._time_machine(sim),
            "self_evolving_ai": self._self_evolving_ai(sim),
            "digital_citizens": self._citizens[:48],
            "hospital_brain": self._hospital_brains(sim),
            "traffic_brain": self._traffic_brain(sim, live),
            "press_conference": self._press_conference(sim),
            "research_report": self._research_report(sim),
            "economy_simulation": self._economy(sim),
            "climate_ai": self._climate_ai(live, sim),
            "infrastructure_genome": self._infrastructure_genome(sim),
            "multiplayer_crisis": self._multiplayer(),
        }


advanced_platform = AdvancedPlatform()
