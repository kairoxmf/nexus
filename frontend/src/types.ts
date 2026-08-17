export interface CityNode {
  id: string;
  type: string;
  name: string;
  latitude: number;
  longitude: number;
  priority: number;
  deps: string[];
  health: number;
  status: string;
  capacity: number;
  risk_score: number;
}

export interface LogEntry {
  text: string;
  level: string;
  agent?: string;
  tick: number;
  explanation?: Record<string, unknown>;
}

export interface DashboardMetrics {
  city_health: number;
  recovery_percentage: number;
  power_grid: number;
  water_network: number;
  healthcare: number;
  safety: number;
  transport: number;
  housing: number;
  safety_index: number;
  economic_index: number;
  citizen_satisfaction: number;
}

export interface Prediction {
  horizon_hours: number;
  event_type: string;
  probability: number;
  severity: string;
  description: string;
  affected_nodes: string[];
}

export interface DebateResult {
  arguments: Array<{
    agent: string;
    position: string;
    reasoning: string;
    confidence: number;
  }>;
  decision: string;
  chosen_strategy: string;
  confidence: number;
  alternatives: string[];
  expected_impact: string;
}

export interface Vehicle {
  id: string;
  type: "ambulance" | "fire_truck" | "helicopter" | "police";
  latitude: number;
  longitude: number;
  heading: number;
  speed_kmh: number;
  status: string;
  target_node_id?: string;
}

export interface WeatherState {
  condition: string;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  precipitation_mm: number;
  visibility_km: number;
  temperature_c: number;
  overlay: string;
}

export interface CitizenAgentState {
  evacuating: number;
  sheltered: number;
  in_transit: number;
  needs_help: number;
  safe: number;
}

export interface SatelliteScanState {
  active: boolean;
  progress: number;
  sweep_angle_deg: number;
}

export interface SimulationState {
  tick: number;
  nodes: CityNode[];
  log: LogEntry[];
  epicenter?: { latitude: number; longitude: number };
  active_disaster?: string;
  disaster_radius: number;
  disaster_magnitude: number;
  recovery_mode: boolean;
  active_agents: string[];
  metrics: DashboardMetrics;
  last_debate?: DebateResult;
  predictions: Prediction[];
  city_dna: Record<string, number>;
  replay_buffer?: unknown[];
  vehicles?: Vehicle[];
  weather?: WeatherState;
  citizen_agents?: CitizenAgentState;
  satellite_scan?: SatelliteScanState;
  advanced?: AdvancedModulesState;
  mega?: MegaModulesState;
  creative?: CreativeModulesState;
  extended?: ExtendedModulesState;
  immersive?: ImmersiveModulesState;
}

export interface TimeMachineFuture {
  id: string;
  label: string;
  strategy: string;
  recovery_hours: number;
  lives_saved: number;
  cost_usd_m: number;
  infrastructure_recovery_pct: number;
  probability: number;
  confidence: number;
  explanation: string;
  timeline?: Array<{ hour: number; health: number }>;
}

