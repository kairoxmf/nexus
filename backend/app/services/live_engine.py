"""Live simulation layer — emergency vehicles, weather, citizen behavior."""

from __future__ import annotations

import math
import random
import uuid
from typing import TYPE_CHECKING, Any

from app.core.config import settings
from app.models.schemas import (
    CitizenAgentState,
    SatelliteScanState,
    Vehicle,
    VehicleType,
    WeatherState,
)

if TYPE_CHECKING:
    from app.engine.simulator import CitySimulator


def _haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _move_toward(lat: float, lng: float, tlat: float, tlng: float, km: float) -> tuple[float, float, float]:
    dist = _haversine_m(lat, lng, tlat, tlng)
    if dist < 50:
        return tlat, tlng, 0.0
    frac = min(1.0, (km * 1000) / dist)
    nlat = lat + (tlat - lat) * frac
    nlng = lng + (tlng - lng) * frac
    heading = math.degrees(math.atan2(tlng - lng, tlat - lat))
    return nlat, nlng, heading


class LiveEngine:
    def __init__(self) -> None:
        self.vehicles: list[Vehicle] = []
        self.weather = WeatherState()
        self.citizen_agents = CitizenAgentState(safe=850_000)
        self.satellite_scan = SatelliteScanState()
        self._spawn_cooldown = 0

    def reset(self) -> None:
        self.vehicles.clear()
        self.weather = WeatherState()
        self.citizen_agents = CitizenAgentState(safe=850_000)
        self.satellite_scan = SatelliteScanState()
        self._spawn_cooldown = 0

    def sync_weather(self, sim: CitySimulator) -> None:
        disaster = sim.state.active_disaster
        mag = sim.state.disaster_magnitude
        if not disaster:
            self.weather = WeatherState()
            return

        mapping: dict[str, WeatherState] = {
            "flood": WeatherState(condition="heavy_rain", precipitation_mm=45, wind_speed_kmh=35, visibility_km=2, overlay="rain"),
            "storm": WeatherState(condition="storm", precipitation_mm=25, wind_speed_kmh=55, visibility_km=3, overlay="rain"),
            "hurricane": WeatherState(condition="hurricane", precipitation_mm=60, wind_speed_kmh=95, visibility_km=1.5, overlay="rain"),
            "wildfire": WeatherState(condition="smoke", wind_speed_kmh=25, visibility_km=4, temperature_c=38, overlay="smoke"),
            "heatwave": WeatherState(condition="heatwave", temperature_c=42, wind_speed_kmh=5, overlay="heat"),
            "tornado": WeatherState(condition="tornado", wind_speed_kmh=120, visibility_km=2, overlay="wind"),
        }
        base = mapping.get(disaster.value if disaster else "", WeatherState(condition="crisis", wind_speed_kmh=20, overlay="wind"))
        base.wind_speed_kmh = round(base.wind_speed_kmh * (0.7 + mag * 0.05), 1)
        base.precipitation_mm = round(base.precipitation_mm * (0.8 + mag * 0.04), 1)
        self.weather = base

    def sync_citizens(self, sim: CitySimulator) -> None:
        damaged = sum(1 for n in sim.state.nodes if n.health < 50)
        critical = sum(1 for n in sim.state.nodes if n.health <= 15)
        pop_factor = 850_000
        if sim.state.active_disaster:
            evac = int(pop_factor * 0.08 * sim.state.disaster_magnitude / 10)
            shelter = int(pop_factor * 0.03)
            help_n = int(critical * 1200 + damaged * 400)
            transit = int(evac * 0.4)
            safe = max(0, pop_factor - evac - help_n)
            self.citizen_agents = CitizenAgentState(
                evacuating=evac,
                sheltered=shelter,
                in_transit=transit,
                needs_help=help_n,
                safe=safe,
            )
        elif sim.state.recovery_mode:
            self.citizen_agents = CitizenAgentState(
                evacuating=int(pop_factor * 0.01),
                sheltered=int(pop_factor * 0.05),
                in_transit=int(pop_factor * 0.02),
                needs_help=int(critical * 500),
                safe=int(pop_factor * 0.92),
            )
        else:
            self.citizen_agents = CitizenAgentState(safe=pop_factor)

    def _spawn_vehicles(self, sim: CitySimulator) -> None:
        if not sim.state.active_disaster and not sim.state.recovery_mode:
            if len(self.vehicles) > 4:
                self.vehicles = self.vehicles[:4]
            return

        targets = [n for n in sim.state.nodes if n.health < 70 and n.type in ("hospital", "fire", "residential", "bridge")]
        if not targets:
            return

        if self._spawn_cooldown > 0:
            self._spawn_cooldown -= 1
            return

        types = [VehicleType.AMBULANCE, VehicleType.FIRE_TRUCK, VehicleType.HELICOPTER, VehicleType.POLICE]
        for _ in range(min(2, 6 - len(self.vehicles))):
            target = random.choice(targets)
            vtype = random.choice(types)
            lat = settings.city_center_lat + random.uniform(-0.02, 0.02)
            lng = settings.city_center_lng + random.uniform(-0.02, 0.02)
            self.vehicles.append(
                Vehicle(
                    id=str(uuid.uuid4())[:8],
                    type=vtype,
                    latitude=lat,
                    longitude=lng,
                    speed_kmh=80 if vtype == VehicleType.HELICOPTER else 45,
                    target_node_id=target.id,
                    status="en_route",
                )
            )
        self._spawn_cooldown = 3

    def tick(self, sim: CitySimulator) -> None:
        self.sync_weather(sim)
        self.sync_citizens(sim)
        self._spawn_vehicles(sim)

        node_map = {n.id: n for n in sim.state.nodes}
        updated: list[Vehicle] = []
        for v in self.vehicles:
            target = node_map.get(v.target_node_id or "")
            if not target:
                updated.append(v)
                continue
            km = v.speed_kmh / 3600 * (settings.sim_tick_ms / 1000)
            nlat, nlng, heading = _move_toward(v.latitude, v.longitude, target.latitude, target.longitude, km)
            status = "on_scene" if _haversine_m(nlat, nlng, target.latitude, target.longitude) < 80 else "en_route"
            updated.append(v.model_copy(update={"latitude": nlat, "longitude": nlng, "heading": heading, "status": status}))
        self.vehicles = updated[:24]

        if sim.state.active_disaster or sim.state.recovery_mode:
            self.satellite_scan.active = True
            self.satellite_scan.progress = min(1.0, self.satellite_scan.progress + 0.02)
            self.satellite_scan.sweep_angle_deg = (self.satellite_scan.sweep_angle_deg + 8) % 360
        else:
            self.satellite_scan.active = False
            self.satellite_scan.progress = max(0.0, self.satellite_scan.progress - 0.05)

    def dispatch_to_location(self, lat: float, lng: float, vtype: VehicleType = VehicleType.AMBULANCE) -> Vehicle:
        from app.engine.simulator import simulator

        nearest_id: str | None = None
        best_dist = float("inf")
        for node in simulator.state.nodes:
            d = _haversine_m(lat, lng, node.latitude, node.longitude)
            if d < best_dist:
                best_dist = d
                nearest_id = node.id
        vehicle = Vehicle(
            id=str(uuid.uuid4())[:8],
            type=vtype,
            latitude=settings.city_center_lat + random.uniform(-0.008, 0.008),
            longitude=settings.city_center_lng + random.uniform(-0.008, 0.008),
            speed_kmh=90 if vtype == VehicleType.HELICOPTER else 55,
            target_node_id=nearest_id,
            status="en_route",
        )
        self.vehicles.insert(0, vehicle)
        self.vehicles = self.vehicles[:24]
        return vehicle

    def public_payload(self) -> dict[str, Any]:
        return {
            "vehicles": [v.model_dump() for v in self.vehicles],
            "weather": self.weather.model_dump(),
            "citizen_agents": self.citizen_agents.model_dump(),
            "satellite_scan": self.satellite_scan.model_dump(),
        }


live_engine = LiveEngine()
