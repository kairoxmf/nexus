import { useState } from "react";
import { Icon3D } from "@shared/icons";
import type { MegaModulesState } from "../types";
import { useI18n } from "../i18n";
import { FederatedGlobe } from "./FederatedGlobe";

const TABS = [
  { id: "federated", titleKey: "mega_f1", shortKey: "mega_f1_short" },
  { id: "challenge", titleKey: "mega_f2", shortKey: "mega_f2_short" },
  { id: "social", titleKey: "mega_f3", shortKey: "mega_f3_short" },
  { id: "blackbox", titleKey: "mega_f4", shortKey: "mega_f4_short" },
  { id: "movie", titleKey: "mega_f5", shortKey: "mega_f5_short" },
  { id: "drones", titleKey: "mega_f6", shortKey: "mega_f6_short" },
  { id: "commander", titleKey: "mega_f7", shortKey: "mega_f7_short" },
  { id: "knowledge", titleKey: "mega_f8", shortKey: "mega_f8_short" },
  { id: "failure", titleKey: "mega_f9", shortKey: "mega_f9_short" },
  { id: "governor", titleKey: "mega_f10", shortKey: "mega_f10_short" },
  { id: "civilization", titleKey: "mega_f11", shortKey: "mega_f11_short" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const API = import.meta.env.VITE_API_URL ?? "";

export function MegaModulesPanel({ data, expanded = false }: { data?: MegaModulesState; expanded?: boolean }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("federated");
  const [difficulty, setDifficulty] = useState("medium");
  const [commanderMsg, setCommanderMsg] = useState("");
  const [commanderReply, setCommanderReply] = useState("");
  const [busy, setBusy] = useState(false);

  if (!data) return null;

  const activeTab = TABS.find((x) => x.id === tab)!;

  const startChallenge = async () => {
    setBusy(true);
    try {
      await fetch(`${API}/api/v1/mega/challenge/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, human_strategy: "Human community-first response" }),
      });
    } finally {
      setBusy(false);
    }
  };

  const exportBlackBox = () => {
    window.open(`${API}/api/v1/mega/black-box/export`, "_blank");
  };

  const generateMovie = async () => {
    setBusy(true);
    try {
      await fetch(`${API}/api/v1/mega/movie/generate`, { method: "POST" });
    } finally {
      setBusy(false);
    }
  };

  const exportMovie = () => {
    window.open(`${API}/api/v1/mega/movie/export`, "_blank");
  };

  const askCommander = async () => {
    if (!commanderMsg.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/v1/mega/commander/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commanderMsg }),
      });
      const d = await r.json();
      setCommanderReply(d.response ?? "");
    } finally {
      setBusy(false);
    }
  };

  const ScoreBar = ({ label, ai, human }: { label: string; ai: number; human: number }) => (
    <div className="mega-score-row">
      <span className="mega-score-label">{label}</span>
      <div className="mega-score-bars">
        <div className="mega-bar ai" style={{ width: `${Math.min(100, ai)}%` }} title={`AI: ${ai}`} />
        <div className="mega-bar human" style={{ width: `${Math.min(100, human)}%` }} title={`Human: ${human}`} />
      </div>
      <span className="mega-score-vals">{ai} / {human}</span>
    </div>
  );

  return (
    <div className={`section adv-modules mega-modules${expanded ? " is-modal" : ""}`}>
      {!expanded && <div className="section-title">{t("mega_modules_title")}</div>}
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
        {tab === "federated" && data.federated_network && (
          <div className="adv-block">
            <FederatedGlobe
              cities={data.federated_network.cities}
              routes={data.federated_network.supply_routes}
            />
            <div className="mega-stat-row">
              <span>{t("mega_network_resilience")}: <strong>{data.federated_network.network_resilience_score}%</strong></span>
              <span>{t("mega_local_recovery")}: <strong>{data.federated_network.local_recovery_score}%</strong></span>
            </div>
            {data.federated_network.negotiations.map((n, i) => (
              <div key={i} className="adv-route-card">
                <strong>{n.from} → {n.to}</strong>: {n.offer} · {n.status} · AI {Math.round(n.ai_confidence * 100)}%
              </div>
            ))}
            <ul className="adv-list">
              {data.federated_network.mutual_aid_agreements.map((a, i) => (
                <li key={i}>{a.cities.join(" ↔ ")} — {a.type}</li>
              ))}
            </ul>
          </div>
        )}

        {tab === "challenge" && data.ai_vs_human && (
          <div className="adv-block">
            <div className="mega-difficulty-row">
              {(["easy", "medium", "hard", "expert"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`adv-tab${difficulty === d ? " active" : ""}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
              <button type="button" className="btn-primary" disabled={busy} onClick={() => void startChallenge()}>
                {t("mega_start_challenge")}
              </button>
            </div>
            {data.ai_vs_human.winner && (
              <div className="mega-winner">
                {t("mega_winner")}: <strong>{data.ai_vs_human.winner.toUpperCase()}</strong>
              </div>
            )}
            <p className="hint">{data.ai_vs_human.analysis}</p>
            <ScoreBar label={t("adv_lives_saved")} ai={data.ai_vs_human.ai_scores.lives_saved} human={data.ai_vs_human.human_scores.lives_saved ?? 0} />
            <ScoreBar label={t("mega_recovery_time")} ai={data.ai_vs_human.ai_scores.recovery_time_hours} human={data.ai_vs_human.human_scores.recovery_time_hours ?? 0} />
            <ScoreBar label={t("mega_economic_cost")} ai={data.ai_vs_human.ai_scores.economic_cost_usd_m} human={data.ai_vs_human.human_scores.economic_cost_usd_m ?? 0} />
            <ScoreBar label={t("mega_citizen_satisfaction")} ai={data.ai_vs_human.ai_scores.citizen_satisfaction} human={data.ai_vs_human.human_scores.citizen_satisfaction ?? 0} />
            {data.ai_vs_human.decision_comparison.map((d, i) => (
              <div key={i} className="mega-decision-card">
                <strong>{d.phase}</strong>
                <div><span className="mega-ai-tag">AI</span> {d.ai}</div>
                <div><span className="mega-human-tag">Human</span> {d.human}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "social" && data.social_network && (
          <div className="adv-block">
            <div className="mega-stat-row">
              <span>{t("mega_panic_level")}: <strong className="mega-panic">{data.social_network.panic_level}</strong></span>
              <span>{t("mega_misinfo_rate")}: <strong>{data.social_network.misinformation_rate_pct}%</strong></span>
              <span>{t("mega_posts")}: <strong>{data.social_network.total_posts}</strong></span>
            </div>
            {data.social_network.official_announcements.map((a, i) => (
              <div key={i} className="mega-official">{a.text}</div>
            ))}
            {data.social_network.posts.slice(0, 25).map((p) => (
              <div key={p.id} className={`mega-post${p.is_misinformation ? " misinfo" : ""}${p.urgent ? " urgent" : ""}`}>
                <div className="mega-post-head">
                  <strong>{p.author}</strong>
                  {p.verified && <Icon3D name="check" size={12} />}
                  {p.is_misinformation && <span className="mega-fake">{t("mega_fake")}</span>}
                  <span className="mega-cred">{Math.round(p.credibility_score * 100)}%</span>
                </div>
                <div>{p.text}</div>
                <div className="mega-post-meta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Icon3D name="heart" size={11} animated /> {p.likes}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Icon3D name="share" size={11} /> {p.shares}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "blackbox" && data.black_box && (
          <div className="adv-block">
            <button type="button" className="btn-ghost" onClick={exportBlackBox}>{t("mega_export_logs")}</button>
            <div className="mega-tree">
              <strong>{data.black_box.decision_tree.root}</strong>
              <ul className="adv-list">
                {data.black_box.decision_tree.children?.map((c, i) => (
                  <li key={i} className={c.selected ? "mega-selected" : ""}>
                    {c.node} {c.selected ? <Icon3D name="check" size={11} /> : null} ({Math.round(c.confidence * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
            {data.black_box.records.slice(0, 8).map((r) => (
              <div key={r.id} className="mega-bb-record">
                <div><strong>T+{r.tick}</strong> · {r.selected_decision}</div>
                <div className="hint">{r.reasoning}</div>
                <div className="mega-bb-meta">
                  {t("adv_confidence")}: {Math.round(r.confidence_score * 100)}% ·
                  {t("mega_exec_time")}: {r.execution_time_ms}ms ·
                  {t("mega_impact")}: +{r.recovery_impact}%
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "movie" && data.disaster_movie && (
          <div className="adv-block">
            <div className="mega-stat-row">
              <span>{t("mega_status")}: <strong>{data.disaster_movie.status}</strong></span>
              <span>{t("mega_duration")}: <strong>{data.disaster_movie.duration_sec}s</strong></span>
            </div>
            <button type="button" className="btn-primary" disabled={busy} onClick={() => void generateMovie()}>
              {t("mega_generate_movie")}
            </button>
            <button type="button" className="btn-ghost" style={{ marginTop: 8 }} onClick={exportMovie}>
              {t("mega_export_mp4")}
            </button>
            {data.disaster_movie.scenes.map((s) => (
              <div key={s.scene} className="mega-scene-card">
                <strong>Scene {s.scene}: {s.title}</strong>
                <div className="hint">{s.camera} · {s.duration_sec}s</div>
                <div>{s.subtitle}</div>
                <div className="mega-narration">{s.narration}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "drones" && data.drone_swarm && (
          <div className="adv-block">
            <div className="mega-stat-row">
              <span>{t("mega_drones_total")}: <strong>{data.drone_swarm.total}</strong></span>
              <span>{t("mega_active_missions")}: <strong>{data.drone_swarm.active_missions}</strong></span>
              <span>{t("mega_survivors")}: <strong>{data.drone_swarm.survivors_detected}</strong></span>
            </div>
            <div className="mega-drone-types">
              {Object.entries(data.drone_swarm.by_type).map(([type, count]) => (
                <span key={type} className="adv-map-chip accent-cyan">
                  <span className="adv-map-chip-label">{type}</span>
                  <strong>{count}</strong>
                </span>
              ))}
            </div>
            {data.drone_swarm.drones.slice(0, 12).map((d) => (
              <div key={d.id} className="adv-route-card">
                <strong>{d.id}</strong> · {d.type} · {d.status} · {d.mission} · <Icon3D name="battery" size={12} /> {Math.round(d.battery_pct)}%
              </div>
            ))}
          </div>
        )}

        {tab === "commander" && data.crisis_commander && (
          <div className="adv-block">
            <div className="mega-commander-status">{data.crisis_commander.last_briefing}</div>
            {data.crisis_commander.alerts.map((a) => (
              <div key={a.id} className={`mega-alert mega-alert-${a.priority}`}>
                <strong>{a.message}</strong>
                <div className="hint">→ {a.action}</div>
              </div>
            ))}
            <div className="mega-chat-row">
              <input
                value={commanderMsg}
                onChange={(e) => setCommanderMsg(e.target.value)}
                placeholder={t("mega_commander_placeholder")}
                onKeyDown={(e) => e.key === "Enter" && void askCommander()}
              />
              <button type="button" className="btn-primary" disabled={busy} onClick={() => void askCommander()}>
                {t("chat_send")}
              </button>
            </div>
            {commanderReply && <div className="mega-commander-reply">{commanderReply}</div>}
          </div>
        )}

        {tab === "knowledge" && data.knowledge_engine && (
          <div className="adv-block">
            <p className="hint">{data.knowledge_engine.comparison_summary}</p>
            {data.knowledge_engine.best_match && (
              <div className="mega-match-card">
                <strong>{data.knowledge_engine.best_match.name}</strong>
                <div>{t("mega_similarity")}: {data.knowledge_engine.best_match.similarity_pct}%</div>
              </div>
            )}
            <h4>{t("mega_recommended_strategies")}</h4>
            <ul className="adv-list">
              {data.knowledge_engine.recommended_strategies.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            <h4>{t("mega_key_differences")}</h4>
            <ul className="adv-list">
              {data.knowledge_engine.key_differences.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}

        {tab === "failure" && data.failure_chain && (
          <div className="adv-block">
            <p className="hint">{t("mega_failure_chains")}: {data.failure_chain.predictions_count}</p>
            {data.failure_chain.failure_chains.slice(0, 5).map((chain, i) => (
              <div key={i} className="mega-chain-card">
                <strong>{chain.trigger}</strong> ({chain.trigger_health}%)
                {chain.cascade.map((c, j) => (
                  <div key={j} className="mega-cascade-step" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon3D name="arrow-down" size={11} /> {c.name} — {t("mega_failure_prob")} {c.predicted_failure_prob}%
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === "governor" && data.ai_governor && (
          <div className="adv-block">
            <div className="mega-stat-row">
              <span>{t("mega_governance_mode")}: <strong>{data.ai_governor.governance_mode}</strong></span>
              <span>{t("mega_preparedness")}: <strong>{data.ai_governor.emergency_preparedness_score}%</strong></span>
            </div>
            <div className="mega-budget-grid">
              <span>{t("adv_healthcare_capacity")}: {data.ai_governor.healthcare_investment_pct}%</span>
              <span>{t("mega_education")}: {data.ai_governor.education_investment_pct}%</span>
              <span>{t("mega_energy")}: {data.ai_governor.energy_investment_pct}%</span>
              <span>{t("mega_transport")}: {data.ai_governor.transport_investment_pct}%</span>
            </div>
            <h4>{t("mega_long_term_forecast")}</h4>
            {data.ai_governor.long_term_forecast.map((f) => (
              <div key={f.year} className="adv-route-card">{f.year}: {t("adv_city_dna_score")} {f.health}% · GDP +{f.gdp_growth}%</div>
            ))}
            <ul className="adv-list">
              {data.ai_governor.resilience_upgrades.map((u, i) => <li key={i}>{u}</li>)}
            </ul>
          </div>
        )}

        {tab === "civilization" && data.civilization && (
          <div className="adv-block">
            <div className="mega-stat-row">
              <span>{t("mega_year")}: <strong>{data.civilization.current_year}</strong></span>
              <span>{t("mega_population")}: <strong>{data.civilization.population_k}k</strong></span>
              <span>{t("adv_gdp")}: <strong>{data.civilization.gdp_index}</strong></span>
            </div>
            <p className="hint">{data.civilization.unique_history}</p>
            <div className="mega-life-events">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon3D name="baby" size={14} /> {data.civilization.life_events.births_today}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon3D name="migration" size={14} /> {data.civilization.life_events.migrations_in}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon3D name="construction" size={14} /> {data.civilization.economy.construction_projects}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon3D name="chart" size={14} /> {data.civilization.economy.growth_pct}%</span>
            </div>
            {data.civilization.history.slice(-8).map((h, i) => (
              <div key={i} className="adv-route-card">
                {h.year}: pop {h.population_k}k · GDP {h.gdp_index} · {h.event}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