export interface AdvancedModulesState {
  time_machine?: {
    futures: TimeMachineFuture[];
    selected: string;
    comparison_note: string;
  };
  self_evolving_ai?: {
    version: string;
    previous_performance: number;
    current_performance: number;
    learning_progress: number;
    improvement_percentage: number;
    mistakes_corrected: number;
    strategy_changes: number;
    timeline: Array<{ version: string; performance: number; improvement_pct: number }>;
  };
  digital_citizens?: Array<{
    id: string;
    name: string;
    age: number;
    occupation: string;
    family_members?: number;
    health_status: string;
    mobility?: string;
    vehicle_ownership?: boolean;
    panic_level: number;
    personality: string;
    behavior: string;
    routine?: string;
    latitude: number;
    longitude: number;
  }>;
  hospital_brain?: Array<{
    hospital_id: string;
    name: string;
    beds_total: number;
    beds_available: number;
    icu_capacity_pct: number;
    doctors?: number;
    nurses?: number;
    medicine_inventory_pct?: number;
    blood_supply_pct?: number;
    oxygen_supply_pct?: number;
    ambulance_dispatch?: number;
    patient_queue: number;
    overload_risk: string;
    generator_status: string;
    survival_capacity_pct: number;
  }>;
  traffic_brain?: {
    traffic_lights_controlled: number;
    congestion_index: number;
    emergency_corridors_open: number;
    priority_lanes?: number;
    fastest_rescue_routes?: Array<{ from: string; to: string; eta_min: number; status: string }>;
    damaged_roads_avoided?: number;
    active_vehicles: number;
    update_interval_sec: number;
    coordination?: string[];
  };
  press_conference?: {
    speech: string;
    lives_saved: number;
    lives_lost: number;
    buildings_damaged: number;
    economic_loss_usd_m: number;
    infrastructure_status?: string;
    recovery_progress_pct?: number;
    current_risks?: string;
    future_predictions?: string;
    resource_usage?: string;
    next_steps?: string[];
  };
  research_report?: {
    title: string;
    executive_summary: string;
    disaster_timeline: string;
    ai_decisions: number;
    success_analysis: string;
    failure_analysis: string;
    alternative_strategies?: string[];
    lessons_learned?: string[];
    optimization_suggestions?: string[];
  };
  economy_simulation?: {
    gdp_index: number;
    business_activity_pct?: number;
    employment_pct: number;
    fuel_price_index?: number;
    food_price_index?: number;
    transport_cost_index?: number;
    government_budget_usd_b?: number;
    recovery_budget_usd_m: number;
    insurance_loss_usd_m: number;
    economic_growth_forecast_pct: number;
  };
  climate_ai?: {
    rain_mm: number;
    snow?: string;
    wind_kmh: number;
    humidity_pct?: number;
    heatwave_risk?: string;
    wildfire_risk: string;
    sea_level_impact?: string;
    climate_change_factor?: number;
    seasonal_effect?: string;
    adaptation: string;
  };
  infrastructure_genome?: {
    city_dna_score: number;
    transportation_resilience?: number;
    power_grid_stability?: number;
    water_network_stability?: number;
    healthcare_capacity?: number;
    emergency_response_speed?: number;
    weak_points: Array<{ key: string; score: number }>;
  };
  multiplayer_crisis?: {
    mode: string;
    sync_status: string;
    roles_available: string[];
    voice_chat: string;
    live_chat: string;
    voting_active?: boolean;
    shared_dashboards: boolean;
    scoreboard?: Array<{ role: string; score: number; player: string }>;
  };
}

export interface FederatedCity {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population_m: number;
  resources: Record<string, number>;
  status: string;
  health_pct: number;
  needs?: Record<string, boolean>;
}

export interface SupplyRoute {
  id: string;
  from_city: string;
  to_city: string;
  resource: string;
  quantity: number;
  vehicle_type: string;
  progress_pct: number;
  eta_hours: number;
  status: string;
}

