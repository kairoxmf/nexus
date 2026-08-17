"""NSGA-II multi-objective optimizer for grid city building plans."""

from __future__ import annotations

import random
from copy import deepcopy
from typing import Any

import numpy as np

from app.engine.grid_simulator import GridCitySimulator, MAX_TICKS
from app.engine.impact_matrix import BUILDABLE_TYPES, METRIC_KEYS

POPULATION_SIZE = 40
GENERATIONS = 25
MUTATION_RATE = 0.15


def _random_individual(max_buildings: int = 12) -> dict[str, int]:
    counts = {t: 0 for t in BUILDABLE_TYPES}
    n = random.randint(3, max_buildings)
    for _ in range(n):
        counts[random.choice(BUILDABLE_TYPES)] += 1
    return counts


def _evaluate_plan(counts: dict[str, int], steps: int = 15) -> dict[str, float]:
    sim = GridCitySimulator()
    sim.place_plan(counts)
    for _ in range(steps):
        sim.step(None)
    return sim.metrics


def _objectives(metrics: dict[str, float]) -> np.ndarray:
    return np.array([metrics[k] for k in METRIC_KEYS], dtype=float)


def _dominates(a: np.ndarray, b: np.ndarray) -> bool:
    return bool(np.all(a >= b) and np.any(a > b))


def _fast_non_dominated_sort(objectives: list[np.ndarray]) -> list[list[int]]:
    fronts: list[list[int]] = [[]]
    domination_count = [0] * len(objectives)
    dominated_sets: list[list[int]] = [[] for _ in objectives]

    for p in range(len(objectives)):
        for q in range(len(objectives)):
            if p == q:
                continue
            if _dominates(objectives[p], objectives[q]):
                dominated_sets[p].append(q)
            elif _dominates(objectives[q], objectives[p]):
                domination_count[p] += 1
        if domination_count[p] == 0:
            fronts[0].append(p)

    i = 0
    while fronts[i]:
        next_front: list[int] = []
        for p in fronts[i]:
            for q in dominated_sets[p]:
                domination_count[q] -= 1
                if domination_count[q] == 0:
                    next_front.append(q)
        i += 1
        fronts.append(next_front)
    return fronts[:-1]


def _crowding_distance(front: list[int], objectives: list[np.ndarray]) -> dict[int, float]:
    if len(front) <= 2:
        return {i: float("inf") for i in front}
    dist = {i: 0.0 for i in front}
    obj_matrix = np.array([objectives[i] for i in front])
    for m in range(obj_matrix.shape[1]):
        order = np.argsort(obj_matrix[:, m])
        dist[front[order[0]]] = float("inf")
        dist[front[order[-1]]] = float("inf")
        min_v, max_v = obj_matrix[order[0], m], obj_matrix[order[-1], m]
        if max_v - min_v < 1e-9:
            continue
        for k in range(1, len(front) - 1):
            prev_i, next_i = front[order[k - 1]], front[order[k + 1]]
            dist[front[order[k]]] += (objectives[next_i][m] - objectives[prev_i][m]) / (max_v - min_v)
    return dist


def _crossover(a: dict[str, int], b: dict[str, int]) -> dict[str, int]:
    child = {t: 0 for t in BUILDABLE_TYPES}
    for t in BUILDABLE_TYPES:
        child[t] = a[t] if random.random() < 0.5 else b[t]
        if random.random() < 0.2:
            child[t] += random.randint(0, 1)
    return child


def _mutate(ind: dict[str, int]) -> dict[str, int]:
    out = deepcopy(ind)
    if random.random() < MUTATION_RATE:
        t = random.choice(BUILDABLE_TYPES)
        out[t] = max(0, out[t] + random.choice([-1, 1]))
    return out


def run_nsga2(
    population_size: int = POPULATION_SIZE,
    generations: int = GENERATIONS,
    max_buildings: int = 12,
    simulation_steps: int = 15,
) -> dict[str, Any]:
    """Run NSGA-II and return Pareto front solutions."""
    population = [_random_individual(max_buildings) for _ in range(population_size)]
    obj_cache: list[np.ndarray] = [_objectives(_evaluate_plan(p, simulation_steps)) for p in population]

    for _ in range(generations):
        offspring: list[dict[str, int]] = []
        while len(offspring) < population_size:
            a, b = random.sample(population, 2)
            child = _mutate(_crossover(a, b))
            offspring.append(child)
        combined = population + offspring
        combined_obj = obj_cache + [_objectives(_evaluate_plan(c, simulation_steps)) for c in offspring]
        fronts = _fast_non_dominated_sort(combined_obj)
        next_pop: list[dict[str, int]] = []
        next_obj: list[np.ndarray] = []
        for front in fronts:
            if len(next_pop) + len(front) <= population_size:
                for idx in front:
                    next_pop.append(combined[idx])
                    next_obj.append(combined_obj[idx])
            else:
                dist = _crowding_distance(front, combined_obj)
                remaining = population_size - len(next_pop)
                sorted_front = sorted(front, key=lambda i: dist[i], reverse=True)
                for idx in sorted_front[:remaining]:
                    next_pop.append(combined[idx])
                    next_obj.append(combined_obj[idx])
                break
        population, obj_cache = next_pop, next_obj

    pareto_front: list[dict[str, Any]] = []
    fronts = _fast_non_dominated_sort(obj_cache)
    if fronts:
        for idx in fronts[0][:12]:
            metrics = _evaluate_plan(population[idx], simulation_steps)
            pareto_front.append(
                {
                    "plan": population[idx],
                    "metrics": metrics,
                    "objectives": {k: metrics[k] for k in METRIC_KEYS},
                    "score": round(float(np.mean(list(metrics.values()))), 2),
                }
            )
    pareto_front.sort(key=lambda s: s["score"], reverse=True)
    return {
        "algorithm": "NSGA-II",
        "population_size": population_size,
        "generations": generations,
        "pareto_front": pareto_front,
        "best": pareto_front[0] if pareto_front else None,
    }
