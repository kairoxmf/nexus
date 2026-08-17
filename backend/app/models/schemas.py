from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class NodeStatus(str, Enum):
    OPERATIONAL = "operational"
    DAMAGED = "damaged"
    CRITICAL = "critical"
    DESTROYED = "destroyed"


class DisasterType(str, Enum):
    EARTHQUAKE = "earthquake"
    FLOOD = "flood"
    WILDFIRE = "wildfire"
    STORM = "storm"
    HURRICANE = "hurricane"
    TORNADO = "tornado"
    TSUNAMI = "tsunami"
    HEATWAVE = "heatwave"
    CYBER_ATTACK = "cyber_attack"
    GRID_FAIL = "gridfail"
    GAS_EXPLOSION = "gas_explosion"
    DISEASE = "disease"
    AIRPORT_SHUTDOWN = "airport_shutdown"
    WATER_CONTAMINATION = "water_contamination"
    COMM_FAILURE = "comm_failure"
    TERRORIST = "terrorist"
    INDUSTRIAL = "industrial"
    CHEMICAL = "chemical"
    NUCLEAR = "nuclear"
    METEOR = "meteor"
    VOLCANIC = "volcanic"


class LogLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    SUCCESS = "success"


class GeoPoint(BaseModel):
    latitude: float
    longitude: float


class CityNode(BaseModel):
    id: str
    type: str
    name: str
    latitude: float
    longitude: float
    priority: int = 1
    deps: list[str] = Field(default_factory=list)
    health: float = 100.0
    status: NodeStatus = NodeStatus.OPERATIONAL
    capacity: float = 100.0
    risk_score: float = 0.0


class LogEntry(BaseModel):
    text: str
    level: LogLevel = LogLevel.INFO
    agent: Optional[str] = None
    tick: int = 0
    explanation: Optional[dict[str, Any]] = None


class DebateArgument(BaseModel):
    agent: str
    position: str
    reasoning: str
    confidence: float
    priority_target: Optional[str] = None


class DebateResult(BaseModel):
    arguments: list[DebateArgument]
    decision: str
    chosen_strategy: str
    confidence: float
    alternatives: list[str]
    expected_impact: str


class Prediction(BaseModel):
    horizon_hours: int
    event_type: str
    probability: float
    severity: str
    description: str
    affected_nodes: list[str] = Field(default_factory=list)


class DashboardMetrics(BaseModel):
    city_health: float
    recovery_percentage: float
    power_grid: float
    water_network: float
    healthcare: float
    safety: float
    transport: float
    housing: float
    safety_index: float
    economic_index: float
    citizen_satisfaction: float


class VehicleType(str, Enum):
    AMBULANCE = "ambulance"
    FIRE_TRUCK = "fire_truck"
    HELICOPTER = "helicopter"
    POLICE = "police"


class Vehicle(BaseModel):
    id: str
    type: VehicleType
    latitude: float
    longitude: float
    heading: float = 0.0
    speed_kmh: float = 40.0
    status: str = "en_route"
    target_node_id: Optional[str] = None


class WeatherState(BaseModel):
    condition: str = "clear"
    wind_speed_kmh: float = 8.0
    wind_direction_deg: float = 180.0
    precipitation_mm: float = 0.0
    visibility_km: float = 10.0
    temperature_c: float = 22.0
    overlay: str = "none"


class CitizenAgentState(BaseModel):
    evacuating: int = 0
    sheltered: int = 0
    in_transit: int = 0
    needs_help: int = 0
    safe: int = 0


class SatelliteScanState(BaseModel):
    active: bool = False
    progress: float = 0.0
    sweep_angle_deg: float = 0.0


class SimulationState(BaseModel):
    tick: int = 0
    nodes: list[CityNode]
    log: list[LogEntry] = Field(default_factory=list)
    epicenter: Optional[GeoPoint] = None
    active_disaster: Optional[DisasterType] = None
    disaster_radius: float = 5000.0
    disaster_magnitude: float = 6.0
    recovery_mode: bool = False
    active_agents: list[str] = Field(default_factory=list)
    wildfire_ticks: int = 0
    replay_buffer: list[dict[str, Any]] = Field(default_factory=list, exclude=True)
    metrics: DashboardMetrics
    last_debate: Optional[DebateResult] = None
    predictions: list[Prediction] = Field(default_factory=list)
    city_dna: dict[str, float] = Field(default_factory=dict)
    vehicles: list[Vehicle] = Field(default_factory=list)
    weather: WeatherState = Field(default_factory=WeatherState)
    citizen_agents: CitizenAgentState = Field(default_factory=CitizenAgentState)
    satellite_scan: SatelliteScanState = Field(default_factory=SatelliteScanState)


class TriggerDisasterRequest(BaseModel):
    disaster_type: DisasterType
    latitude: float
    longitude: float
    magnitude: float = Field(ge=1, le=10, default=6.0)
    # DC infrastructure spans several km; 800m often hit zero nodes.
    radius: float = Field(ge=200, le=15000, default=5000.0)


class GodModeRequest(BaseModel):
    action: str
    node_id: Optional[str] = None


class WhatIfRequest(BaseModel):
    scenario: str
    node_id: Optional[str] = None
    magnitude_multiplier: float = 1.0


class StrategyComparisonRequest(BaseModel):
    strategies: list[str] = Field(
        default_factory=lambda: ["minimize_deaths", "minimize_cost", "fastest_recovery", "balanced"]
    )


class SOSRequest(BaseModel):
    latitude: float
    longitude: float
    message: str = "Emergency assistance needed"
    contact: Optional[str] = None


class SafeRouteRequest(BaseModel):
    from_latitude: float
    from_longitude: float
    to_latitude: Optional[float] = None
    to_longitude: Optional[float] = None


class FamilyCheckRequest(BaseModel):
    member_ids: list[str] = Field(default_factory=list)


class CitizenChatRequest(BaseModel):
    message: str
    context: Optional[dict[str, Any]] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    tenant: str = "dc-metro"


class AIChatRequest(BaseModel):
    role: str = "copilot"
    message: str
    locale: str = "en"
    context: Optional[dict[str, Any]] = None


class BriefingRequest(BaseModel):
    format: str = "json"


class GridBuildRequest(BaseModel):
    x: int = Field(ge=0, le=29)
    y: int = Field(ge=0, le=29)
    building: str


class GridStepRequest(BaseModel):
    x: Optional[int] = Field(default=None, ge=0, le=29)
    y: Optional[int] = Field(default=None, ge=0, le=29)
    building: Optional[str] = None


class GridOptimizeRequest(BaseModel):
    population_size: int = Field(default=40, ge=10, le=100)
    generations: int = Field(default=25, ge=5, le=80)
    max_buildings: int = Field(default=12, ge=3, le=30)
    simulation_steps: int = Field(default=15, ge=5, le=50)


class GridRLTrainRequest(BaseModel):
    algorithm: str = Field(default="q_learning", pattern="^(q_learning|ppo|both)$")
    episodes: int = Field(default=5, ge=1, le=30)
    steps_per_episode: int = Field(default=20, ge=5, le=50)


class GridApplyPlanRequest(BaseModel):
    plan: dict[str, int]


class ContactSubmitRequest(BaseModel):
    name: str = Field(default="", max_length=128)
    email: str = Field(default="", max_length=256)
    message: str = Field(min_length=1, max_length=5000)


class ContactStatusUpdate(BaseModel):
    status: str = Field(pattern="^(new|read|replied|archived)$")
