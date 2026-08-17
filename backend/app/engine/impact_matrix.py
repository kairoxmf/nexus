"""Building → metric impact matrix from the project whiteboard."""

from __future__ import annotations

from typing import Final

METRIC_KEYS: Final[tuple[str, ...]] = (
    "money",
    "survival",
    "security",
    "accessibility",
    "food",
    "satisfaction",
)

BUILDING_IMPACT: Final[dict[str, dict[str, float]]] = {
    "W": {"money": -1, "survival": 1, "security": 0, "accessibility": 1, "food": 0, "satisfaction": 1},
    "E": {"money": -1, "survival": 1, "security": 0, "accessibility": 1, "food": 0.5, "satisfaction": 1},
    "=": {"money": -1, "survival": 1, "security": 1, "accessibility": 0, "food": 0, "satisfaction": 1},
    "h": {"money": 0, "survival": 0.5, "security": 0, "accessibility": 0, "food": 0, "satisfaction": 0.5},
    "$": {"money": -2, "survival": 1, "security": 2, "accessibility": 1, "food": 0, "satisfaction": 2},
    "S": {"money": -2, "survival": 1, "security": 0, "accessibility": 0, "food": 0, "satisfaction": 1},
    "F": {"money": -1, "survival": 1, "security": 0, "accessibility": 1, "food": 2, "satisfaction": 1},
    "M": {"money": -1, "survival": 0, "security": 0, "accessibility": 2, "food": 0, "satisfaction": 1},
    "I": {"money": -1, "survival": 0, "security": 0, "accessibility": 2, "food": -1, "satisfaction": 1},
    "L": {"money": -1, "survival": 2, "security": 2, "accessibility": 0, "food": 0, "satisfaction": 1},
    "D": {"money": -1, "survival": 1, "security": 1, "accessibility": 0, "food": 0, "satisfaction": 1},
    "R": {"money": -1, "survival": 1, "security": 1, "accessibility": 0, "food": 0, "satisfaction": 1},
    "P": {"money": -1, "survival": 1, "security": 1, "accessibility": 0, "food": 0, "satisfaction": 1},
    "T": {"money": -1, "survival": 1, "security": 2, "accessibility": 0, "food": 0, "satisfaction": 1},
    "G": {"money": -1, "survival": 0.5, "security": 0, "accessibility": 0, "food": 0, "satisfaction": 0.5},
}

BUILDING_LABELS: Final[dict[str, str]] = {
    "W": "Water Plant",
    "E": "Power Plant",
    "=": "House",
    "h": "Poor House",
    "$": "Rich House",
    "S": "Hospital",
    "F": "Farm",
    "M": "Market",
    "I": "Factory",
    "L": "Police",
    "D": "School",
    "R": "Road",
    "P": "Park",
    "T": "Fire Station",
    "G": "Solar Panel",
    "C": "City Center",
    ".": "Empty",
}

BUILDING_LABELS_FA: Final[dict[str, str]] = {
    "W": "آب",
    "E": "برق",
    "=": "خانه",
    "h": "خانه فقیر",
    "$": "خانه پولدار",
    "S": "بیمارستان",
    "F": "مزرعه",
    "M": "بازار",
    "I": "کارخانه",
    "L": "پلیس",
    "D": "مدرسه",
    "R": "جاده",
    "P": "پارک",
    "T": "آتش‌نشانی",
    "G": "پنل خورشیدی",
    "C": "مرکز شهر",
    ".": "خالی",
}

BUILDING_COSTS: Final[dict[str, int]] = {
    "=": 50,
    "h": 30,
    "$": 120,
    "R": 10,
    "F": 100,
    "S": 300,
    "P": 80,
    "I": 300,
    "W": 150,
    "E": 250,
    "M": 120,
    "L": 180,
    "D": 160,
    "T": 200,
    "G": 90,
}

BUILDABLE_TYPES: Final[tuple[str, ...]] = (
    "=", "h", "$", "R", "F", "S", "P", "I", "W", "E", "M", "L", "D", "T", "G",
)

# Solar panels only in top-left 3×3 corner (excluding city center overlap handled at build time)
SOLAR_ZONE = frozenset((x, y) for x in range(3) for y in range(3))

METRIC_LABELS: Final[dict[str, str]] = {
    "money": "Money",
    "survival": "Survival",
    "security": "Security",
    "accessibility": "Accessibility",
    "food": "Food",
    "satisfaction": "Satisfaction",
}

METRIC_LABELS_FA: Final[dict[str, str]] = {
    "money": "پول",
    "survival": "نجات",
    "security": "امنیت",
    "accessibility": "دسترسی",
    "food": "غذا",
    "satisfaction": "رضایت",
}

# Map overlay origin (SW pocket of the 3D map view)
GRID_MAP_ORIGIN: Final[tuple[float, float]] = (38.8940, -77.0480)
GRID_CELL_DEG: Final[float] = 0.00082


def impact_matrix_rows() -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for symbol in ("W", "E", "=", "h", "$", "S", "F", "M", "I", "L", "D", "R", "P", "G"):
        row = {"building": BUILDING_LABELS[symbol], "symbol": symbol}
        row.update(BUILDING_IMPACT[symbol])
        rows.append(row)
    return rows


def grid_to_geo(x: int, y: int) -> tuple[float, float]:
    lat = GRID_MAP_ORIGIN[0] + x * GRID_CELL_DEG
    lng = GRID_MAP_ORIGIN[1] + y * GRID_CELL_DEG
    return lat, lng
