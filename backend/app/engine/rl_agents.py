"""Q-Learning and simplified PPO policy agents for grid city building."""

from __future__ import annotations

import math
import random
from typing import Any

import numpy as np

from app.engine.grid_simulator import GridCitySimulator, MAX_TICKS
from app.engine.impact_matrix import BUILDABLE_TYPES

Q_TABLE: dict[tuple[Any, ...], np.ndarray] = {}
PPO_WEIGHTS: np.ndarray = np.zeros(len(BUILDABLE_TYPES))
PPO_BASELINE = 0.0


def _state_key(sim: GridCitySimulator) -> tuple[int, ...]:
    return tuple(int(sim.metrics[k] // 10) for k in ("money", "survival", "security", "accessibility", "food", "satisfaction"))


def _pick_cell(sim: GridCitySimulator) -> tuple[int, int] | None:
    cells = sim.get_empty_cells()
    return random.choice(cells) if cells else None


def q_learning_step(sim: GridCitySimulator, alpha: float = 0.15, gamma: float = 0.9, epsilon: float = 0.2) -> dict[str, Any]:
    """Run one Q-Learning action on the current simulator."""
    state = _state_key(sim)
    if state not in Q_TABLE:
        Q_TABLE[state] = np.zeros(len(BUILDABLE_TYPES))
    q = Q_TABLE[state]

    if random.random() < epsilon:
        action_idx = random.randrange(len(BUILDABLE_TYPES))
    else:
        action_idx = int(np.argmax(q))

    symbol = BUILDABLE_TYPES[action_idx]
    cell = _pick_cell(sim)
    if cell is None:
        return {"ok": False, "msg": "No empty cells", "algorithm": "Q-Learning"}

    x, y = cell
    prev_reward = sim.last_reward
    _, reward, done, info = sim.step((x, y, symbol))
    next_state = _state_key(sim)
    if next_state not in Q_TABLE:
        Q_TABLE[next_state] = np.zeros(len(BUILDABLE_TYPES))

    td_target = reward + (0 if done else gamma * float(np.max(Q_TABLE[next_state])))
    q[action_idx] += alpha * (td_target - q[action_idx])

    return {
        "ok": True,
        "algorithm": "Q-Learning",
        "action": {"x": x, "y": y, "building": symbol},
        "reward": reward,
        "td_error": round(td_target - prev_reward, 3),
        "epsilon": epsilon,
        "msg": info.get("msg"),
    }


def q_learning_train(episodes: int = 5, steps_per_episode: int = 20) -> dict[str, Any]:
    rewards: list[float] = []
    for _ in range(episodes):
        sim = GridCitySimulator()
        ep_reward = 0.0
        for step in range(steps_per_episode):
            result = q_learning_step(sim, epsilon=max(0.05, 0.3 - step * 0.01))
            if not result.get("ok"):
                break
            ep_reward += float(result.get("reward", 0))
        rewards.append(round(ep_reward, 2))
    return {
        "algorithm": "Q-Learning",
        "episodes": episodes,
        "steps_per_episode": steps_per_episode,
        "episode_rewards": rewards,
        "avg_reward": round(float(np.mean(rewards)) if rewards else 0, 2),
        "q_states_learned": len(Q_TABLE),
    }


def _ppo_features(sim: GridCitySimulator) -> np.ndarray:
    return np.array([sim.metrics[k] / 100.0 for k in ("money", "survival", "security", "accessibility", "food", "satisfaction")] + [sim.stability / 100.0])


def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - np.max(x))
    return e / e.sum()


def ppo_step(sim: GridCitySimulator, lr: float = 0.05) -> dict[str, Any]:
    """Simplified policy-gradient (PPO-style) action step."""
    global PPO_WEIGHTS, PPO_BASELINE
    if PPO_WEIGHTS.size == 0:
        PPO_WEIGHTS = np.random.randn(len(BUILDABLE_TYPES)) * 0.01

    features = _ppo_features(sim)
    logits = PPO_WEIGHTS + np.dot(features, np.ones(len(BUILDABLE_TYPES))) * 0.1
    probs = _softmax(logits)
    action_idx = int(np.random.choice(len(BUILDABLE_TYPES), p=probs))
    symbol = BUILDABLE_TYPES[action_idx]
    cell = _pick_cell(sim)
    if cell is None:
        return {"ok": False, "msg": "No empty cells", "algorithm": "PPO"}

    x, y = cell
    _, reward, _, info = sim.step((x, y, symbol))
    advantage = reward - PPO_BASELINE
    PPO_BASELINE = 0.9 * PPO_BASELINE + 0.1 * reward
    PPO_WEIGHTS += lr * advantage * (1.0 - probs)
    PPO_WEIGHTS[action_idx] += lr * advantage * (1.0 - probs[action_idx])

    return {
        "ok": True,
        "algorithm": "PPO",
        "action": {"x": x, "y": y, "building": symbol},
        "reward": reward,
        "advantage": round(advantage, 3),
        "probability": round(float(probs[action_idx]), 4),
        "msg": info.get("msg"),
    }


def ppo_train(episodes: int = 5, steps_per_episode: int = 20) -> dict[str, Any]:
    rewards: list[float] = []
    for _ in range(episodes):
        sim = GridCitySimulator()
        ep_reward = 0.0
        for _ in range(steps_per_episode):
            result = ppo_step(sim)
            if not result.get("ok"):
                break
            ep_reward += float(result.get("reward", 0))
        rewards.append(round(ep_reward, 2))
    return {
        "algorithm": "PPO",
        "episodes": episodes,
        "steps_per_episode": steps_per_episode,
        "episode_rewards": rewards,
        "avg_reward": round(float(np.mean(rewards)) if rewards else 0, 2),
        "policy_weights": PPO_WEIGHTS.round(4).tolist(),
    }
