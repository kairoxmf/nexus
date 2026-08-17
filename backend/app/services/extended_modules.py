"""Extended modules — Games, Advanced AI, Realism, Organizational (Phase 8)."""

from __future__ import annotations

import hashlib
import json
import random
import uuid
from datetime import datetime, timezone
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from app.engine.simulator import CitySimulator
    from app.services.live_engine import LiveEngine

ESCAPE_ROOMS = [
    {
        "id": "substation_alpha",
        "title": "Substation Alpha Lockdown",
        "theme": "power",
        "puzzles": [
            {"id": "p1", "clue": "Breaker sequence: RED → BLUE → GREEN", "answer": "red blue green", "hint": "Check the emergency panel color order"},
            {"id": "p2", "clue": "Generator fuel code = substation ID reversed", "answer": "ahpla", "hint": "Alpha spelled backwards"},
        ],
    },
    {
        "id": "flood_tunnel",
        "title": "Flood Tunnel Escape",
        "theme": "water",
        "puzzles": [
            {"id": "p1", "clue": "Pump activation: sum of valve numbers (3+7+2)", "answer": "12", "hint": "Add the valve labels"},
            {"id": "p2", "clue": "Exit code: H2O molecular count of atoms", "answer": "3", "hint": "H + O atoms in water"},
        ],
    },
    {
        "id": "comms_bunker",
        "title": "Comms Bunker Blackout",
        "theme": "communication",
        "puzzles": [
            {"id": "p1", "clue": "Frequency MHz: 911 reversed digits", "answer": "119", "hint": "Reverse the emergency number"},
            {"id": "p2", "clue": "Satellite pass code: SOS in numbers (.. --- ...)", "answer": "444666777", "hint": "Morse SOS digit mapping"},
        ],
    },
]

ROULETTE_SEGMENTS = [
    {"id": "earthquake", "label": "Micro Earthquake", "effect": "Magnitude +1, bridge stress", "severity": "high"},
    {"id": "bonus_power", "label": "Grid Surge Bonus", "effect": "+15% power recovery", "severity": "positive"},
    {"id": "misinfo", "label": "Misinformation Wave", "effect": "Panic +12%, social chaos", "severity": "medium"},
    {"id": "aid_convoy", "label": "Federal Aid Convoy", "effect": "+200 medical beds", "severity": "positive"},
    {"id": "blackout", "label": "Sector Blackout", "effect": "Random district loses power", "severity": "high"},
    {"id": "weather", "label": "Storm Front", "effect": "Rain + wind, evacuation harder", "severity": "medium"},
    {"id": "volunteer", "label": "Volunteer Surge", "effect": "+50 rescue personnel", "severity": "positive"},
    {"id": "supply_delay", "label": "Supply Chain Delay", "effect": "-20% food delivery rate", "severity": "medium"},
]

OSM_PRESETS = [
    {"city_id": "dc", "name": "Washington D.C.", "lat": 38.9072, "lng": -77.0369, "buildings": 8420, "roads_km": 1240, "parks": 312},
    {"city_id": "nyc", "name": "New York City", "lat": 40.7128, "lng": -74.0060, "buildings": 52000, "roads_km": 8900, "parks": 890},
    {"city_id": "teh", "name": "Tehran", "lat": 35.6892, "lng": 51.3890, "buildings": 28000, "roads_km": 4200, "parks": 420},
    {"city_id": "lon", "name": "London", "lat": 51.5074, "lng": -0.1278, "buildings": 31000, "roads_km": 5600, "parks": 780},
]

CERT_MODULES = [
    {"id": "basic_response", "title": "Basic Emergency Response", "questions": 5, "pass_score": 70},
    {"id": "triage", "title": "Mass Casualty Triage", "questions": 8, "pass_score": 75},
    {"id": "cascade", "title": "Infrastructure Cascade Management", "questions": 6, "pass_score": 80},
    {"id": "ethics", "title": "Crisis Ethics & Decision Making", "questions": 7, "pass_score": 70},
]

MARKETPLACE_LISTINGS = [
    {"resource": "power_mw", "unit": "MW", "base_price": 1200},
    {"resource": "medical_beds", "unit": "beds", "base_price": 850},
    {"resource": "food_tons", "unit": "tons", "base_price": 420},
    {"resource": "rescue_teams", "unit": "teams", "base_price": 15000},
    {"resource": "water_m3", "unit": "m³", "base_price": 95},
]