export interface MegaModulesState {
  federated_network?: {
    cities: FederatedCity[];
    supply_routes: SupplyRoute[];
    negotiations: Array<{ from: string; to: string; offer: string; request: string; status: string; ai_confidence: number }>;
    mutual_aid_agreements: Array<{ cities: string[]; type: string; capacity_mw?: number; capacity_tons?: number; beds?: number }>;
    network_resilience_score: number;
    local_recovery_score: number;
  };
  ai_vs_human?: {
    active: boolean;
    difficulty: string;
    disaster_type: string;
    ai_strategy: string;
    human_strategy: string;
    ai_scores: Record<string, number>;
    human_scores: Record<string, number>;
    winner: string | null;
    analysis: string;
    decision_comparison: Array<{ phase: string; ai: string; human: string }>;
  };
  social_network?: {
    posts: Array<{
      id: string; author: string; text: string; likes: number; shares: number;
      is_misinformation: boolean; credibility_score: number; urgent: boolean; verified: boolean;
    }>;
    total_posts: number;
    misinformation_rate_pct: number;
    panic_level: number;
    official_announcements: Array<{ text: string; timestamp: string }>;
  };
  black_box?: {
    records: Array<{
      id: string; tick: number; selected_decision: string; reasoning: string;
      confidence_score: number; execution_time_ms: number; recovery_impact: number;
    }>;
    total_records: number;
    decision_tree: { root: string; children?: Array<{ node: string; selected: boolean; confidence: number }> };
  };
  disaster_movie?: {
    scenes: Array<{ scene: number; title: string; camera: string; duration_sec: number; subtitle: string; narration: string }>;
    duration_sec: number;
    status: string;
  };
  drone_swarm?: {
    drones: Array<{ id: string; type: string; status: string; mission: string; battery_pct: number }>;
    total: number;
    by_type: Record<string, number>;
    active_missions: number;
    survivors_detected: number;
  };
  crisis_commander?: {
    alerts: Array<{ id: string; priority: string; message: string; action: string }>;
    last_briefing: string;
  };
  knowledge_engine?: {
    comparison_summary: string;
    best_match?: { name: string; similarity_pct: number };
    recommended_strategies: string[];
    key_differences: string[];
  };
  failure_chain?: {
    failure_chains: Array<{ trigger: string; trigger_health: number; cascade: Array<{ name: string; predicted_failure_prob: number }> }>;
    predictions_count: number;
  };
  ai_governor?: {
    governance_mode: string;
    emergency_preparedness_score: number;
    healthcare_investment_pct: number;
    education_investment_pct: number;
    energy_investment_pct: number;
    transport_investment_pct: number;
    long_term_forecast: Array<{ year: number; health: number; gdp_growth: number }>;
    resilience_upgrades: string[];
  };
  civilization?: {
    current_year: number;
    population_k: number;
    gdp_index: number;
    unique_history: string;
    life_events: { births_today: number; migrations_in: number };
    economy: { construction_projects: number; growth_pct: number };
    history: Array<{ year: number; population_k: number; gdp_index: number; event: string }>;
  };
}

export interface DisasterOption {
  id: string;
  label: string;
  color: string;
}

export interface CreativeModulesState {
  war_room?: {
    active: boolean;
    roles: Array<{ id: string; label: string; focus: string }>;
    decisions: Array<{ id: string; role: string; action: string; timestamp: string; impact: string; player_submitted?: boolean }>;
    scores: Record<string, number>;
    conflicts: number;
  };
  early_warning?: {
    active: boolean;
    disaster_type: string;
    magnitude: number;
    hours_remaining: number;
    signals: Array<{ id: string; type: string; message: string; severity: string; hours_before_impact: number }>;
    preparedness_score: number;
    triggered?: boolean;
  } | null;
  preparedness_actions?: string[];
  butterfly_effect?: {
    active: boolean;
    strategy_a: string;
    strategy_b: string;
    universe_a: { strategy: string; health: number; lives_saved: number; cost_m: number };
    universe_b: { strategy: string; health: number; lives_saved: number; cost_m: number };
    elapsed_minutes: number;
    timeline_a?: Array<{ minute: number; health: number; lives: number }>;
    timeline_b?: Array<{ minute: number; health: number; lives: number }>;
  } | null;
  news_network?: {
    items: Array<{ id: string; tag: string; text: string; priority: string; timestamp: string; verified: boolean }>;
    ticker_index: number;
    live: boolean;
    press_conference?: { scheduled: boolean; speaker: string; summary: string } | null;
  };
  sos_sync?: {
    reports: Array<{ id: string; latitude: number; longitude: number; message: string; status: string; eta_minutes?: number }>;
    active_count: number;
    intel_reports: Array<{ id: string; latitude: number; longitude: number; message: string; category: string; credibility: number }>;
  };
  ethical_dilemmas?: {
    current?: {
      id: string;
      question: string;
      option_a: string;
      option_b: string;
      status: string;
    } | null;
    history: Array<{ dilemma_id: string; choice: string; option_text: string; ethics_scores: Record<string, number> }>;
    scores: Record<string, number>;
  };
  voice_command?: {
    enabled: boolean;
    recent: Array<{ id: string; transcript: string; response: string; timestamp: string }>;
    supported_commands: string[];
  };
  city_pulse?: {
    heartbeat_bpm: number;
    glow_intensity: number;
    ambient_level: string;
    building_pulse: number;
    social_scroll_speed: number;
  };
  crisis_podcast?: {
    title: string;
    segments: Array<{ speaker: string; text: string; duration_sec: number }>;
    duration_sec: number;
    status: string;
  } | null;
  city_twin?: {
    active: { id: string; name: string; lat: number; lng: number; country: string };
    presets: Array<{ id: string; name: string; lat: number; lng: number; country: string }>;
  };
}

