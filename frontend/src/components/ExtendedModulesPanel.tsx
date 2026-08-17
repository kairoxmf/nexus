import { useState } from "react";
import { Icon3D } from "@shared/icons";
import type { ExtendedModulesState } from "../types";
import { useI18n } from "../i18n";

const TABS = [
  { id: "escape", titleKey: "ext_f1", shortKey: "ext_f1_short", group: "games" },
  { id: "roulette", titleKey: "ext_f2", shortKey: "ext_f2_short", group: "games" },
  { id: "speedrun", titleKey: "ext_f3", shortKey: "ext_f3_short", group: "games" },
  { id: "adversarial", titleKey: "ext_f4", shortKey: "ext_f4_short", group: "ai" },
  { id: "oracle", titleKey: "ext_f5", shortKey: "ext_f5_short", group: "ai" },
  { id: "redteam", titleKey: "ext_f6", shortKey: "ext_f6_short", group: "ai" },
  { id: "satphone", titleKey: "ext_f7", shortKey: "ext_f7_short", group: "realism" },
  { id: "osm", titleKey: "ext_f8", shortKey: "ext_f8_short", group: "realism" },
  { id: "refugee", titleKey: "ext_f9", shortKey: "ext_f9_short", group: "realism" },
  { id: "cert", titleKey: "ext_f10", shortKey: "ext_f10_short", group: "org" },
  { id: "market", titleKey: "ext_f11", shortKey: "ext_f11_short", group: "org" },
  { id: "ledger", titleKey: "ext_f12", shortKey: "ext_f12_short", group: "org" },
] as const;

type TabId = (typeof TABS)[number]["id"];
const API = import.meta.env.VITE_API_URL ?? "";

