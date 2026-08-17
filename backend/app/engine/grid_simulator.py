"""30×30 autonomous city grid simulator with multi-objective metrics."""

from __future__ import annotations

import math
import random
from copy import deepcopy
from typing import Any

import numpy as np

from app.engine.impact_matrix import (
    BUILDING_COSTS,
    BUILDING_IMPACT,
    BUILDING_LABELS,
    BUILDABLE_TYPES,
    METRIC_KEYS,
    SOLAR_ZONE,
    grid_to_geo,
)

GRID_SIZE = 30
MAX_TICKS = 100
DAYS_PER_WEEK = 7
DAYS_PER_MONTH = 30

HOUSE_SYMBOLS = ("=", "h", "$")


def diminishing_score(raw: float, cap: float = 100.0, rate: float = 0.08) -> float:
    return round(cap * (1.0 - math.exp(-rate * max(0.0, raw))), 2)


class GridCitySimulator:
    def __init__(self, grid_size: int = GRID_SIZE, initial_budget: int = 5000) -> None:
        self.grid_size = grid_size
        self.initial_budget = initial_budget
        self.reset()

    def reset(self) -> dict[str, Any]:
        self.grid = np.full((self.grid_size, self.grid_size), ".", dtype=str)
        self.budget = float(self.initial_budget)
        self.ticks = 0
        self.day = 1
        self.week = 1
        self.month = 1
        self.year = 2026
        self.population = 0
        self.stability = 100.0
        self.power_supply = 0
        self.water_supply = 0
        self.food_supply = 0
        self.healthcare_capacity = 0
        self.environment_score = 50.0
        self.solar_output = 0
        self.metrics = {k: 50.0 for k in METRIC_KEYS}
        self.metrics["money"] = float(self.initial_budget)
        self.last_events: list[str] = []
        self.last_reward = 0.0
        mid = self.grid_size // 2
        self.grid[mid : mid + 2, mid : mid + 2] = "C"
        self._recalculate()
        return self.get_state()

    def get_empty_cells(self) -> list[tuple[int, int]]:
        return [(int(x), int(y)) for x, y in np.argwhere(self.grid == ".")]

    def _is_solar_allowed(self, x: int, y: int) -> bool:
        return (x, y) in SOLAR_ZONE

    def build(self, x: int, y: int, building_type: str) -> tuple[bool, str]:
        if building_type not in BUILDABLE_TYPES:
            return False, f"Unknown building type: {building_type}"
        if not (0 <= x < self.grid_size and 0 <= y < self.grid_size):
            return False, "Coordinates out of bounds."
        if self.grid[x, y] != ".":
            return False, "Cell already occupied."
        if building_type == "G" and not self._is_solar_allowed(x, y):
            return False, "Solar panels can only be placed in the top-left corner zone."
        cost = BUILDING_COSTS.get(building_type, 0)
        if self.budget < cost:
            return False, "Insufficient budget."
        self.grid[x, y] = building_type
        self.budget -= cost
        label = BUILDING_LABELS.get(building_type, building_type)
        return True, f"Built {label} at ({x}, {y})"

    def _count(self, symbol: str) -> int:
        return int(np.sum(self.grid == symbol))

    def _house_population(self) -> int:
        return (
            self._count("=") * 10
            + self._count("h") * 6
            + self._count("$") * 4
        )

    def _compute_citizens(self) -> list[dict[str, float | int | str]]:
        citizens: list[dict[str, float | int | str]] = []
        cid = 0
        for symbol, per_house in (("=", 8), ("h", 5), ("$", 3)):
            cells = np.argwhere(self.grid == symbol)
            for x, y in cells:
                lat, lng = grid_to_geo(int(x), int(y))
                for i in range(per_house):
                    angle = (i / max(1, per_house)) * math.pi * 2
                    citizens.append(
                        {
                            "id": cid,
                            "x": int(x),
                            "y": int(y),
                            "latitude": lat + math.sin(angle) * 0.00008,
                            "longitude": lng + math.cos(angle) * 0.00008,
                            "wealth": "rich" if symbol == "$" else "poor" if symbol == "h" else "standard",
                        }
                    )
                    cid += 1
        return citizens

    def _compute_placements(self) -> list[dict[str, object]]:
        placements: list[dict[str, object]] = []
        for x, y in np.argwhere(self.grid != "."):
            sym = str(self.grid[int(x), int(y)])
            if sym == ".":
                continue
            lat, lng = grid_to_geo(int(x), int(y))
            placements.append(
                {
                    "x": int(x),
                    "y": int(y),
                    "building": sym,
                    "label": BUILDING_LABELS.get(sym, sym),
                    "latitude": lat,
                    "longitude": lng,
                }
            )
        return placements

    def _compute_park_zones(self) -> list[dict[str, object]]:
        zones: list[dict[str, object]] = []
        for x, y in np.argwhere(self.grid == "P"):
            lat, lng = grid_to_geo(int(x), int(y))
            zones.append(
                {
                    "x": int(x),
                    "y": int(y),
                    "latitude": lat,
                    "longitude": lng,
                    "radius_m": 55,
                    "health_boost": 12,
                }
            )
        return zones

    def _apply_impact_matrix(self) -> dict[str, float]:
        raw = {k: 0.0 for k in METRIC_KEYS}
        raw["money"] = self.budget
        for symbol, impacts in BUILDING_IMPACT.items():
            count = self._count(symbol)
            if count == 0:
                continue
            for metric, coef in impacts.items():
                raw[metric] += coef * count * 8.0

        self.population = self._house_population()
        self.food_supply = self._count("F") * 50
        self.water_supply = self._count("W") * 60
        self.power_supply = self._count("E") * 75 + self._count("G") * 35
        self.solar_output = self._count("G") * 35
        self.healthcare_capacity = self._count("S") * 80

        parks = self._count("P")
        self.environment_score = min(
            100.0,
            40.0 + parks * 14.0 + self._count("G") * 6.0 + self._count("F") * 2.0,
        )

        food_deficit = max(0, self.population - self.food_supply)
        water_deficit = max(0, self.population - self.water_supply)
        power_deficit = max(0, self.population - self.power_supply)
        raw["survival"] -= (food_deficit + water_deficit + power_deficit) * 0.15
        raw["food"] += max(0, self.food_supply - self.population) * 0.05
        raw["money"] += (
            self._count("I") * 40
            + self._count("M") * 25
            + self._count("$") * 30
            + self.population * 2
            + self.solar_output * 0.5
        )
        raw["satisfaction"] += self.environment_score * 0.25

        scored: dict[str, float] = {}
        for key in METRIC_KEYS:
            if key == "money":
                scored[key] = round(max(0.0, raw[key]), 2)
            else:
                scored[key] = diminishing_score(max(0.0, raw[key] + 20.0))
        return scored

    def _recalculate(self) -> None:
        self.metrics = self._apply_impact_matrix()
        parks = self._count("P")
        hospitals = self._count("S")
        wellbeing_boost = parks * 0.8 + hospitals * 0.3 + self.environment_score * 0.05
        self.metrics["satisfaction"] = min(100.0, self.metrics["satisfaction"] + wellbeing_boost)
        self.metrics["money"] = round(self.budget, 2)

    def _advance_time(self) -> None:
        self.ticks += 1
        self.day += 1
        if self.day > DAYS_PER_MONTH:
            self.day = 1
            self.month += 1
            income = self._count("I") * 100 + self.population * 5 + self.solar_output * 2
            maintenance = (self._count("S") + self._count("E") + self._count("W")) * 20
            self.budget += income - maintenance
        if self.day % DAYS_PER_WEEK == 0:
            self.week += 1
        if self.month > 12:
            self.month = 1
            self.year += 1

    def _trigger_disasters(self) -> list[str]:
        events: list[str] = []
        if random.random() >= 0.08:
            return events
        disaster = random.choice(["EARTHQUAKE", "FIRE", "FLOOD", "PANDEMIC"])
        if disaster == "EARTHQUAKE":
            cx, cy = random.randint(2, self.grid_size - 3), random.randint(2, self.grid_size - 3)
            radius = random.randint(1, 3)
            destroyed = 0
            for r in range(-radius, radius + 1):
                for c in range(-radius, radius + 1):
                    nx, ny = cx + r, cy + c
                    if 0 <= nx < self.grid_size and 0 <= ny < self.grid_size:
                        if self.grid[nx, ny] not in (".", "C") and random.random() < 0.6:
                            self.grid[nx, ny] = "."
                            destroyed += 1
            self.stability = max(0.0, self.stability - 15)
            events.append(f"Earthquake at ({cx},{cy}) destroyed {destroyed} structures")
        elif disaster == "FIRE":
            built = np.argwhere((self.grid != ".") & (self.grid != "W") & (self.grid != "G"))
            if len(built):
                fx, fy = random.choice(built)
                protected = any(
                    self.grid[nx, ny] in ("T", "L")
                    for r in range(-4, 5)
                    for c in range(-4, 5)
                    for nx, ny in [(int(fx) + r, int(fy) + c)]
                    if 0 <= nx < self.grid_size and 0 <= ny < self.grid_size
                )
                if protected:
                    self.stability = max(0.0, self.stability - 2)
                    events.append(f"Fire at ({int(fx)},{int(fy)}) contained")
                else:
                    self.grid[int(fx), int(fy)] = "."
                    self.stability = max(0.0, self.stability - 8)
                    events.append(f"Fire destroyed structure at ({int(fx)},{int(fy)})")
        elif disaster == "FLOOD":
            water_cells = np.argwhere(self.grid == "W")
            if len(water_cells):
                wx, wy = random.choice(water_cells)
                flooded = 0
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = int(wx) + dx, int(wy) + dy
                    if 0 <= nx < self.grid_size and 0 <= ny < self.grid_size:
                        if self.grid[nx, ny] not in (".", "W", "C", "G"):
                            self.grid[nx, ny] = "."
                            flooded += 1
                self.stability = max(0.0, self.stability - 10)
                events.append(f"Flood near ({int(wx)},{int(wy)}) washed {flooded} buildings")
        elif disaster == "PANDEMIC":
            if self.population > 50:
                deficit = max(0, self.population - self.healthcare_capacity)
                drop = 20 if deficit > 0 else 5
                self.metrics["satisfaction"] = max(0.0, self.metrics["satisfaction"] - drop)
                self.stability = max(0.0, self.stability - (10 if deficit else 2))
                events.append("Pandemic outbreak" if deficit else "Pandemic controlled")
        return events

    def step(self, action: tuple[int, int, str] | None = None) -> tuple[dict[str, Any], float, bool, dict[str, Any]]:
        self._advance_time()
        msg = "No action."
        if action:
            x, y, symbol = action
            _, msg = self.build(x, y, symbol)
        self._recalculate()
        self.stability = min(100.0, self.stability + 0.2)
        events = self._trigger_disasters()
        self._recalculate()
        self.last_events = events

        reward = (
            self.metrics["satisfaction"] * 0.25
            + self.metrics["survival"] * 0.25
            + self.metrics["security"] * 0.15
            + self.metrics["accessibility"] * 0.1
            + self.metrics["food"] * 0.1
            + self.metrics["money"] * 0.0005
            + self.stability * 0.15
            + self.environment_score * 0.05
        )
        self.last_reward = round(reward, 3)
        done = self.stability <= 0 or self.ticks >= MAX_TICKS
        info = {"msg": msg, "events": events, "reward": self.last_reward}
        return self.get_state(), self.last_reward, done, info

    def get_state(self) -> dict[str, Any]:
        return {
            "grid": self.grid.tolist(),
            "grid_size": self.grid_size,
            "budget": round(self.budget, 2),
            "population": self.population,
            "stability": round(self.stability, 2),
            "environment_score": round(self.environment_score, 1),
            "solar_output": self.solar_output,
            "ticks": self.ticks,
            "day": self.day,
            "week": self.week,
            "month": self.month,
            "year": self.year,
            "max_ticks": MAX_TICKS,
            "metrics": dict(self.metrics),
            "supplies": {
                "power": self.power_supply,
                "water": self.water_supply,
                "food": self.food_supply,
                "healthcare": self.healthcare_capacity,
            },
            "placements": self._compute_placements(),
            "citizens": self._compute_citizens(),
            "park_zones": self._compute_park_zones(),
            "solar_zone": [{"x": x, "y": y} for x, y in sorted(SOLAR_ZONE)],
            "last_events": list(self.last_events),
            "last_reward": self.last_reward,
        }

    def clone(self) -> GridCitySimulator:
        other = GridCitySimulator(self.grid_size, self.initial_budget)
        other.grid = self.grid.copy()
        other.budget = self.budget
        other.ticks = self.ticks
        other.day = self.day
        other.week = self.week
        other.month = self.month
        other.year = self.year
        other.population = self.population
        other.stability = self.stability
        other.metrics = deepcopy(self.metrics)
        other.power_supply = self.power_supply
        other.water_supply = self.water_supply
        other.food_supply = self.food_supply
        other.healthcare_capacity = self.healthcare_capacity
        other.environment_score = self.environment_score
        other.solar_output = self.solar_output
        return other

    def place_plan(self, counts: dict[str, int]) -> bool:
        cells = self.get_empty_cells()
        random.shuffle(cells)
        for symbol in BUILDABLE_TYPES:
            for _ in range(counts.get(symbol, 0)):
                placed = False
                if symbol == "G":
                    solar_cells = [c for c in cells if self._is_solar_allowed(c[0], c[1])]
                    target_cells = solar_cells or []
                else:
                    target_cells = cells
                for x, y in target_cells:
                    ok, _ = self.build(x, y, symbol)
                    if ok:
                        if (x, y) in cells:
                            cells.remove((x, y))
                        placed = True
                        break
                if not placed:
                    return False
        self._recalculate()
        return True


grid_simulator = GridCitySimulator()