export interface ExtendedModulesState {
  games?: {
    escape_room?: {
      rooms: Array<{ id: string; title: string; theme: string; puzzles: Array<{ id: string; clue: string; answer?: string; hint?: string; solved?: boolean }> }>;
      active?: {
        room_id: string;
        title: string;
        theme: string;
        puzzles: Array<{ id: string; clue: string; solved: boolean }>;
        escaped?: boolean;
      } | null;
      completed: string[];
    };
    roulette?: {
      segments: Array<{ id: string; label: string; effect: string; severity: string }>;
      active_modifier?: { label: string; effect: string } | null;
      history: Array<{ id: string; segment: { label: string; effect: string } }>;
    };
    speedrun?: {
      active?: { active: boolean; elapsed_sec?: number; completed?: boolean; finish_time_sec?: number; splits?: Record<string, number> } | null;
      personal_best?: { finish_time_sec: number; splits?: Record<string, number> } | null;
      leaderboard: Array<{ player: string; time_sec: number | null }>;
    };
  };
  advanced_ai?: {
    adversarial?: { active: boolean; actions: Array<{ id: string; action: string; impact: string; countermeasure: string }>; threat_level: string };
    oracle?: { enabled: boolean; forecasts: Array<{ horizon_ticks: number; event: string; probability: number; confidence: number; affected_nodes: string[] }>; accuracy_pct: number; note: string };
    red_team?: { report?: { critical_count: number; targets_scanned: number; timestamp: string }; findings: Array<{ id: string; name: string; type: string; vulnerability: string; severity: string; exploit_scenario: string }> };
  };
  realism?: {
    satellite_phone?: {
      phones: Array<{ id: string; caller: string; signal_strength: number; battery_pct: number; status: string }>;
      messages: Array<{ id: string; direction: string; message: string; latency_sec: number }>;
      blackout_zones: number;
    };
    osm_import?: {
      presets: Array<{ city_id: string; name: string; buildings: number; roads_km: number }>;
      active?: { name: string; buildings: number; nodes_generated: number } | null;
      history: Array<{ name: string; buildings: number }>;
    };
    refugee_flow?: {
      routes: Array<{ id: string; from: string; to: string; count: number; status: string; progress_pct: number }>;
      camps: Array<{ id: string; name: string; capacity: number; occupied: number }>;
      total_displaced: number;
      capacity_utilization_pct: number;
    };
  };
  organizational?: {
    certification?: {
      modules: Array<{ id: string; title: string; pass_score: number }>;
      progress: Record<string, { score: number; passed: boolean }>;
      badges: Array<{ module_id: string; title: string; certificate_id: string }>;
    };
    marketplace?: {
      listings: Array<{ resource: string; unit: string; base_price: number }>;
      orders: Array<{ id: string; resource: string; quantity: number; side: string; price_usd: number }>;
      balance_usd: number;
    };
    blockchain_ledger?: {
      blocks: Array<{ index: number; type: string; hash: string; timestamp: string }>;
      total_blocks: number;
      chain_integrity: string;
    };
  };
}

