"""Core city simulation engine — disasters, cascade, recovery, predictions."""

from __future__ import annotations

import copy
import math
from typing import Any, Optional

import networkx as nx

from app.engine.city_data import DISASTER_CONFIG, NODE_DEFS, ROADS, build_initial_nodes
from app.models.schemas import (
    CityNode,
    DashboardMetrics,
    DebateArgument,
    DebateResult,
    DisasterType,
    GeoPoint,
    LogEntry,
    LogLevel,
    NodeStatus,
    Prediction,
    SimulationState,
)


def _status_from_health(h: float) -> NodeStatus:
    if h <= 0:
        return NodeStatus.DESTROYED
    if h <= 15:
        return NodeStatus.CRITICAL
    if h <= 55:
        return NodeStatus.DAMAGED
    return NodeStatus.OPERATIONAL


def _agent_for_type(node_type: str) -> str:
    return {
        "hospital": "Medical AI",
        "power": "Power AI",
        "water": "Water AI",
        "bridge": "Construction AI",
        "fire": "Fire AI",
        "residential": "Transport AI",
        "comm": "Communication AI",
        "warehouse": "Food AI",
        "airport": "Transportation AI",
        "port": "Transportation AI",
    }.get(node_type, "Commander AI")


class CitySimulator:
    def __init__(self) -> None:
        self._debate_shown = False
        self._graph = self._build_dependency_graph()
        self._replay: list[dict[str, Any]] = []
        self.reset()

    def public_state(self) -> dict[str, Any]:
        """Lightweight state for API/WebSocket — excludes internal replay storage."""
        return self.state.model_dump()

    def _build_dependency_graph(self) -> nx.DiGraph:
        g = nx.DiGraph()
        for n in NODE_DEFS:
            g.add_node(n["id"], **n)
        for n in NODE_DEFS:
            for dep in n.get("deps", []):
                g.add_edge(dep, n["id"])
        return g

    def reset(self) -> SimulationState:
        self._debate_shown = False
        nodes = [CityNode(**{k: v for k, v in n.items() if k not in ("x", "y")}) for n in build_initial_nodes()]
        metrics = self._compute_metrics(nodes)
        self.state = SimulationState(
            nodes=nodes,
            metrics=metrics,
            city_dna=self._compute_city_dna(nodes),
        )
        self._snapshot()
        return self.state

    def _node_map(self) -> dict[str, CityNode]:
        return {n.id: n for n in self.state.nodes}

    def _push_log(
        self,
        text: str,
        level: LogLevel = LogLevel.INFO,
        agent: Optional[str] = None,
        explanation: Optional[dict] = None,
    ) -> None:
        entry = LogEntry(text=text, level=level, agent=agent, tick=self.state.tick, explanation=explanation)
        self.state.log.insert(0, entry)
        if len(self.state.log) > 80:
            self.state.log.pop()

    def _snapshot(self) -> None:
        snap = self.state.model_dump()
        self._replay.append(snap)
        if len(self._replay) > 200:
            self._replay.pop(0)

    def _compute_metrics(self, nodes: list[CityNode]) -> DashboardMetrics:
        def cat(types: list[str]) -> float:
            subset = [n for n in nodes if n.type in types]
            if not subset:
                return 100.0
            return round(sum(n.health for n in subset) / len(subset), 1)

        overall = round(sum(n.health for n in nodes) / len(nodes), 1)
        recovery = round(100 - (100 - overall), 1)
        return DashboardMetrics(
            city_health=overall,
            recovery_percentage=recovery,
            power_grid=cat(["power"]),
            water_network=cat(["water"]),
            healthcare=cat(["hospital"]),
            safety=cat(["fire", "police"]),
            transport=cat(["bridge", "airport", "port"]),
            housing=cat(["residential"]),
            safety_index=round((cat(["fire", "police"]) + cat(["hospital"])) / 2, 1),
            economic_index=round((cat(["warehouse", "port", "airport"]) + overall) / 2, 1),
            citizen_satisfaction=max(0, round(overall * 0.7 + cat(["shelter"]) * 0.3 - 10, 1)),
        )

    def _compute_city_dna(self, nodes: list[CityNode]) -> dict[str, float]:
        m = self._compute_metrics(nodes)
        return {
            "infrastructure_resilience": round((m.power_grid + m.water_network + m.transport) / 3, 1),
            "medical_resilience": m.healthcare,
            "traffic_resilience": m.transport,
            "power_resilience": m.power_grid,
            "water_resilience": m.water_network,
            "food_resilience": round(sum(n.health for n in nodes if n.type == "warehouse") / max(1, len([n for n in nodes if n.type == "warehouse"])), 1),
            "economic_stability": m.economic_index,
            "disaster_readiness": round((m.safety_index + m.city_health) / 2, 1),
        }

    def _distance(self, a: GeoPoint, lat: float, lng: float) -> float:
        """Approximate distance in meters."""
        dlat = (a.latitude - lat) * 111_000
        dlng = (a.longitude - lng) * 85_000
        return math.hypot(dlat, dlng)

    def trigger_disaster(
        self,
        disaster_type: DisasterType,
        lat: float,
        lng: float,
        magnitude: float,
        radius: float,
    ) -> SimulationState:
        dtype = disaster_type.value
        cfg = DISASTER_CONFIG.get(dtype, DISASTER_CONFIG["earthquake"])
        self.state.active_disaster = disaster_type
        self.state.epicenter = GeoPoint(latitude=lat, longitude=lng)
        self.state.disaster_magnitude = magnitude
        self.state.disaster_radius = radius
        self.state.wildfire_ticks = 0
        self._debate_shown = False
        self.state.active_agents = ["Commander AI"]

        self._push_log(
            f"{cfg['label']} detected — epicenter locked, magnitude {magnitude}. Damage assessment underway.",
            LogLevel.CRITICAL,
            "Commander AI",
            explanation={
                "reason": "Seismic/weather/sensor fusion triggered automatic disaster classification",
                "confidence": min(0.95, 0.6 + magnitude * 0.03),
                "risk_level": "high" if magnitude >= 7 else "elevated",
                "data_sources": ["USGS", "Satellite IR", "Local Sensors"],
            },
        )

        if cfg.get("direct"):
            node = next((n for n in self.state.nodes if n.type == cfg["direct"]), None)
            if node:
                node.health = 0
                node.status = NodeStatus.DESTROYED
                agent = _agent_for_type(node.type)
                self.state.active_agents.append(agent)
                self._push_log(f"{node.name} offline — total system collapse.", LogLevel.CRITICAL, agent)
            # Direct failures still shock the wider dependency graph / nearby assets.
            self._apply_radius_damage(lat, lng, max(radius, 2500), magnitude * 0.45, cfg)
        else:
            self._apply_radius_damage(lat, lng, radius, magnitude, cfg)

        self.state.metrics = self._compute_metrics(self.state.nodes)
        self.state.city_dna = self._compute_city_dna(self.state.nodes)
        self.state.predictions = self.generate_predictions()
        damaged = sum(1 for n in self.state.nodes if n.health < 100)
        self._push_log(
            f"Damage assessment complete — {damaged}/{len(self.state.nodes)} assets impacted. "
            f"City health now {self.state.metrics.city_health}%.",
            LogLevel.CRITICAL if damaged else LogLevel.WARNING,
            "Commander AI",
        )
        self._snapshot()
        return self.state

    def _effective_blast_radius(self, radius: float, magnitude: float) -> float:
        """Scale blast so city-spaced DC nodes are actually reachable."""
        # Magnitude 6 + UI radius 800 previously hit 0 nodes (nearest ~1.2km).
        mag_floor = 1500.0 + magnitude * 700.0
        return max(radius, mag_floor, radius * (0.75 + magnitude * 0.12))

    def _apply_radius_damage(
        self, lat: float, lng: float, radius: float, magnitude: float, cfg: dict
    ) -> None:
        mult_map = cfg.get("multiplier", {"default": 1.0})
        blast = self._effective_blast_radius(radius, magnitude)
        outer = blast * 2.4
        self.state.disaster_radius = max(self.state.disaster_radius, blast)
        hit = 0
        for node in self.state.nodes:
            dist = self._distance(GeoPoint(latitude=lat, longitude=lng), node.latitude, node.longitude)
            if dist > outer:
                continue
            if dist <= blast:
                falloff = 1 - dist / blast
            else:
                # Attenuated city-wide shockwave / secondary effects beyond primary ring.
                falloff = max(0.0, (1 - (dist - blast) / (outer - blast)) * 0.4)
            if falloff <= 0:
                continue
            mult = mult_map.get(node.type, mult_map.get("default", 1.0))
            dmg = magnitude * 9 * falloff * mult
            if dmg < 1.5:
                continue
            before = node.health
            node.health = max(0.0, round(node.health - dmg, 1))
            new_status = _status_from_health(node.health)
            if node.health < before:
                hit += 1
            if new_status != node.status and node.health < before:
                node.status = new_status
                lvl = LogLevel.CRITICAL if new_status in (NodeStatus.DESTROYED, NodeStatus.CRITICAL) else LogLevel.WARNING
                self._push_log(f"{node.name} → {new_status.value.upper()} ({node.health}% integrity).", lvl)
            else:
                node.status = new_status
        if hit == 0 and self.state.nodes:
            # Last-resort: always degrade nearest assets so gauges cannot stay frozen at 100%.
            nearest = sorted(
                self.state.nodes,
                key=lambda n: self._distance(GeoPoint(latitude=lat, longitude=lng), n.latitude, n.longitude),
            )[:5]
            for i, node in enumerate(nearest):
                soft = magnitude * (4.5 - i * 0.6)
                node.health = max(0.0, round(node.health - soft, 1))
                node.status = _status_from_health(node.health)
                self._push_log(
                    f"{node.name} → {node.status.value.upper()} ({node.health}% integrity).",
                    LogLevel.WARNING,
                )

    def tick(self) -> SimulationState:
        self.state.tick += 1
        # During autonomous recovery, suppress cascade decay so repairs can climb.
        if self.state.active_disaster and not self.state.recovery_mode:
            self._tick_cascade()
        elif self.state.active_disaster and self.state.recovery_mode:
            # Light containment only — wildfire still spreads slowly while crews work.
            if self.state.active_disaster == DisasterType.WILDFIRE:
                self._tick_cascade()
        if self.state.recovery_mode:
            self._tick_recovery()
        self.state.metrics = self._compute_metrics(self.state.nodes)
        self.state.city_dna = self._compute_city_dna(self.state.nodes)
        if self.state.tick % 3 == 0:
            self.state.predictions = self.generate_predictions()
        self._snapshot()
        return self.state

    def _tick_cascade(self) -> None:
        nm = self._node_map()
        for node in self.state.nodes:
            if not node.deps:
                continue
            failed = [
                nm[d] for d in node.deps
                if d in nm and nm[d].status in (NodeStatus.DESTROYED, NodeStatus.CRITICAL)
            ]
            if failed and node.health > 5:
                decay = len(failed) * 3
                before = node.health
                node.health = max(5.0, round(node.health - decay, 1))
                new_status = _status_from_health(node.health)
                if new_status != node.status:
                    node.status = new_status
                    agent = _agent_for_type(node.type)
                    if agent not in self.state.active_agents:
                        self.state.active_agents.append(agent)
                    dep_names = ", ".join(d.name for d in failed)
                    self._push_log(
                        f"{node.name} degrading — cascading failure from {dep_names}. Now {new_status.value.upper()}.",
                        LogLevel.WARNING,
                        agent,
                        explanation={
                            "reason": f"Dependency failure cascade: {dep_names}",
                            "confidence": 0.88,
                            "risk_level": "high",
                            "alternatives": ["Isolate node", "Emergency bypass", "Deploy backup power"],
                        },
                    )
                else:
                    node.status = new_status

        if self.state.active_disaster == DisasterType.WILDFIRE and self.state.epicenter:
            self.state.wildfire_ticks += 1
            if self.state.wildfire_ticks % 2 == 0 and self.state.disaster_radius < 8000:
                self.state.disaster_radius += 180
                cfg = DISASTER_CONFIG["wildfire"]
                self._apply_radius_damage(
                    self.state.epicenter.latitude,
                    self.state.epicenter.longitude,
                    self.state.disaster_radius,
                    self.state.disaster_magnitude * 0.4,
                    cfg,
                )
                self._push_log(
                    f"Fire front expanding — radius now {self.state.disaster_radius:.0f}m equivalent.",
                    LogLevel.WARNING,
                    "Fire AI",
                )
                if "Fire AI" not in self.state.active_agents:
                    self.state.active_agents.append("Fire AI")

    def _run_debate(self, damaged: list[CityNode]) -> DebateResult:
        arguments: list[DebateArgument] = []
        top3 = damaged[:3]
        for node in top3:
            agent = _agent_for_type(node.type)
            args = DebateArgument(
                agent=agent,
                position=f"Repair {node.name} immediately",
                reasoning=f"{node.name} at {node.health}% — priority {node.priority}, {len(node.deps)} dependents affected",
                confidence=min(0.95, 0.5 + node.priority * 0.08),
                priority_target=node.id,
            )
            arguments.append(args)
            self._push_log(
                f"{agent}: {node.name} at {node.health}% — priority {node.priority}, recommend immediate repair.",
                LogLevel.INFO,
                agent,
            )

        chosen = damaged[0] if damaged else None
        decision = f"Prioritize repair of {chosen.name}" if chosen else "No targets"
        result = DebateResult(
            arguments=arguments,
            decision=decision,
            chosen_strategy="priority × severity optimization",
            confidence=0.84,
            alternatives=["Minimize deaths first", "Restore power grid first", "Clear transport routes first"],
            expected_impact=f"Estimated +{min(18, 6 * min(3, len(damaged)))}% city recovery within 3 ticks",
        )
        self._push_log(
            f"Evaluated {len(damaged)} damaged assets. Repair sequence approved — highest priority × severity first.",
            LogLevel.SUCCESS,
            "Commander AI",
            explanation={
                "reason": result.decision,
                "confidence": result.confidence,
                "alternatives": result.alternatives,
                "expected_impact": result.expected_impact,
            },
        )
        self.state.last_debate = result
        return result

    def _tick_recovery(self) -> None:
        damaged = sorted(
            [n for n in self.state.nodes if n.health < 100],
            key=lambda n: n.priority * (100 - n.health),
            reverse=True,
        )
        if not damaged:
            self._push_log("Full recovery achieved. All systems nominal.", LogLevel.SUCCESS, "Commander AI")
            self.state.recovery_mode = False
            self.state.active_disaster = None
            self.state.epicenter = None
            return

        if not self._debate_shown:
            self._run_debate(damaged)
            self._debate_shown = True
            if "Commander AI" not in self.state.active_agents:
                self.state.active_agents.append("Commander AI")

        # Heal more assets when the city is critically damaged so gauges visibly climb.
        overall = self.state.metrics.city_health
        batch = 6 if overall < 40 else 5 if overall < 70 else 4
        heal = 10.0 if overall < 40 else 8.0 if overall < 70 else 6.0
        restored: list[str] = []
        for node in damaged[:batch]:
            before = node.health
            node.health = min(100.0, round(node.health + heal, 1))
            new_status = _status_from_health(node.health)
            node.status = new_status
            if node.health >= 100 and before < 100:
                self._push_log(f"{node.name} fully restored to OPERATIONAL.", LogLevel.SUCCESS, "Commander AI")
            elif node.health > before:
                restored.append(f"{node.name} +{node.health - before:.0f}%")

        if restored and self.state.tick % 2 == 0:
            self._push_log(
                f"Recovery crews deployed — {', '.join(restored[:3])}. City health {self._compute_metrics(self.state.nodes).city_health}%.",
                LogLevel.SUCCESS,
                "Commander AI",
            )

    def toggle_recovery(self, enabled: bool) -> SimulationState:
        self.state.recovery_mode = enabled
        self._debate_shown = False
        if enabled:
            damaged = sum(1 for n in self.state.nodes if n.health < 100)
            self._push_log(
                f"Recovery mode engaged. Assessing city-wide damage — {damaged} assets queued for repair.",
                LogLevel.INFO,
                "Commander AI",
            )
            # Kick off an immediate repair pulse so the UI doesn't wait a full tick.
            if damaged:
                self._tick_recovery()
                self.state.metrics = self._compute_metrics(self.state.nodes)
                self.state.city_dna = self._compute_city_dna(self.state.nodes)
        else:
            self._push_log("Recovery mode paused by operator.", LogLevel.INFO)
        self._snapshot()
        return self.state

    def god_mode(self, action: str, node_id: Optional[str] = None) -> SimulationState:
        if action == "repair_all":
            for n in self.state.nodes:
                n.health = 100
                n.status = NodeStatus.OPERATIONAL
            self.state.epicenter = None
            self.state.active_disaster = None
            self._push_log("All infrastructure manually restored to 100%.", LogLevel.SUCCESS, "God Mode")
        elif action == "cut_power":
            n = next((x for x in self.state.nodes if x.type == "power"), None)
            if n:
                n.health = 0
                n.status = NodeStatus.DESTROYED
                self._push_log("Power grid manually severed.", LogLevel.CRITICAL, "God Mode")
        elif action == "random_failure":
            candidates = [n for n in self.state.nodes if n.health > 20]
            if candidates:
                import random
                n = random.choice(candidates)
                n.health = max(0, n.health - 55)
                n.status = _status_from_health(n.health)
                self._push_log(f"{n.name} manually disabled — now {n.status.value.upper()}.", LogLevel.CRITICAL, "God Mode")
        elif action == "destroy" and node_id:
            n = self._node_map().get(node_id)
            if n:
                n.health = 0
                n.status = NodeStatus.DESTROYED
                self._push_log(f"{n.name} destroyed via God Mode.", LogLevel.CRITICAL, "God Mode")
        elif action == "repair" and node_id:
            n = self._node_map().get(node_id)
            if n:
                n.health = 100
                n.status = NodeStatus.OPERATIONAL
                self._push_log(f"{n.name} repaired via God Mode.", LogLevel.SUCCESS, "God Mode")

        self.state.metrics = self._compute_metrics(self.state.nodes)
        self._snapshot()
        return self.state

    def generate_predictions(self) -> list[Prediction]:
        nm = self._node_map()
        preds: list[Prediction] = []
        horizons = [6, 24, 72, 168, 720]

        hospitals = [n for n in self.state.nodes if n.type == "hospital" and n.health < 70]
        if hospitals:
            for h in horizons[:3]:
                preds.append(Prediction(
                    horizon_hours=h,
                    event_type="hospital_overload",
                    probability=min(0.92, 0.3 + (100 - min(n.health for n in hospitals)) / 100),
                    severity="high" if any(n.health < 30 for n in hospitals) else "medium",
                    description=f"Hospital capacity stress likely within {h}h based on current damage",
                    affected_nodes=[n.id for n in hospitals],
                ))

        power = [n for n in self.state.nodes if n.type == "power" and n.health < 80]
        if power:
            preds.append(Prediction(
                horizon_hours=24,
                event_type="power_failure",
                probability=0.75 if any(n.status == NodeStatus.DESTROYED for n in power) else 0.45,
                severity="critical",
                description="Grid instability may cause secondary outages within 24h",
                affected_nodes=[n.id for n in power],
            ))

        if self.state.active_disaster == DisasterType.WILDFIRE:
            preds.append(Prediction(
                horizon_hours=6,
                event_type="fire_expansion",
                probability=0.82,
                severity="high",
                description="Wildfire spread continuing based on current radius trajectory",
            ))

        cascade_risk = sum(1 for n in self.state.nodes if n.status in (NodeStatus.CRITICAL, NodeStatus.DESTROYED))
        if cascade_risk >= 3:
            preds.append(Prediction(
                horizon_hours=72,
                event_type="cascading_failure",
                probability=min(0.9, 0.2 + cascade_risk * 0.12),
                severity="critical",
                description="Multiple critical nodes offline — cascade probability elevated",
            ))

        return preds[:12]

    def what_if(self, scenario: str, node_id: Optional[str] = None, mult: float = 1.0) -> dict[str, Any]:
        cloned = copy.deepcopy(self.state)
        sim = CitySimulator.__new__(CitySimulator)
        sim._debate_shown = False
        sim._graph = self._graph
        sim.state = cloned

        if scenario == "bridge_collapse" and node_id:
            n = sim._node_map().get(node_id)
            if n:
                n.health = 0
                n.status = NodeStatus.DESTROYED
        elif scenario == "double_rainfall":
            if sim.state.epicenter:
                sim._apply_radius_damage(
                    sim.state.epicenter.latitude,
                    sim.state.epicenter.longitude,
                    sim.state.disaster_radius * 1.5,
                    sim.state.disaster_magnitude * mult,
                    DISASTER_CONFIG.get("flood", DISASTER_CONFIG["flood"]),
                )
        elif scenario == "second_earthquake":
            center = sim.state.epicenter or GeoPoint(latitude=35.6892, longitude=51.3890)
            sim._apply_radius_damage(center.latitude, center.longitude, 120, 5.0 * mult, DISASTER_CONFIG["earthquake"])

        for _ in range(5):
            sim._tick_cascade()

        return {
            "scenario": scenario,
            "projected_city_health": sim._compute_metrics(sim.state.nodes).city_health,
            "projected_predictions": [p.model_dump() for p in sim.generate_predictions()],
            "impact_delta": round(sim._compute_metrics(sim.state.nodes).city_health - self.state.metrics.city_health, 1),
        }

    def get_cascade_chain(self) -> list[dict[str, Any]]:
        chains: list[dict[str, Any]] = []
        for node in self.state.nodes:
            if node.status in (NodeStatus.CRITICAL, NodeStatus.DESTROYED):
                nm = self._node_map()
                failed_deps = [nm[d].name for d in node.deps if d in nm and nm[d].status != NodeStatus.OPERATIONAL]
                if failed_deps:
                    chains.append({
                        "node": node.name,
                        "status": node.status.value,
                        "caused_by": failed_deps,
                        "dependents": [n.name for n in self.state.nodes if node.id in n.deps],
                    })
        return chains

    def get_roads(self) -> list[dict[str, str]]:
        return [{"from": a, "to": b} for a, b in ROADS]

    def replay_at(self, index: int) -> Optional[dict]:
        if 0 <= index < len(self._replay):
            return self._replay[index]
        return None

    @property
    def replay_count(self) -> int:
        return len(self._replay)


simulator = CitySimulator()
