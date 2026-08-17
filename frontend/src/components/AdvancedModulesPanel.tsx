import { useState, type CSSProperties } from "react";
import type { AdvancedModulesState } from "../types";
import { useI18n } from "../i18n";
import { TimeMachineChart } from "./TimeMachineChart";

const TABS = [
  { id: "time_machine", titleKey: "adv_f1", shortKey: "adv_f1_short" },
  { id: "self_evolving", titleKey: "adv_f5", shortKey: "adv_f5_short" },
  { id: "digital_citizens", titleKey: "adv_f6", shortKey: "adv_f6_short" },
  { id: "hospital_brain", titleKey: "adv_f7", shortKey: "adv_f7_short" },
  { id: "traffic_brain", titleKey: "adv_f8", shortKey: "adv_f8_short" },
  { id: "press_conference", titleKey: "adv_f9", shortKey: "adv_f9_short" },
  { id: "research_mode", titleKey: "adv_f10", shortKey: "adv_f10_short" },
  { id: "economy", titleKey: "adv_f11", shortKey: "adv_f11_short" },
  { id: "climate", titleKey: "adv_f12", shortKey: "adv_f12_short" },
  { id: "genome", titleKey: "adv_f14", shortKey: "adv_f14_short" },
  { id: "multiplayer", titleKey: "adv_f15", shortKey: "adv_f15_short" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const API = import.meta.env.VITE_API_URL ?? "";

export function AdvancedModulesPanel({ data, expanded = false }: { data?: AdvancedModulesState; expanded?: boolean }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("time_machine");
  const [selectedFuture, setSelectedFuture] = useState(data?.time_machine?.selected ?? "future_a");

  if (!data) return null;

  const activeTab = TABS.find((x) => x.id === tab)!;

  const selectFuture = async (id: string) => {
    setSelectedFuture(id);
    try {
      await fetch(`${API}/api/v1/advanced/time-machine/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ future_id: id }),
      });
    } catch {
      /* offline */
    }
  };

  const yn = (v: boolean) => (v ? t("adv_yes") : t("adv_no"));
  const dash = "—";

  return (
    <div className={`section adv-modules${expanded ? " is-modal" : ""}`}>
      {!expanded && <div className="section-title">{t("adv_modules_title")}</div>}
      <div className="adv-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`adv-tab${tab === item.id ? " active" : ""}`}
            onClick={() => setTab(item.id)}
            title={t(item.titleKey)}
          >
            {t(item.shortKey)}
          </button>
        ))}
      </div>

      <div className="adv-active-title">{t(activeTab.titleKey)}</div>

      <div className={`adv-panel${expanded ? " is-expanded nx-scroll nx-scroll-glow" : " nx-scroll-sm"}`}>
        {tab === "time_machine" && data.time_machine && (
          <div className="adv-block">
            <h4>{t("adv_f1")}</h4>
            <p className="hint">{data.time_machine.comparison_note || t("adv_compare_note")}</p>
            <TimeMachineChart futures={data.time_machine.futures} />
            {data.time_machine.futures.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`adv-future-card${selectedFuture === f.id ? " selected" : ""}`}
                onClick={() => void selectFuture(f.id)}
              >
                <strong>{f.label}: {f.strategy}</strong>
                <span>{t("adv_recovery_time")}: {f.recovery_hours} {t("adv_hours")}</span>
                <span>{t("adv_estimated_lives")}: {f.lives_saved}</span>
                <span>{t("adv_cost")}: ${f.cost_usd_m}M</span>
                <span>{t("adv_infrastructure_recovery")}: {f.infrastructure_recovery_pct}%</span>
                <span>{t("adv_probability")}: {Math.round(f.probability * 100)}% · {t("adv_confidence")}: {Math.round(f.confidence * 100)}%</span>
                <div className="adv-heat-bar"><div className="adv-heat-fill" style={{ width: `${f.infrastructure_recovery_pct}%` }} /></div>
                <em>{f.explanation}</em>
              </button>
            ))}
          </div>
        )}

        {tab === "self_evolving" && data.self_evolving_ai && (
          <div className="adv-block">
            <h4>{t("adv_f5")}</h4>
            <div className="adv-stat-grid">
              <div className="adv-stat-ring" style={{ "--pct": `${data.self_evolving_ai.learning_progress}%` } as CSSProperties}>
                <span>v{data.self_evolving_ai.version}</span>
              </div>
              <div className="adv-stat-metrics">
                <div>{t("adv_prev_performance")}: <strong>{data.self_evolving_ai.previous_performance}%</strong></div>
                <div>{t("adv_current_performance")}: <strong>{data.self_evolving_ai.current_performance}%</strong></div>
                <div>{t("adv_learning_progress")}: <strong>{data.self_evolving_ai.learning_progress}%</strong></div>
                <div>{t("adv_improvement_pct")}: <strong>+{data.self_evolving_ai.improvement_percentage}%</strong></div>
                <div>{t("adv_mistakes_corrected")}: <strong>{data.self_evolving_ai.mistakes_corrected}</strong></div>
                <div>{t("adv_strategy_changes")}: <strong>{data.self_evolving_ai.strategy_changes}</strong></div>
              </div>
            </div>
            <div className="adv-timeline">
              <div className="adv-timeline-head">{t("adv_evolution_timeline")}</div>
              {data.self_evolving_ai.timeline.map((e, i) => (
                <div key={i} className="adv-timeline-item">
                  <span className="adv-timeline-ver">{t("adv_version")} {e.version}</span>
                  <span>{e.performance}% {t("adv_performance")}</span>
                  <span className="adv-timeline-up">+{e.improvement_pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "digital_citizens" && data.digital_citizens && (
          <div className="adv-block">
            <h4>{t("adv_f6")}</h4>
            <p className="hint">{data.digital_citizens.length} {t("adv_citizens_agents")}</p>
            <div className="adv-citizen-grid">
              {data.digital_citizens.slice(0, 12).map((c) => (
                <div key={c.id} className="adv-citizen-card">
                  <strong>{c.name}</strong>
                  <span>{c.age} · {c.occupation}</span>
                  <span>{t("adv_family")}: {c.family_members ?? 1} · {t("adv_mobility")}: {c.mobility ?? t("adv_full")}</span>
                  <span>{t("adv_vehicle")}: {yn(!!c.vehicle_ownership)} · {t("adv_routine")}: {c.routine ?? t("adv_home")}</span>
                  <span>{t("adv_health")}: {c.health_status} · {t("adv_panic")}: {Math.round(c.panic_level * 100)}%</span>
                  <div className="adv-heat-bar"><div className="adv-heat-fill panic" style={{ width: `${c.panic_level * 100}%` }} /></div>
                  <span>{c.behavior} · {c.personality}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "hospital_brain" && data.hospital_brain && (
          <div className="adv-block">
            <h4>{t("adv_f7")}</h4>
            {data.hospital_brain.map((h) => (
              <div key={h.hospital_id} className={`adv-hospital-card risk-${h.overload_risk.toLowerCase()}`}>
                <strong>{h.name}</strong>
                <span>{t("adv_hospital_beds")}: {h.beds_available}/{h.beds_total} · ICU: {h.icu_capacity_pct}%</span>
                <span>{t("adv_doctors")}: {h.doctors ?? dash} · {t("adv_nurses")}: {h.nurses ?? dash}</span>
                <span>{t("adv_medicine")}: {h.medicine_inventory_pct ?? dash}% · {t("adv_blood")}: {h.blood_supply_pct ?? dash}%</span>
                <span>{t("adv_oxygen")}: {h.oxygen_supply_pct ?? dash}% · {t("adv_ambulance_dispatch")}: {h.ambulance_dispatch ?? 0}</span>
                <span>{t("adv_patient_queue")}: {h.patient_queue} · {t("adv_overload_risk")}: {h.overload_risk}</span>
                <span>{t("adv_generator")}: {h.generator_status} · {t("adv_survival_capacity")}: {h.survival_capacity_pct}%</span>
              </div>
            ))}
          </div>
        )}

        {tab === "traffic_brain" && data.traffic_brain && (
          <div className="adv-block">
            <h4>{t("adv_f8")}</h4>
            <ul className="adv-list">
              <li>{t("adv_traffic_lights")}: {data.traffic_brain.traffic_lights_controlled}</li>
              <li>{t("adv_congestion")}: {data.traffic_brain.congestion_index}</li>
              <li>{t("adv_emergency_corridors")}: {data.traffic_brain.emergency_corridors_open}</li>
              <li>{t("adv_priority_lanes")}: {data.traffic_brain.priority_lanes ?? 6}</li>
              <li>{t("adv_damaged_roads")}: {data.traffic_brain.damaged_roads_avoided ?? 0}</li>
              <li>{t("adv_active_vehicles")}: {data.traffic_brain.active_vehicles}</li>
              <li>{t("adv_coordination")}: {(data.traffic_brain.coordination ?? []).join(", ") || dash}</li>
              <li>{t("adv_routing_update")}: {t("adv_every")} {data.traffic_brain.update_interval_sec}{t("adv_seconds")}</li>
            </ul>
            {(data.traffic_brain.fastest_rescue_routes ?? []).map((r) => (
              <div key={`${r.from}-${r.to}`} className="adv-route-card">
                <strong>{r.from} → {r.to}</strong>
                <span>ETA {r.eta_min} {t("min")} · {r.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "press_conference" && data.press_conference && (
          <div className="adv-block adv-briefing">
            <h4>{t("adv_f9")}</h4>
            <p className="adv-speech">{data.press_conference.speech}</p>
            <ul className="adv-list">
              <li>{t("adv_lives_saved")}: {data.press_conference.lives_saved}</li>
              <li>{t("adv_lives_lost")}: {data.press_conference.lives_lost}</li>
              <li>{t("adv_buildings_damaged")}: {data.press_conference.buildings_damaged}</li>
              <li>{t("adv_infrastructure_status")}: {data.press_conference.infrastructure_status ?? t("adv_monitoring")}</li>
              <li>{t("adv_recovery_progress")}: {data.press_conference.recovery_progress_pct ?? dash}%</li>
              <li>{t("adv_current_risks")}: {data.press_conference.current_risks ?? dash}</li>
              <li>{t("adv_future_predictions")}: {data.press_conference.future_predictions ?? dash}</li>
              <li>{t("adv_resource_usage")}: {data.press_conference.resource_usage ?? dash}</li>
              <li>{t("adv_economic_loss")}: ${data.press_conference.economic_loss_usd_m}M</li>
              <li>{t("adv_next_recovery_steps")}: {(data.press_conference.next_steps ?? []).join(" · ") || dash}</li>
            </ul>
          </div>
        )}

        {tab === "research_mode" && data.research_report && (
          <div className="adv-block">
            <h4>{t("adv_f10")}</h4>
            <p><strong>{data.research_report.title}</strong></p>
            <p><em>{t("adv_executive_summary")}:</em> {data.research_report.executive_summary}</p>
            <ul className="adv-list">
              <li>{t("adv_disaster_timeline")}: {data.research_report.disaster_timeline}</li>
              <li>{t("adv_ai_decisions")}: {data.research_report.ai_decisions}</li>
              <li>{t("adv_success_analysis")}: {data.research_report.success_analysis}</li>
              <li>{t("adv_failure_analysis")}: {data.research_report.failure_analysis}</li>
              <li>{t("adv_alternative_strategies")}: {(data.research_report.alternative_strategies ?? []).join(", ") || dash}</li>
              <li>{t("adv_lessons_learned")}: {(data.research_report.lessons_learned ?? []).join("; ") || dash}</li>
              <li>{t("adv_optimization_suggestions")}: {(data.research_report.optimization_suggestions ?? []).join("; ") || dash}</li>
            </ul>
          </div>
        )}

        {tab === "economy" && data.economy_simulation && (
          <div className="adv-block">
            <h4>{t("adv_f11")}</h4>
            <ul className="adv-list">
              <li>{t("adv_gdp")}: {data.economy_simulation.gdp_index}</li>
              <li>{t("adv_business_activity")}: {data.economy_simulation.business_activity_pct ?? data.economy_simulation.gdp_index}%</li>
              <li>{t("adv_employment")}: {data.economy_simulation.employment_pct}%</li>
              <li>{t("adv_fuel_prices")}: {data.economy_simulation.fuel_price_index ?? dash}</li>
              <li>{t("adv_food_prices")}: {data.economy_simulation.food_price_index ?? dash}</li>
              <li>{t("adv_transportation_cost")}: {data.economy_simulation.transport_cost_index ?? dash}</li>
              <li>{t("adv_government_budget")}: ${data.economy_simulation.government_budget_usd_b ?? "14.2"}B</li>
              <li>{t("adv_recovery_budget")}: ${data.economy_simulation.recovery_budget_usd_m}M</li>
              <li>{t("adv_insurance_loss")}: ${data.economy_simulation.insurance_loss_usd_m}M</li>
              <li>{t("adv_economic_growth_forecast")}: {data.economy_simulation.economic_growth_forecast_pct}%</li>
            </ul>
          </div>
        )}

        {tab === "climate" && data.climate_ai && (
          <div className="adv-block">
            <h4>{t("adv_f12")}</h4>
            <ul className="adv-list">
              <li>{t("adv_rain")}: {data.climate_ai.rain_mm}mm · {t("adv_snow")}: {data.climate_ai.snow ?? t("adv_none")}</li>
              <li>{t("adv_wind")}: {data.climate_ai.wind_kmh} km/h · {t("adv_humidity")}: {data.climate_ai.humidity_pct ?? dash}%</li>
              <li>{t("adv_heatwave_risk")}: {data.climate_ai.heatwave_risk ?? t("adv_normal")}</li>
              <li>{t("adv_wildfire_risk")}: {data.climate_ai.wildfire_risk}</li>
              <li>{t("adv_sea_level")}: {data.climate_ai.sea_level_impact ?? dash}</li>
              <li>{t("adv_climate_change_factor")}: {data.climate_ai.climate_change_factor ?? dash}</li>
              <li>{t("adv_seasonal_effects")}: {data.climate_ai.seasonal_effect ?? dash}</li>
              <li>{t("adv_adaptation")}: {data.climate_ai.adaptation}</li>
            </ul>
          </div>
        )}

        {tab === "genome" && data.infrastructure_genome && (
          <div className="adv-block">
            <h4>{t("adv_f14")}</h4>
            <p>{t("adv_city_dna_score")}: <strong>{data.infrastructure_genome.city_dna_score}</strong></p>
            <ul className="adv-list">
              <li>{t("adv_transportation_resilience")}: {data.infrastructure_genome.transportation_resilience ?? dash}</li>
              <li>{t("adv_power_grid_stability")}: {data.infrastructure_genome.power_grid_stability ?? dash}</li>
              <li>{t("adv_water_network_stability")}: {data.infrastructure_genome.water_network_stability ?? dash}</li>
              <li>{t("adv_healthcare_capacity")}: {data.infrastructure_genome.healthcare_capacity ?? dash}</li>
              <li>{t("adv_emergency_response_speed")}: {data.infrastructure_genome.emergency_response_speed ?? dash}</li>
            </ul>
            <p className="hint">{t("adv_weak_points")}:</p>
            <ul className="adv-list">
              {data.infrastructure_genome.weak_points.map((w) => (
                <li key={w.key}>{w.key}: {w.score}</li>
              ))}
            </ul>
          </div>
        )}

        {tab === "multiplayer" && data.multiplayer_crisis && (
          <div className="adv-block">
            <h4>{t("adv_f15")}</h4>
            <p>{t("adv_multiplayer_mode")}: {data.multiplayer_crisis.mode} · {t("adv_sync")}: {data.multiplayer_crisis.sync_status}</p>
            <p className="hint">{t("adv_roles")}: {data.multiplayer_crisis.roles_available.join(", ")}</p>
            <ul className="adv-list">
              <li>{t("adv_voice_chat")}: {data.multiplayer_crisis.voice_chat}</li>
              <li>{t("adv_live_chat")}: {data.multiplayer_crisis.live_chat}</li>
              <li>{t("adv_voting")}: {data.multiplayer_crisis.voting_active ? t("adv_active") : t("adv_ready")}</li>
              <li>{t("adv_shared_dashboards")}: {yn(data.multiplayer_crisis.shared_dashboards)}</li>
              <li>{t("adv_realtime_sync")}: {data.multiplayer_crisis.sync_status}</li>
              <li>{t("adv_scoreboard")}: {data.multiplayer_crisis.scoreboard?.[0]?.score ?? dash} {t("adv_pts")}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