export interface ImmersiveModulesState {
  cinema?: {
    active: boolean;
    progress_pct: number;
    shots: Array<{ scene: number; camera: string; duration_sec: number; subtitle: string; music: string; title?: string }>;
    total_duration_sec: number;
    soundtrack: string;
    disaster?: string;
  };
  mayor_social?: {
    posts: Array<{
      id: string; author: string; text: string; text_fa?: string;
      likes: number; retweets: number; sentiment: string; timestamp: string; verified: boolean;
    }>;
    public_trust_index: number;
    platform: string;
    trending: string[];
  };
  diplomatic_war_room?: {
    negotiations: Array<{
      id: string; from_city: string; to_city: string; offer: string;
      counter_offer: string; status: string; ai_confidence: number; ai_reasoning: string; timestamp: string;
    }>;
    federated_cities: Array<{ id: string; name: string; lat: number; lng: number }>;
    active_sessions: number;
  };
  climate_2050?: {
    active: boolean;
    current_year: number;
    scenario: string;
    sea_level_rise_cm: number;
    heat_days_per_year: number;
    permanent_flood_zones: string[];
    migration_influx_k: number;
    adaptation_budget_usd_b: number;
    projections: Array<{ year: number; health: number; population_k: number }>;
  };
  ar_evacuation?: {
    routes: Array<{
      id: string; distance_m: number; eta_min: number;
      to: { name: string; name_fa?: string }; ar_overlay: string; hazards: string[];
    }>;
    webxr_supported: boolean;
    active_routes: number;
  };
  persian_ai?: {
    briefing: {
      title: string; summary_fa: string; summary_en?: string;
      feed_fa: string[]; podcast_teaser_fa: string; news_ticker_fa: string;
    };
    voice_log: Array<{ transcript: string; response: string; tts_ready: boolean; timestamp: string }>;
    full_persian_mode: boolean;
  };
  news_anchor?: {
    segments: Array<{ text: string; text_fa?: string; timestamp: string }>;
    anchor_name: string;
    anchor_name_fa: string;
    live: boolean;
  };
  multiplayer?: {
    spectator_mode: boolean;
    spectator_count: number;
    crisis_2v2?: {
      active: boolean; team_a: string; team_b: string;
      team_a_score: number; team_b_score: number;
      adversarial_ai_score: number; elapsed_sec: number; winner: string | null;
    } | null;
  };
  leaderboard?: {
    global: Array<{ player: string; mode: string; score: number; time_sec: number | null }>;
    categories: string[];
  };
  realism?: {
    weather_live: Record<string, unknown>;
    historical_replay?: Record<string, unknown> | null;
    push_notifications: { subscribers: number; recent: Array<Record<string, unknown>>; pwa_enabled: boolean };
    historical_events: Array<{ id: string; name: string; name_fa: string; date: string; magnitude: number }>;
  };
  map_layer?: {
    metro_operational_pct: number;
    traffic_lights_active: number;
    landmarks_loaded: string[];
    priority_lanes_open: number;
  };
}

export interface GridMetrics {
  money: number;
  survival: number;
  security: number;
  accessibility: number;
  food: number;
  satisfaction: number;
}

export interface GridSimulationState {
  grid: string[][];
  grid_size: number;
  budget: number;
  population: number;
  stability: number;
  environment_score: number;
  solar_output: number;
  ticks: number;
  day: number;
  week: number;
  month: number;
  year: number;
  max_ticks: number;
  metrics: GridMetrics;
  supplies: {
    power: number;
    water: number;
    food: number;
    healthcare: number;
  };
  placements: GridPlacement[];
  citizens: GridCitizen[];
  park_zones: GridParkZone[];
  solar_zone: { x: number; y: number }[];
  last_events: string[];
  last_reward: number;
}

export interface GridPlacement {
  x: number;
  y: number;
  building: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface GridCitizen {
  id: number;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  wealth: "poor" | "standard" | "rich";
}

export interface GridParkZone {
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  radius_m: number;
  health_boost: number;
}

export interface ImpactMatrixRow {
  building: string;
  symbol: string;
  money: number;
  survival: number;
  security: number;
  accessibility: number;
  food: number;
  satisfaction: number;
}

export interface ParetoSolution {
  plan: Record<string, number>;
  metrics: GridMetrics;
  objectives: GridMetrics;
  score: number;
}

export interface GridOptimizeResult {
  algorithm: string;
  pareto_front: ParetoSolution[];
  best?: ParetoSolution;
}

export interface RLTrainResult {
  algorithm: string;
  episodes: number;
  steps_per_episode: number;
  episode_rewards: number[];
  avg_reward: number;
  q_states_learned?: number;
  policy_weights?: number[];
}
