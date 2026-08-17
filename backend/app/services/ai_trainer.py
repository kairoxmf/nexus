"""Orchestrates automatic training for RL agents, optimizer, and chatbot knowledge."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from app.engine.grid_simulator import grid_simulator
from app.engine.impact_matrix import BUILDING_LABELS, BUILDING_COSTS, BUILDABLE_TYPES, impact_matrix_rows
from app.engine.optimizer import run_nsga2
from app.engine.rl_agents import ppo_train, q_learning_train
from app.engine.simulator import simulator


class AITrainer:
    def __init__(self) -> None:
        self.auto_enabled = False
        self.cycle_count = 0
        self.last_run_at: str | None = None
        self.knowledge_version = 0
        self.knowledge_snippets: list[str] = []
        self.qa_pairs: list[dict[str, str]] = []
        self.logs: list[dict[str, Any]] = []
        self.agents: dict[str, dict[str, Any]] = {
            "q_learning": {"status": "idle", "progress": 0, "last_result": None},
            "ppo": {"status": "idle", "progress": 0, "last_result": None},
            "optimizer": {"status": "idle", "progress": 0, "last_result": None},
            "chatbot": {"status": "idle", "progress": 0, "last_result": None},
        }
        self._auto_task: asyncio.Task[None] | None = None
        self._running = False

    def _log(self, message: str, level: str = "info") -> None:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "message": message,
        }
        self.logs.append(entry)
        self.logs = self.logs[-40:]

    def _set_agent(self, name: str, **fields: Any) -> None:
        self.agents[name] = {**self.agents.get(name, {}), **fields}

    def get_knowledge_block(self) -> str:
        if not self.knowledge_snippets:
            return ""
        lines = ["TRAINED KNOWLEDGE (auto-training from grid simulation):"]
        lines.extend(f"- {s}" for s in self.knowledge_snippets[-12:])
        if self.qa_pairs:
            lines.append("Example Q&A from training:")
            for pair in self.qa_pairs[-4:]:
                lines.append(f"Q: {pair['q']}\nA: {pair['a']}")
        return "\n".join(lines)

    def _build_chatbot_knowledge(
        self,
        q_result: dict[str, Any] | None,
        ppo_result: dict[str, Any] | None,
        opt_result: dict[str, Any] | None,
    ) -> dict[str, Any]:
        grid = grid_simulator.get_state()
        sim = simulator.state
        metrics = grid.get("metrics", {})
        placements = grid.get("placements", [])

        building_counts: dict[str, int] = {}
        for p in placements:
            sym = p.get("building", "?")
            building_counts[sym] = building_counts.get(sym, 0) + 1

        top_buildings = sorted(building_counts.items(), key=lambda x: -x[1])[:5]
        building_summary = ", ".join(
            f"{BUILDING_LABELS.get(s, s)}×{n}" for s, n in top_buildings
        ) or "none yet"

        snippets = [
            f"Grid city Y{grid.get('year')} W{grid.get('week')}: {grid.get('population', 0)} citizens, "
            f"{len(placements)} structures ({building_summary}).",
            f"Grid metrics — survival {metrics.get('survival', 0):.0f}, security {metrics.get('security', 0):.0f}, "
            f"food {metrics.get('food', 0):.0f}, satisfaction {metrics.get('satisfaction', 0):.0f}, "
            f"budget ${grid.get('budget', 0):.0f}.",
            f"Main simulation city health {sim.metrics.city_health:.0f}%, "
            f"active disaster: {sim.active_disaster or 'none'}.",
        ]

        if q_result:
            snippets.append(
                f"Q-Learning trained {q_result.get('episodes', 0)} episodes — "
                f"avg reward {q_result.get('avg_reward', 0)}, {q_result.get('q_states_learned', 0)} states learned."
            )
        if ppo_result:
            snippets.append(
                f"PPO trained {ppo_result.get('episodes', 0)} episodes — avg reward {ppo_result.get('avg_reward', 0)}."
            )
        if opt_result and opt_result.get("best"):
            best = opt_result["best"]
            plan_parts = [f"{BUILDING_LABELS.get(k, k)}×{v}" for k, v in best.get("plan", {}).items() if v]
            snippets.append(
                f"NSGA-II best plan: {', '.join(plan_parts[:6]) or 'empty'} — score {best.get('score', 0):.1f}."
            )

        impact_hints = []
        for row in impact_matrix_rows()[:6]:
            sym = row["symbol"]
            label = BUILDING_LABELS.get(sym, sym)
            boosts = [k for k in ("survival", "security", "food", "satisfaction") if row.get(k, 0) > 0]
            if boosts:
                impact_hints.append(f"{label} boosts {', '.join(boosts)}")
        if impact_hints:
            snippets.append("Building tips: " + "; ".join(impact_hints[:4]) + ".")

        qa: list[dict[str, str]] = [
            {
                "q": "What buildings should I prioritize for security?",
                "a": "Police (+2 security, +2 survival) and Rich House (+2 security). Schools and Roads also help.",
            },
            {
                "q": "How is my grid city doing?",
                "a": (
                    f"Population {grid.get('population', 0)}, budget ${grid.get('budget', 0):.0f}, "
                    f"environment {grid.get('environment_score', 0):.0f}%. "
                    f"Security {metrics.get('security', 0):.0f}%, food {metrics.get('food', 0):.0f}%."
                ),
            },
            {
                "q": "What did the AI agents learn?",
                "a": (
                    f"Q-Learning avg reward {q_result.get('avg_reward', 0) if q_result else 'N/A'}, "
                    f"PPO avg reward {ppo_result.get('avg_reward', 0) if ppo_result else 'N/A'}. "
                    f"Training cycle #{self.cycle_count} completed."
                ),
            },
        ]

        self.knowledge_snippets = snippets
        self.qa_pairs = qa
        self.knowledge_version += 1

        return {
            "knowledge_version": self.knowledge_version,
            "snippets": snippets,
            "qa_pairs": qa,
            "snippet_count": len(snippets),
        }

    def _run_cycle_sync(self, episodes: int = 8) -> dict[str, Any]:
        results: dict[str, Any] = {}

        self._set_agent("q_learning", status="running", progress=10)
        self._log("Q-Learning training started")
        q_result = q_learning_train(episodes=episodes, steps_per_episode=20)
        results["q_learning"] = q_result
        self._set_agent("q_learning", status="done", progress=100, last_result=q_result)
        self._log(f"Q-Learning done — avg reward {q_result.get('avg_reward', 0)}")

        self._set_agent("ppo", status="running", progress=10)
        self._log("PPO training started")
        ppo_result = ppo_train(episodes=episodes, steps_per_episode=20)
        results["ppo"] = ppo_result
        self._set_agent("ppo", status="done", progress=100, last_result=ppo_result)
        self._log(f"PPO done — avg reward {ppo_result.get('avg_reward', 0)}")

        self._set_agent("optimizer", status="running", progress=10)
        self._log("NSGA-II optimization started")
        opt_result = run_nsga2(population_size=24, generations=12, max_buildings=10, simulation_steps=12)
        results["optimizer"] = opt_result
        self._set_agent("optimizer", status="done", progress=100, last_result={
            "best_score": opt_result.get("best", {}).get("score"),
            "pareto_size": len(opt_result.get("pareto_front", [])),
        })
        self._log("NSGA-II optimization complete")

        self._set_agent("chatbot", status="running", progress=50)
        self._log("Chatbot knowledge update started")
        chat_result = self._build_chatbot_knowledge(q_result, ppo_result, opt_result)
        results["chatbot"] = chat_result
        self._set_agent("chatbot", status="done", progress=100, last_result=chat_result)
        self._log(f"Chatbot knowledge v{self.knowledge_version} — {chat_result.get('snippet_count', 0)} snippets")

        self.cycle_count += 1
        self.last_run_at = datetime.now(timezone.utc).isoformat()
        return results

    async def run_cycle(self, episodes: int = 8) -> dict[str, Any]:
        if self._running:
            return {"ok": False, "msg": "Training already in progress"}
        self._running = True
        for name in self.agents:
            if self.agents[name]["status"] != "running":
                self._set_agent(name, status="idle", progress=0)
        try:
            results = await asyncio.to_thread(self._run_cycle_sync, episodes)
            return {"ok": True, "cycle": self.cycle_count, "results": results}
        except Exception as exc:
            self._log(str(exc), level="error")
            return {"ok": False, "msg": str(exc)}
        finally:
            self._running = False

    async def start_auto(self, interval_sec: int = 60, episodes: int = 5) -> None:
        self.auto_enabled = True
        if self._auto_task and not self._auto_task.done():
            return
        self._auto_task = asyncio.create_task(self._auto_loop(interval_sec, episodes))
        self._log(f"Auto-training enabled (every {interval_sec}s)")

    async def stop_auto(self) -> None:
        self.auto_enabled = False
        if self._auto_task and not self._auto_task.done():
            self._auto_task.cancel()
            try:
                await self._auto_task
            except asyncio.CancelledError:
                pass
        self._auto_task = None
        self._log("Auto-training disabled")

    async def _auto_loop(self, interval_sec: int, episodes: int) -> None:
        while self.auto_enabled:
            if not self._running:
                await self.run_cycle(episodes=episodes)
            await asyncio.sleep(interval_sec)

    def get_status(self) -> dict[str, Any]:
        return {
            "auto_enabled": self.auto_enabled,
            "running": self._running,
            "cycle_count": self.cycle_count,
            "last_run_at": self.last_run_at,
            "knowledge_version": self.knowledge_version,
            "agents": self.agents,
            "logs": self.logs[-15:],
            "knowledge_preview": self.knowledge_snippets[-6:],
        }

    def export_training(self) -> dict[str, Any]:
        return {
            "format": "nexus_ai_training_v1",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "auto_enabled": self.auto_enabled,
            "cycle_count": self.cycle_count,
            "last_run_at": self.last_run_at,
            "knowledge_version": self.knowledge_version,
            "knowledge_snippets": self.knowledge_snippets,
            "qa_pairs": self.qa_pairs,
            "agents": self.agents,
            "logs": self.logs,
            "buildings": {s: BUILDING_LABELS[s] for s in BUILDABLE_TYPES},
            "costs": BUILDING_COSTS,
        }


ai_trainer = AITrainer()