async function post(path: string, body?: unknown) {
  const token = localStorage.getItem("nexus_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { method: "POST", headers, body: body ? JSON.stringify(body) : undefined });
  return r.json();
}

export function ExtendedModulesPanel({ data, expanded = false }: { data?: ExtendedModulesState; expanded?: boolean }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("escape");
  const [busy, setBusy] = useState(false);
  const [puzzleAnswer, setPuzzleAnswer] = useState("");
  const [satMsg, setSatMsg] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [certScore, setCertScore] = useState(85);
  const [marketQty, setMarketQty] = useState(10);
  const [marketResource, setMarketResource] = useState("power_mw");
  const [feedback, setFeedback] = useState("");

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      const d = (await fn()) as { ok?: boolean; error?: string; correct?: boolean; hint?: string; escaped?: boolean };
      if (d.error) setFeedback(d.error);
      else if (d.correct === false) setFeedback(d.hint ?? t("ext_wrong_answer"));
      else if (d.escaped) setFeedback(t("ext_escaped"));
      else if (d.ok) setFeedback(t("ext_done"));
    } finally {
      setBusy(false);
    }
  };

  if (!data) return null;
  const activeTab = TABS.find((x) => x.id === tab)!;
  const games = data.games;
  const ai = data.advanced_ai;
  const realism = data.realism;
  const org = data.organizational;

  return (
    <div className={`section adv-modules extended-modules${expanded ? " is-modal" : ""}`}>
      {!expanded && <div className="section-title">{t("ext_modules_title")}</div>}
      <div className="ext-group-labels">
        <span>{t("ext_group_games")}</span>
        <span>{t("ext_group_ai")}</span>
        <span>{t("ext_group_realism")}</span>
        <span>{t("ext_group_org")}</span>
      </div>
      <div className="adv-tabs ext-tabs">
        {TABS.map((item) => (
          <button key={item.id} type="button" className={`adv-tab ext-tab-${item.group}${tab === item.id ? " active" : ""}`} onClick={() => setTab(item.id)} title={t(item.titleKey)}>
            {t(item.shortKey)}
          </button>
        ))}
      </div>
      <div className="adv-active-title">{t(activeTab.titleKey)}</div>
      {feedback && <div className="hint ext-feedback">{feedback}</div>}

      <div className={`adv-panel${expanded ? " is-expanded nx-scroll nx-scroll-glow" : " nx-scroll-sm"}`}>
        {tab === "escape" && games?.escape_room && (
          <div className="adv-block">
            {!games.escape_room.active ? (
              <>
                <p className="hint">{t("ext_escape_desc")}</p>
                {games.escape_room.rooms.map((r) => (
                  <button key={r.id} className="btn-ghost ext-room-btn" disabled={busy} onClick={() => run(() => post("/api/v1/extended/escape/start", { room_id: r.id }))}>
                    {r.title} ({r.theme})
                  </button>
                ))}
                {games.escape_room.completed.length > 0 && (
                  <div className="mega-stat-row">{t("ext_completed")}: {games.escape_room.completed.join(", ")}</div>
                )}
              </>
            ) : (
              <>
                <strong>{games.escape_room.active.title}</strong>
                {games.escape_room.active.puzzles.map((p) => (
                  <div key={p.id} className="ext-puzzle-card">
                    <div>{p.clue}</div>
                    {p.solved ? (
                      <span className="mega-verified" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Icon3D name="check" size={12} /> {t("ext_solved")}
                      </span>
                    ) : (
                      <div className="ext-puzzle-input">
                        <input value={puzzleAnswer} onChange={(e) => setPuzzleAnswer(e.target.value)} placeholder={t("ext_answer")} />
                        <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/extended/escape/solve", { puzzle_id: p.id, answer: puzzleAnswer }))}>
                          {t("ext_submit")}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {games.escape_room.active.escaped && <div className="mega-winner">{t("ext_escaped")}</div>}
              </>
            )}
          </div>
        )}

        {tab === "roulette" && games?.roulette && (
          <div className="adv-block">
            <p className="hint">{t("ext_roulette_desc")}</p>
            <button className="btn-primary ext-spin-btn" disabled={busy} onClick={() => run(() => post("/api/v1/extended/roulette/spin"))}>
              {t("ext_spin")}
            </button>
            {games.roulette.active_modifier && (
              <div className="mega-official">
                {games.roulette.active_modifier.label}: {games.roulette.active_modifier.effect}
              </div>
            )}
            {games.roulette.history.map((h) => (
              <div key={h.id} className="adv-route-card">
                <strong>{h.segment.label}</strong> — {h.segment.effect}
              </div>
            ))}
          </div>
        )}

        {tab === "speedrun" && games?.speedrun && (
          <div className="adv-block">
            <p className="hint">{t("ext_speedrun_desc")}</p>
            {!games.speedrun.active?.active ? (
              <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/extended/speedrun/start"))}>
                {t("ext_start_speedrun")}
              </button>
            ) : (
              <div className="mega-stat-row">
                <span>{t("ext_elapsed")}: <strong>{Math.round(games.speedrun.active.elapsed_sec ?? 0)}s</strong></span>
                {games.speedrun.active.completed && <span>{t("ext_finish")}: <strong>{games.speedrun.active.finish_time_sec}s</strong></span>}
              </div>
            )}
            {games.speedrun.personal_best && (
              <div className="mega-winner">{t("ext_personal_best")}: {games.speedrun.personal_best.finish_time_sec}s</div>
            )}
            <ul className="adv-list">
              {games.speedrun.leaderboard.filter((e) => e.time_sec).map((e, i) => (
                <li key={i}>{e.player}: {e.time_sec}s</li>
              ))}
            </ul>
          </div>
        )}

        {tab === "adversarial" && ai?.adversarial && (
          <div className="adv-block">
            <p className="hint">{t("ext_adversarial_desc")}</p>
            <button
              className={`btn-primary${ai.adversarial.active ? " active" : ""}`}
              disabled={busy}
              onClick={() => run(() => post("/api/v1/extended/adversarial/toggle", { active: !ai.adversarial!.active }))}
            >
              {ai.adversarial.active ? t("ext_disable") : t("ext_enable")} {t("ext_adversarial_mode")}
            </button>
            <div className="mega-stat-row">{t("ext_threat")}: <strong className="mega-panic">{ai.adversarial.threat_level}</strong></div>
            {ai.adversarial.actions.map((a) => (
              <div key={a.id} className="mega-post misinfo">
                <strong>{a.action}</strong> — {a.impact}
                <div className="hint">{a.countermeasure}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "oracle" && ai?.oracle && (
          <div className="adv-block">
            <p className="hint">{ai.oracle.note}</p>
            <div className="mega-stat-row">{t("ext_accuracy")}: <strong>{ai.oracle.accuracy_pct}%</strong></div>
            {!ai.oracle.enabled ? (
              <div className="hint">{t("ext_oracle_standby")}</div>
            ) : (
              ai.oracle.forecasts.map((f, i) => (
                <div key={i} className="adv-route-card">
                  T+{f.horizon_ticks}: <strong>{f.event}</strong> — {f.probability}% · {f.confidence}% conf
                  {f.affected_nodes.length > 0 && <span> → {f.affected_nodes.join(", ")}</span>}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "redteam" && ai?.red_team && (
          <div className="adv-block">
            <p className="hint">{t("ext_redteam_desc")}</p>
            <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/extended/red-team/scan"))}>
              {t("ext_run_scan")}
            </button>
            {ai.red_team.report && (
              <div className="mega-stat-row">
                {t("ext_critical")}: <strong>{ai.red_team.report.critical_count}</strong> / {ai.red_team.report.targets_scanned}
              </div>
            )}
            {ai.red_team.findings.map((f) => (
              <div key={f.id} className={`mega-post${f.severity === "critical" ? " urgent" : ""}`}>
                <strong>{f.name}</strong> ({f.type}) — {f.vulnerability}
                <div className="hint">{f.exploit_scenario}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "satphone" && realism?.satellite_phone && (
          <div className="adv-block">
            <p className="hint">{t("ext_satphone_desc")}</p>
            <div className="mega-stat-row">{t("ext_blackout_zones")}: {realism.satellite_phone.blackout_zones}</div>
            {realism.satellite_phone.phones.map((p) => (
              <div key={p.id} className="adv-route-card" onClick={() => setSelectedPhone(p.id)} style={{ cursor: "pointer" }}>
                <strong>{p.caller}</strong> — {p.status} · {Math.round(p.signal_strength * 100)}% ·{" "}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Icon3D name="battery" size={12} /> {p.battery_pct}%
                </span>
              </div>
            ))}
            <div className="ext-puzzle-input">
              <input value={satMsg} onChange={(e) => setSatMsg(e.target.value)} placeholder={t("ext_message")} />
              <button
                className="btn-primary"
                disabled={busy || !selectedPhone}
                onClick={() => run(() => post("/api/v1/extended/satellite/send", { phone_id: selectedPhone, message: satMsg }))}
              >
                {t("ext_send")}
              </button>
            </div>
            {realism.satellite_phone.messages.map((m) => (
              <div key={m.id} className={`mega-post${m.direction === "inbound" ? "" : " mega-official"}`}>
                <span className="mega-ai-tag">{m.direction}</span> {m.message} ({m.latency_sec}s)
              </div>
            ))}
          </div>
        )}

        {tab === "osm" && realism?.osm_import && (
          <div className="adv-block">
            <p className="hint">{t("ext_osm_desc")}</p>
            {realism.osm_import.presets.map((c) => (
              <button key={c.city_id} className="btn-ghost ext-room-btn" disabled={busy} onClick={() => run(() => post("/api/v1/extended/osm/import", { city_id: c.city_id }))}>
                {c.name} — {c.buildings.toLocaleString()} {t("ext_buildings")}, {c.roads_km} km {t("ext_roads")}
              </button>
            ))}
            {realism.osm_import.active && (
              <div className="mega-official">
                {t("ext_active_import")}: {realism.osm_import.active.name} — {realism.osm_import.active.nodes_generated} {t("ext_nodes")}
              </div>
            )}
          </div>
        )}

        {tab === "refugee" && realism?.refugee_flow && (
          <div className="adv-block">
            <div className="mega-stat-row">
              <span>{t("ext_displaced")}: <strong>{realism.refugee_flow.total_displaced.toLocaleString()}</strong></span>
              <span>{t("ext_capacity")}: <strong>{realism.refugee_flow.capacity_utilization_pct}%</strong></span>
            </div>
            {realism.refugee_flow.routes.map((r) => (
              <div key={r.id} className="adv-route-card">
                <strong>{r.from} → {r.to}</strong>: {r.count.toLocaleString()} · {r.status} · {r.progress_pct}%
              </div>
            ))}
            {realism.refugee_flow.camps.map((c) => (
              <div key={c.id} className="mega-stat-row">
                {c.name}: {c.occupied}/{c.capacity}
              </div>
            ))}
          </div>
        )}

        {tab === "cert" && org?.certification ? (
          <div className="adv-block">
            <p className="hint">{t("ext_cert_desc")}</p>
            {org.certification.modules.map((m) => {
              const prog = org.certification!.progress[m.id];
              return (
                <div key={m.id} className="ext-puzzle-card">
                  <strong>{m.title}</strong> — {t("ext_pass_score")}: {m.pass_score}%
                  {prog ? (
                    <span className={prog.passed ? "mega-verified" : "mega-fake"} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {" "}{prog.score}% {prog.passed ? <Icon3D name="check" size={12} /> : <Icon3D name="cross" size={12} />}
                    </span>
                  ) : (
                    <>
                      <input type="range" min={0} max={100} value={certScore} onChange={(e) => setCertScore(Number(e.target.value))} />
                      <span>{certScore}%</span>
                      <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/extended/certification/submit", { module_id: m.id, score: certScore }))}>
                        {t("ext_submit_exam")}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
            {org.certification.badges.map((b) => (
              <div key={b.certificate_id} className="mega-winner">{b.certificate_id} — {b.title}</div>
            ))}
          </div>
        ) : null}

        {tab === "market" && org?.marketplace && (
          <div className="adv-block">
            <div className="mega-stat-row">
              {t("ext_balance")}: <strong>${org.marketplace.balance_usd.toLocaleString()}</strong>
            </div>
            <select value={marketResource} onChange={(e) => setMarketResource(e.target.value)}>
              {org.marketplace.listings.map((l) => (
                <option key={l.resource} value={l.resource}>{l.resource} (${l.base_price}/{l.unit})</option>
              ))}
            </select>
            <input type="number" min={1} value={marketQty} onChange={(e) => setMarketQty(Number(e.target.value))} />
            <div className="ext-puzzle-input">
              <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/extended/marketplace/order", { resource: marketResource, quantity: marketQty, side: "buy" }))}>
                {t("ext_buy")}
              </button>
              <button className="btn-ghost" disabled={busy} onClick={() => run(() => post("/api/v1/extended/marketplace/order", { resource: marketResource, quantity: marketQty, side: "sell" }))}>
                {t("ext_sell")}
              </button>
            </div>
            {org.marketplace.orders.slice(0, 8).map((o) => (
              <div key={o.id} className="adv-route-card">{o.side.toUpperCase()} {o.quantity} {o.resource} — ${o.price_usd}</div>
            ))}
          </div>
        )}

        {tab === "ledger" && org?.blockchain_ledger && (
          <div className="adv-block">
            <div className="mega-stat-row">
              {t("ext_blocks")}: <strong>{org.blockchain_ledger.total_blocks}</strong>
              · {t("ext_integrity")}: <strong className={org.blockchain_ledger.chain_integrity === "valid" ? "mega-verified" : "mega-fake"}>{org.blockchain_ledger.chain_integrity}</strong>
            </div>
            <button className="btn-ghost" onClick={() => window.open(`${API}/api/v1/extended/ledger/export`, "_blank")}>
              {t("ext_export_ledger")}
            </button>
            {org.blockchain_ledger.blocks.slice().reverse().map((b) => (
              <div key={b.index} className="ext-ledger-block">
                <strong>#{b.index}</strong> {b.type}
                <div className="hint mono">{b.hash.slice(0, 16)}…</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
