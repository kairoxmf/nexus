"""Washington D.C. digital twin — real-world coordinates & infrastructure graph."""

from __future__ import annotations

from app.core.config import settings

# Meters per degree at ~39°N
_SCALE_LAT = 111_000.0
_SCALE_LNG = 85_000.0
_ORIGIN_LAT = settings.city_center_lat
_ORIGIN_LNG = settings.city_center_lng


def _geo(lat: float, lng: float) -> tuple[float, float]:
    return lat, lng


# Washington D.C. critical infrastructure nodes (lat, lng from OpenStreetMap approx.)
NODE_DEFS: list[dict] = [
    {"id": "power1", "type": "power", "name": "Pepco Benning Substation", "lat": 38.895, "lng": -76.985, "priority": 5, "deps": []},
    {"id": "water1", "type": "water", "name": "Blue Plains Water Facility", "lat": 38.828, "lng": -77.028, "priority": 5, "deps": ["power1"]},
    {"id": "hosp1", "type": "hospital", "name": "GW University Hospital", "lat": 38.901, "lng": -77.050, "priority": 5, "deps": ["power1", "water1"]},
    {"id": "hosp2", "type": "hospital", "name": "Howard University Hospital", "lat": 38.917, "lng": -77.019, "priority": 5, "deps": ["power1"]},
    {"id": "fire1", "type": "fire", "name": "DC Fire Engine 3", "lat": 38.898, "lng": -77.030, "priority": 4, "deps": ["water1"]},
    {"id": "police1", "type": "police", "name": "MPDC Headquarters", "lat": 38.904, "lng": -77.016, "priority": 3, "deps": ["power1"]},
    {"id": "comm1", "type": "comm", "name": "Federal Comm Tower", "lat": 38.884, "lng": -77.072, "priority": 4, "deps": ["power1"]},
    {"id": "shelter1", "type": "shelter", "name": "RFK Emergency Shelter", "lat": 38.890, "lng": -76.971, "priority": 3, "deps": []},
    {"id": "shelter2", "type": "shelter", "name": "AU West Shelter", "lat": 38.936, "lng": -77.087, "priority": 3, "deps": []},
    {"id": "warehouse1", "type": "warehouse", "name": "Anacostia Supply Depot", "lat": 38.843, "lng": -77.012, "priority": 2, "deps": ["power1"]},
    {"id": "bridge1", "type": "bridge", "name": "Arlington Memorial Bridge", "lat": 38.889, "lng": -77.043, "priority": 4, "deps": []},
    {"id": "airport1", "type": "airport", "name": "Reagan National Airport", "lat": 38.852, "lng": -77.037, "priority": 3, "deps": ["power1", "comm1"]},
    {"id": "res1", "type": "residential", "name": "Capitol Hill District", "lat": 38.889, "lng": -76.985, "priority": 1, "deps": ["power1", "water1"]},
    {"id": "res2", "type": "residential", "name": "Georgetown", "lat": 38.909, "lng": -77.065, "priority": 1, "deps": ["power1", "water1"]},
    {"id": "res3", "type": "residential", "name": "Navy Yard", "lat": 38.876, "lng": -77.003, "priority": 1, "deps": ["power1", "water1"]},
    {"id": "port1", "type": "port", "name": "Southwest Waterfront", "lat": 38.877, "lng": -77.026, "priority": 2, "deps": ["power1"]},
]

ROADS: list[tuple[str, str]] = [
    ("power1", "res1"), ("res1", "hosp1"), ("hosp1", "res2"), ("res2", "bridge1"),
    ("bridge1", "fire1"), ("fire1", "police1"), ("police1", "comm1"),
    ("comm1", "airport1"), ("airport1", "res3"), ("res3", "warehouse1"),
    ("warehouse1", "port1"), ("port1", "shelter1"), ("water1", "res3"),
    ("water1", "hosp2"), ("hosp2", "shelter2"), ("bridge1", "res1"),
]

DISASTER_CONFIG: dict[str, dict] = {
    "earthquake": {
        "label": "Earthquake",
        "color": "#F4A100",
        "multiplier": {"bridge": 1.6, "power": 1.3, "hospital": 1.1, "default": 1.0},
        "spreads": False,
    },
    "flood": {
        "label": "Potomac Flood",
        "color": "#4CC9F0",
        "multiplier": {"water": 1.5, "residential": 1.4, "warehouse": 1.3, "port": 1.6, "default": 0.9},
        "spreads": False,
    },
    "wildfire": {
        "label": "Wildfire",
        "color": "#FF4655",
        "multiplier": {"residential": 1.5, "warehouse": 1.6, "shelter": 1.2, "default": 0.8},
        "spreads": True,
    },
    "gridfail": {
        "label": "Power Grid Failure",
        "color": "#B885F0",
        "direct": "power",
        "spreads": False,
    },
    "storm": {"label": "Storm", "color": "#6C7CE0", "multiplier": {"bridge": 1.3, "comm": 1.4, "default": 1.0}, "spreads": False},
    "hurricane": {"label": "Hurricane", "color": "#4C9FF0", "multiplier": {"residential": 1.4, "port": 1.5, "default": 1.1}, "spreads": True},
    "cyber_attack": {"label": "Cyber Attack", "color": "#B885F0", "direct": "comm", "spreads": False},
    "chemical": {"label": "Chemical Leak", "color": "#FF7A45", "multiplier": {"hospital": 1.5, "residential": 1.3, "default": 1.0}, "spreads": True},
    "nuclear": {"label": "Nuclear Incident", "color": "#FF4655", "multiplier": {"default": 2.0}, "spreads": True},
}


def build_initial_nodes() -> list[dict]:
    nodes = []
    for d in NODE_DEFS:
        lat, lng = _geo(d["lat"], d["lng"])
        nodes.append({
            **{k: v for k, v in d.items() if k not in ("lat", "lng")},
            "latitude": lat,
            "longitude": lng,
            "health": 100.0,
            "status": "operational",
            "capacity": 100.0,
            "risk_score": 0.0,
        })
    return nodes