class ExtendedModules:
    def __init__(self) -> None:
        self._tick = 0
        self._rng = random.Random(888)
        # Escape Room
        self._escape_active: dict[str, Any] | None = None
        self._escape_completed: list[str] = []
        # Roulette
        self._roulette_history: list[dict[str, Any]] = []
        self._roulette_modifier: dict[str, Any] | None = None
        # Speedrun
        self._speedrun: dict[str, Any] | None = None
        self._speedrun_best: dict[str, Any] | None = None
        # Adversarial AI
        self._adversarial_active = False
        self._adversarial_actions: list[dict[str, Any]] = []
        # Oracle
        self._oracle_forecasts: list[dict[str, Any]] = []
        # Red Team
        self._red_team_report: dict[str, Any] | None = None
        self._red_team_findings: list[dict[str, Any]] = []
        # Satellite Phone
        self._sat_phones: list[dict[str, Any]] = []
        self._sat_messages: list[dict[str, Any]] = []
        # OSM Import
        self._osm_imports: list[dict[str, Any]] = []
        self._active_osm: dict[str, Any] | None = None
        # Refugee Flow
        self._refugee_routes: list[dict[str, Any]] = []
        self._refugee_camps: list[dict[str, Any]] = []
        # Certification
        self._cert_progress: dict[str, dict[str, Any]] = {}
        self._cert_badges: list[dict[str, Any]] = []
        # Marketplace
        self._market_orders: list[dict[str, Any]] = []
        self._market_balance_usd = 5_000_000.0
        # Blockchain Ledger
        self._ledger: list[dict[str, Any]] = []
        self._ledger_genesis()

    def reset(self) -> None:
        self._tick = 0
        self._escape_active = None
        self._escape_completed.clear()
        self._roulette_history.clear()
        self._roulette_modifier = None
        self._speedrun = None
        self._adversarial_active = False
        self._adversarial_actions.clear()
        self._oracle_forecasts.clear()
        self._red_team_report = None
        self._red_team_findings.clear()
        self._sat_phones.clear()
        self._sat_messages.clear()
        self._osm_imports.clear()
        self._active_osm = None
        self._refugee_routes.clear()
        self._refugee_camps.clear()
        self._cert_progress.clear()
        self._cert_badges.clear()
        self._market_orders.clear()
        self._market_balance_usd = 5_000_000.0
        self._ledger.clear()
        self._ledger_genesis()

    def _ledger_genesis(self) -> None:
        block = {
            "index": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": "genesis",
            "payload": {"message": "NEXUS Crisis Ledger initialized"},
            "previous_hash": "0" * 64,
        }
        block["hash"] = self._hash_block(block)
        self._ledger.append(block)

    def _hash_block(self, block: dict[str, Any]) -> str:
        content = json.dumps({k: v for k, v in block.items() if k != "hash"}, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()

    def _append_ledger(self, entry_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        prev = self._ledger[-1]
        block = {
            "index": len(self._ledger),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "type": entry_type,
            "payload": payload,
            "previous_hash": prev["hash"],
        }
        block["hash"] = self._hash_block(block)
        self._ledger.append(block)
        return block

    def tick(self, sim: "CitySimulator", live: "LiveEngine") -> None:
        self._tick += 1
        self._update_oracle(sim)
        self._update_adversarial(sim)
        self._update_speedrun(sim)
        self._update_refugee_flow(sim)
        self._update_satellite_phones(sim)
        if sim.state.active_disaster and self._tick % 8 == 0:
            self._record_sim_decision(sim)

    def _record_sim_decision(self, sim: "CitySimulator") -> None:
        if sim.state.log:
            last = sim.state.log[-1]
            self._append_ledger("ai_decision", {
                "tick": sim.state.tick,
                "text": last.text[:200],
                "agent": getattr(last, "agent", None),
            })

    def _update_oracle(self, sim: "CitySimulator") -> None:
        if not sim.state.active_disaster:
            self._oracle_forecasts.clear()
            return
        self._oracle_forecasts = []
        for h in range(1, 11):
            prob = min(99, 60 + h * 3 + self._rng.uniform(-2, 2))
            events = ["node_failure", "cascade", "recovery_milestone", "weather_shift", "citizen_surge"]
            self._oracle_forecasts.append({
                "horizon_ticks": h * 5,
                "event": self._rng.choice(events),
                "probability": round(prob, 1),
                "confidence": 100.0,
                "affected_nodes": [n.id for n in sim.state.nodes if n.health < 60][:3],
                "oracle_note": "Perfect foresight — all branches collapsed",
            })

    def _update_adversarial(self, sim: "CitySimulator") -> None:
        if not self._adversarial_active or not sim.state.active_disaster:
            return
        if self._tick % 12 == 0:
            sabotage = self._rng.choice([
                {"action": "reroute_ambulances", "impact": "Emergency response delayed 8 min", "severity": "high"},
                {"action": "spread_misinformation", "impact": "Panic +8% in Sector 4", "severity": "medium"},
                {"action": "overload_grid", "impact": "Power grid -5% stability", "severity": "high"},
                {"action": "block_supply_route", "impact": "Food delivery delayed 2h", "severity": "medium"},
                {"action": "jam_comms", "impact": "Satellite phone latency +30s", "severity": "low"},
            ])
            entry = {
                **sabotage,
                "id": str(uuid.uuid4())[:8],
                "tick": sim.state.tick,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "countermeasure": "Deploy redundancy protocol or isolate affected sector",
            }
            self._adversarial_actions.insert(0, entry)
            self._adversarial_actions = self._adversarial_actions[:20]
            self._append_ledger("adversarial_action", entry)

    def _update_speedrun(self, sim: "CitySimulator") -> None:
        if not self._speedrun or not self._speedrun.get("active"):
            return
        sr = self._speedrun
        sr["elapsed_sec"] = sr.get("elapsed_sec", 0) + (500 / 1000)
        health = sim.state.metrics.city_health
        for milestone, threshold in [("power_50", 50), ("health_70", 70), ("recovery_80", 80)]:
            if health >= threshold and milestone not in sr.get("splits", {}):
                sr.setdefault("splits", {})[milestone] = round(sr["elapsed_sec"], 1)
        if health >= 95 and not sr.get("completed"):
            sr["completed"] = True
            sr["finish_time_sec"] = round(sr["elapsed_sec"], 1)
            if not self._speedrun_best or sr["finish_time_sec"] < self._speedrun_best.get("finish_time_sec", 9999):
                self._speedrun_best = {"finish_time_sec": sr["finish_time_sec"], "splits": dict(sr.get("splits", {}))}
            self._append_ledger("speedrun_complete", {"time_sec": sr["finish_time_sec"], "splits": sr.get("splits")})

    def _update_refugee_flow(self, sim: "CitySimulator") -> None:
        if not sim.state.active_disaster:
            self._refugee_routes.clear()
            return
        stress = max(0, (100 - sim.state.metrics.city_health) / 100)
        if self._tick % 10 == 0 or not self._refugee_routes:
            self._refugee_routes = [
                {"id": "rf-1", "from": "Sector 8", "to": "Roosevelt Shelter", "count": int(800 * stress + 200), "status": "active", "progress_pct": self._rng.randint(20, 90)},
                {"id": "rf-2", "from": "Potomac Edge", "to": "Arlington Camp", "count": int(450 * stress + 100), "status": "active", "progress_pct": self._rng.randint(10, 70)},
                {"id": "rf-3", "from": "DC Metro", "to": "Baltimore Hub", "count": int(1200 * stress), "status": "forming", "progress_pct": self._rng.randint(0, 30)},
            ]
        self._refugee_camps = [
            {"id": "camp-roosevelt", "name": "Roosevelt High Shelter", "capacity": 2500, "occupied": int(1800 * stress + 200), "lat": 38.92, "lng": -77.04},
            {"id": "camp-lincoln", "name": "Lincoln Memorial Area", "capacity": 1200, "occupied": int(600 * stress + 100), "lat": 38.889, "lng": -77.05},
            {"id": "camp-arlington", "name": "Arlington Reception", "capacity": 4000, "occupied": int(2200 * stress), "lat": 38.88, "lng": -77.07},
        ]

    def _update_satellite_phones(self, sim: "CitySimulator") -> None:
        if sim.state.active_disaster and not self._sat_phones:
            for i in range(6):
                self._sat_phones.append({
                    "id": f"sat-{i+1:02d}",
                    "caller": self._rng.choice(["Field Team Alpha", "Survivor Group B", "NGO Medic", "Remote Clinic"]),
                    "latitude": 38.90 + self._rng.uniform(-0.04, 0.04),
                    "longitude": -77.04 + self._rng.uniform(-0.05, 0.05),
                    "signal_strength": round(self._rng.uniform(0.2, 0.95), 2),
                    "battery_pct": self._rng.randint(15, 90),
                    "status": "connected" if self._rng.random() > 0.3 else "waiting",
                })

    # ── Actions ───────────────────────────────────────────────────────────────

    def start_escape_room(self, room_id: str) -> dict[str, Any]:
        room = next((r for r in ESCAPE_ROOMS if r["id"] == room_id), ESCAPE_ROOMS[0])
        self._escape_active = {
            "room_id": room["id"],
            "title": room["title"],
            "theme": room["theme"],
            "puzzles": [{**p, "solved": False} for p in room["puzzles"]],
            "started_at": datetime.now(timezone.utc).isoformat(),
            "escaped": False,
        }
        return {"ok": True, "escape_room": self._escape_active}

    def solve_escape_puzzle(self, puzzle_id: str, answer: str) -> dict[str, Any]:
        if not self._escape_active:
            return {"ok": False, "error": "No active escape room"}
        normalized = answer.lower().strip()
        for p in self._escape_active["puzzles"]:
            if p["id"] == puzzle_id:
                if normalized == p["answer"].lower():
                    p["solved"] = True
                    all_solved = all(x["solved"] for x in self._escape_active["puzzles"])
                    if all_solved:
                        self._escape_active["escaped"] = True
                        self._escape_completed.append(self._escape_active["room_id"])
                        self._append_ledger("escape_room_complete", {"room": self._escape_active["room_id"]})
                    return {"ok": True, "correct": True, "escaped": all_solved}
                return {"ok": True, "correct": False, "hint": p.get("hint")}
        return {"ok": False, "error": "Puzzle not found"}

    def spin_roulette(self) -> dict[str, Any]:
        segment = self._rng.choice(ROULETTE_SEGMENTS)
        spin = {
            "id": str(uuid.uuid4())[:8],
            "segment": segment,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._roulette_history.insert(0, spin)
        self._roulette_history = self._roulette_history[:20]
        self._roulette_modifier = segment
        self._append_ledger("roulette_spin", segment)
        return {"ok": True, "result": spin}

    def start_speedrun(self, category: str = "full_recovery") -> dict[str, Any]:
        self._speedrun = {
            "active": True,
            "category": category,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "elapsed_sec": 0,
            "splits": {},
            "completed": False,
        }
        return {"ok": True, "speedrun": self._speedrun}

    def toggle_adversarial(self, active: bool) -> dict[str, Any]:
        self._adversarial_active = active
        if active:
            self._adversarial_actions.clear()
        return {"ok": True, "active": self._adversarial_active}

    def run_red_team(self, sim: "CitySimulator") -> dict[str, Any]:
        findings = []
        for node in sim.state.nodes:
            risk = max(0, 100 - node.health)
            if risk > 30 or node.type in ("bridge", "power", "water"):
                findings.append({
                    "id": str(uuid.uuid4())[:8],
                    "target": node.id,
                    "name": node.name,
                    "type": node.type,
                    "vulnerability": self._rng.choice(["single_point_failure", "cascade_entry", "no_backup", "aging_infrastructure"]),
                    "severity": "critical" if risk > 60 else "high" if risk > 40 else "medium",
                    "exploit_scenario": f"Targeted failure could cascade to {len(node.deps)} downstream nodes",
                    "mitigation": "Redundancy + monitoring + preemptive repair",
                })
        findings.sort(key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x["severity"], 3))
        self._red_team_findings = findings[:15]
        self._red_team_report = {
            "scan_id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "targets_scanned": len(sim.state.nodes),
            "critical_count": sum(1 for f in findings if f["severity"] == "critical"),
            "recommendations": [
                "Isolate bridge single-points-of-failure",
                "Deploy redundant power feeds to tier-1 hospitals",
                "Run tabletop exercise for cascade scenario",
            ],
        }
        self._append_ledger("red_team_scan", {"findings": len(findings), "critical": self._red_team_report["critical_count"]})
        return {"ok": True, "report": self._red_team_report, "findings": self._red_team_findings}

    def send_satellite_message(self, phone_id: str, message: str) -> dict[str, Any]:
        phone = next((p for p in self._sat_phones if p["id"] == phone_id), None)
        latency_sec = round(2 + (1 - (phone["signal_strength"] if phone else 0.5)) * 8, 1)
        entry = {
            "id": str(uuid.uuid4())[:8],
            "phone_id": phone_id,
            "direction": "outbound",
            "message": message,
            "latency_sec": latency_sec,
            "status": "delivered" if latency_sec < 6 else "delayed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._sat_messages.insert(0, entry)
        self._sat_messages = self._sat_messages[:30]
        if self._rng.random() > 0.4:
            reply = {
                "id": str(uuid.uuid4())[:8],
                "phone_id": phone_id,
                "direction": "inbound",
                "message": self._rng.choice([
                    "Copy — 12 survivors located in basement, need extraction",
                    "Medical supplies critical — ETA for airlift?",
                    "Road blocked at 14th St — alternate route needed",
                    "Generator failing — 45 min backup remaining",
                ]),
                "latency_sec": latency_sec,
                "status": "received",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            self._sat_messages.insert(0, reply)
        return {"ok": True, "message": entry}

    def import_osm(self, city_id: str | None = None, lat: float | None = None, lng: float | None = None, radius_km: float = 5) -> dict[str, Any]:
        preset = next((c for c in OSM_PRESETS if c["city_id"] == city_id), None) if city_id else None
        if preset:
            data = {**preset, "source": "OpenStreetMap", "import_radius_km": radius_km}
        else:
            data = {
                "city_id": city_id or "custom",
                "name": f"Custom ({lat:.2f}, {lng:.2f})" if lat and lng else "Custom Area",
                "lat": lat or 38.9072,
                "lng": lng or -77.0369,
                "buildings": self._rng.randint(500, 8000),
                "roads_km": self._rng.randint(100, 2000),
                "parks": self._rng.randint(20, 400),
                "source": "OpenStreetMap Overpass API (simulated)",
                "import_radius_km": radius_km,
            }
        data["imported_at"] = datetime.now(timezone.utc).isoformat()
        data["nodes_generated"] = int(data["buildings"] * 0.02)
        self._active_osm = data
        self._osm_imports.insert(0, data)
        self._osm_imports = self._osm_imports[:10]
        self._append_ledger("osm_import", {"city": data.get("name"), "buildings": data["buildings"]})
        return {"ok": True, "import": data}

    def submit_cert_exam(self, module_id: str, score: int) -> dict[str, Any]:
        mod = next((m for m in CERT_MODULES if m["id"] == module_id), None)
        if not mod:
            return {"ok": False, "error": "Module not found"}
        passed = score >= mod["pass_score"]
        self._cert_progress[module_id] = {
            "score": score,
            "passed": passed,
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        if passed and not any(b["module_id"] == module_id for b in self._cert_badges):
            badge = {
                "module_id": module_id,
                "title": mod["title"],
                "issued_at": datetime.now(timezone.utc).isoformat(),
                "certificate_id": f"NEXUS-CERT-{uuid.uuid4().hex[:8].upper()}",
            }
            self._cert_badges.append(badge)
            self._append_ledger("certification_issued", badge)
        return {"ok": True, "passed": passed, "progress": self._cert_progress[module_id]}

    def marketplace_order(self, resource: str, quantity: float, side: str) -> dict[str, Any]:
        listing = next((l for l in MARKETPLACE_LISTINGS if l["resource"] == resource), MARKETPLACE_LISTINGS[0])
        price = listing["base_price"] * quantity * self._rng.uniform(0.95, 1.08)
        if side == "buy" and price > self._market_balance_usd:
            return {"ok": False, "error": "Insufficient budget"}
        if side == "buy":
            self._market_balance_usd -= price
        else:
            self._market_balance_usd += price
        order = {
            "id": str(uuid.uuid4())[:8],
            "resource": resource,
            "quantity": quantity,
            "side": side,
            "price_usd": round(price, 2),
            "status": "filled",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._market_orders.insert(0, order)
        self._market_orders = self._market_orders[:30]
        self._append_ledger("marketplace_trade", order)
        return {"ok": True, "order": order, "balance_usd": round(self._market_balance_usd, 2)}

    def verify_ledger(self) -> dict[str, Any]:
        valid = True
        for i in range(1, len(self._ledger)):
            if self._ledger[i]["previous_hash"] != self._ledger[i - 1]["hash"]:
                valid = False
                break
            expected = self._hash_block({k: v for k, v in self._ledger[i].items() if k != "hash"})
            if self._ledger[i]["hash"] != expected:
                valid = False
                break
        return {"valid": valid, "blocks": len(self._ledger), "latest_hash": self._ledger[-1]["hash"] if self._ledger else None}

    def export_ledger(self) -> dict[str, Any]:
        return {"chain": self._ledger, "verification": self.verify_ledger(), "exported_at": datetime.now(timezone.utc).isoformat()}

    # ── Public payload ────────────────────────────────────────────────────────

    def public_payload(self, sim: "CitySimulator", live: "LiveEngine") -> dict[str, Any]:
        m = sim.state.metrics
        return {
            "games": {
                "escape_room": {
                    "rooms": ESCAPE_ROOMS,
                    "active": self._escape_active,
                    "completed": self._escape_completed,
                },
                "roulette": {
                    "segments": ROULETTE_SEGMENTS,
                    "active_modifier": self._roulette_modifier,
                    "history": self._roulette_history[:10],
                },
                "speedrun": {
                    "active": self._speedrun,
                    "personal_best": self._speedrun_best,
                    "leaderboard": [
                        {"player": "commander", "time_sec": self._speedrun_best["finish_time_sec"] if self._speedrun_best else None},
                        {"player": "analyst", "time_sec": 842.5},
                        {"player": "speedrunner_pro", "time_sec": 615.2},
                    ],
                },
            },
            "advanced_ai": {
                "adversarial": {
                    "active": self._adversarial_active,
                    "actions": self._adversarial_actions[:10],
                    "threat_level": "high" if self._adversarial_active and sim.state.active_disaster else "idle",
                },
                "oracle": {
                    "enabled": bool(sim.state.active_disaster),
                    "forecasts": self._oracle_forecasts[:10],
                    "accuracy_pct": 100.0,
                    "note": "All possible futures collapsed — deterministic prediction",
                },
                "red_team": {
                    "report": self._red_team_report,
                    "findings": self._red_team_findings[:10],
                    "last_scan": self._red_team_report["timestamp"] if self._red_team_report else None,
                },
            },
            "realism": {
                "satellite_phone": {
                    "phones": self._sat_phones,
                    "messages": self._sat_messages[:15],
                    "blackout_zones": 3 if sim.state.active_disaster else 0,
                    "network": "Iridium-style LEO constellation (simulated)",
                },
                "osm_import": {
                    "presets": OSM_PRESETS,
                    "active": self._active_osm,
                    "history": self._osm_imports[:5],
                },
                "refugee_flow": {
                    "routes": self._refugee_routes,
                    "camps": self._refugee_camps,
                    "total_displaced": sum(r.get("count", 0) for r in self._refugee_routes),
                    "capacity_utilization_pct": round(
                        sum(c["occupied"] for c in self._refugee_camps) / max(1, sum(c["capacity"] for c in self._refugee_camps)) * 100, 1
                    ) if self._refugee_camps else 0,
                },
            },
            "organizational": {
                "certification": {
                    "modules": CERT_MODULES,
                    "progress": self._cert_progress,
                    "badges": self._cert_badges,
                },
                "marketplace": {
                    "listings": MARKETPLACE_LISTINGS,
                    "orders": self._market_orders[:15],
                    "balance_usd": round(self._market_balance_usd, 2),
                    "volume_24h_usd": round(sum(o["price_usd"] for o in self._market_orders[:10]), 2),
                },
                "blockchain_ledger": {
                    "blocks": self._ledger[-20:],
                    "total_blocks": len(self._ledger),
                    "verification": self.verify_ledger(),
                    "chain_integrity": "valid" if self.verify_ledger()["valid"] else "tampered",
                },
            },
        }


extended_modules = ExtendedModules()
