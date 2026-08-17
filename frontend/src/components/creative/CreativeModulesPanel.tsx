import { useState, useRef, useCallback } from "react";
import { Icon3D } from "@shared/icons";
import type { CreativeModulesState } from "../../types";
import { useI18n } from "../../i18n";

const TABS = [
  { id: "warroom", titleKey: "creative_f1", shortKey: "creative_f1_short" },
  { id: "earlywarning", titleKey: "creative_f2", shortKey: "creative_f2_short" },
  { id: "butterfly", titleKey: "creative_f3", shortKey: "creative_f3_short" },
  { id: "news", titleKey: "creative_f4", shortKey: "creative_f4_short" },
  { id: "sos", titleKey: "creative_f5", shortKey: "creative_f5_short" },
  { id: "ethics", titleKey: "creative_f6", shortKey: "creative_f6_short" },
  { id: "voice", titleKey: "creative_f7", shortKey: "creative_f7_short" },
  { id: "pulse", titleKey: "creative_f8", shortKey: "creative_f8_short" },
  { id: "podcast", titleKey: "creative_f9", shortKey: "creative_f9_short" },
  { id: "citytwin", titleKey: "creative_f10", shortKey: "creative_f10_short" },
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

interface SpeechRecognitionInstance {
  lang: string;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function CreativeModulesPanel({ data, expanded = false }: { data?: CreativeModulesState; expanded?: boolean }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("warroom");
  const [busy, setBusy] = useState(false);
  const [warRole, setWarRole] = useState("mayor");
  const [warDecision, setWarDecision] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  const startVoice = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { setVoiceReply(t("creative_voice_unsupported")); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => {
      const transcript = ev.results[0][0].transcript;
      run(async () => {
        const d = await post("/api/v1/creative/voice/command", { transcript });
        setVoiceReply(d.response ?? "");
      });
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [t]);

  if (!data) return null;
  const activeTab = TABS.find((x) => x.id === tab)!;

  return (
    <div className={`section adv-modules creative-modules${expanded ? " is-modal" : ""}`}>
      {!expanded && <div className="section-title">{t("creative_modules_title")}</div>}
      <div className="adv-tabs">
        {TABS.map((item) => (
          <button key={item.id} type="button" className={`adv-tab${tab === item.id ? " active" : ""}`} onClick={() => setTab(item.id)} title={t(item.titleKey)}>
            {t(item.shortKey)}
          </button>
        ))}
      </div>
      <div className="adv-active-title">{t(activeTab.titleKey)}</div>
      <div className={`adv-panel${expanded ? " is-expanded nx-scroll nx-scroll-glow" : " nx-scroll-sm"}`}>

        {tab === "warroom" && data.war_room && (
          <div className="adv-block">
            {!data.war_room.active ? (
              <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/creative/war-room/start"))}>
                {t("creative_war_start")}
              </button>
            ) : (
              <>
                <div className="mega-stat-row">{t("creative_war_conflicts")}: <strong>{data.war_room.conflicts}</strong></div>
                {data.war_room.roles.map((r) => (
                  <div key={r.id} className="creative-score-row">
                    <span>{r.label}</span>
                    <div className="mega-score-bars"><div className="mega-bar ai" style={{ width: `${data.war_room!.scores[r.id] ?? 50}%` }} /></div>
                    <span>{data.war_room!.scores[r.id] ?? 50}</span>
                  </div>
                ))}
                <select value={warRole} onChange={(e) => setWarRole(e.target.value)}>
                  {data.war_room.roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                <input placeholder={t("creative_war_action")} value={warDecision} onChange={(e) => setWarDecision(e.target.value)} />
                <button className="btn-primary" disabled={busy || !warDecision.trim()} onClick={() => run(async () => {
                  await post("/api/v1/creative/war-room/decision", { role: warRole, decision: warDecision });
                  setWarDecision("");
                })}>{t("creative_war_submit")}</button>
                {data.war_room.decisions.map((d) => (
                  <div key={d.id} className={`creative-decision impact-${d.impact}`}>
                    <strong>{d.role}</strong>: {d.action}
                    {d.player_submitted && <span className="creative-badge">YOU</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "earlywarning" && (
          <div className="adv-block">
            {data.early_warning?.active && !data.early_warning.triggered ? (
              <>
                <div className="creative-countdown">
                  <span className="creative-countdown-num">{data.early_warning.hours_remaining.toFixed(1)}</span>
                  <span>{t("creative_hours_remaining")}</span>
                </div>
                <div className="mega-stat-row">{t("creative_preparedness")}: <strong>{data.early_warning.preparedness_score}%</strong></div>
                <div className="mega-stat-row">{t("disaster_type")}: <strong>{data.early_warning.disaster_type}</strong> · M{data.early_warning.magnitude}</div>
                {["Stock emergency supplies", "Pre-position rescue teams", "Test backup generators", "Issue public advisory"].map((a) => (
                  <button key={a} className="btn-ghost" disabled={busy} onClick={() => run(() => post("/api/v1/creative/early-warning/prepare", { action: a }))}>{a}</button>
                ))}
                {data.early_warning.signals?.map((s) => (
                  <div key={s.id} className={`creative-signal sev-${s.severity}`}>
                    <span>{s.type.toUpperCase()}</span> — {s.message}
                    <small>T-{s.hours_before_impact}h</small>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className="hint">{t("creative_early_desc")}</p>
                <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/creative/early-warning/start", { disaster_type: "earthquake", magnitude: 6, hours: 72 }))}>
                  {t("creative_early_start")}
                </button>
              </>
            )}
          </div>
        )}

        {tab === "butterfly" && (
          <div className="adv-block">
            {!data.butterfly_effect?.active ? (
              <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/creative/butterfly/start"))}>
                {t("creative_butterfly_start")}
              </button>
            ) : (
              <div className="butterfly-split">
                {(["a", "b"] as const).map((side) => {
                  const uni = side === "a" ? data.butterfly_effect!.universe_a : data.butterfly_effect!.universe_b;
                  const strat = side === "a" ? data.butterfly_effect!.strategy_a : data.butterfly_effect!.strategy_b;
                  return (
                    <div key={side} className={`butterfly-universe uni-${side}`}>
                      <h4>{t("creative_universe")} {side.toUpperCase()}</h4>
                      <p className="hint">{strat}</p>
                      <div>{t("city_health")}: <strong>{uni.health}%</strong></div>
                      <div>{t("creative_lives_saved")}: <strong>{uni.lives_saved}</strong></div>
                      <div>{t("creative_cost")}: <strong>${uni.cost_m}M</strong></div>
                      <div className="butterfly-bar"><div style={{ width: `${uni.health}%`, background: side === "a" ? "var(--cyan)" : "var(--amber)" }} /></div>
                    </div>
                  );
                })}
                <div className="mega-stat-row">{t("creative_elapsed")}: {data.butterfly_effect.elapsed_minutes} min</div>
              </div>
            )}
          </div>
        )}

        {tab === "news" && data.news_network && (
          <div className="adv-block">
            <div className={`creative-news-status ${data.news_network.live ? "live" : ""}`}>
              {data.news_network.live ? t("creative_news_live") : t("creative_news_standby")}
            </div>
            {data.news_network.press_conference && (
              <div className="creative-press-conf">
                <strong>{t("creative_press_conf")}</strong>
                <p>{data.news_network.press_conference.summary}</p>
                <small>{data.news_network.press_conference.speaker}</small>
              </div>
            )}
            {data.news_network.items.map((n) => (
              <div key={n.id} className={`creative-news-item pri-${n.priority}`}>
                <span className="creative-news-tag">{n.tag}</span>
                {n.text}
                {!n.verified && <span className="mega-fake">{t("mega_fake")}</span>}
              </div>
            ))}
          </div>
        )}

        {tab === "sos" && data.sos_sync && (
          <div className="adv-block">
            <div className="mega-stat-row">{t("creative_sos_active")}: <strong>{data.sos_sync.active_count}</strong></div>
            <p className="hint">{t("creative_sos_desc")}</p>
            {data.sos_sync.reports.map((r) => (
              <div key={r.id} className="creative-sos-item">
                <strong>SOS #{r.id}</strong> — {r.message}
                <small>{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)} · ETA {r.eta_minutes}min</small>
              </div>
            ))}
            {data.sos_sync.intel_reports.map((r) => (
              <div key={r.id} className="creative-intel-item">
                <strong>{r.category}</strong> — {r.message}
                <small>{t("creative_credibility")}: {(r.credibility * 100).toFixed(0)}%</small>
              </div>
            ))}
          </div>
        )}

        {tab === "ethics" && data.ethical_dilemmas && (
          <div className="adv-block">
            {Object.entries(data.ethical_dilemmas.scores).map(([k, v]) => (
              <div key={k} className="creative-score-row">
                <span>{k}</span>
                <div className="mega-score-bars"><div className="mega-bar human" style={{ width: `${v}%` }} /></div>
                <span>{v}</span>
              </div>
            ))}
            {data.ethical_dilemmas.current ? (
              <div className="creative-dilemma">
                <p><strong>{data.ethical_dilemmas.current.question}</strong></p>
                <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/creative/dilemma/resolve", { choice: "a" }))}>
                  A: {data.ethical_dilemmas.current.option_a}
                </button>
                <button className="btn-ghost" disabled={busy} onClick={() => run(() => post("/api/v1/creative/dilemma/resolve", { choice: "b" }))}>
                  B: {data.ethical_dilemmas.current.option_b}
                </button>
              </div>
            ) : (
              <p className="hint">{t("creative_dilemma_wait")}</p>
            )}
            {data.ethical_dilemmas.history.map((h, i) => (
              <div key={i} className="creative-decision">{h.option_text}</div>
            ))}
          </div>
        )}

        {tab === "voice" && data.voice_command && (
          <div className="adv-block">
            <button className={`btn-primary${listening ? " listening" : ""}`} onClick={startVoice} disabled={listening} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {!listening && <Icon3D name="mic" size={16} animated />}
              {listening ? t("creative_voice_listening") : t("creative_voice_start")}
            </button>
            <p className="hint">{t("creative_voice_hint")}</p>
            {data.voice_command.supported_commands.map((c) => (
              <span key={c} className="creative-cmd-chip">{c}</span>
            ))}
            {voiceReply && <div className="creative-voice-reply">{voiceReply}</div>}
            {data.voice_command.recent.map((v) => (
              <div key={v.id} className="creative-decision">
                <strong>You:</strong> {v.transcript}<br />
                <strong>AI:</strong> {v.response}
              </div>
            ))}
          </div>
        )}

        {tab === "pulse" && data.city_pulse && (
          <div className="adv-block">
            <div className="creative-pulse-display">
              <Icon3D name="heart" size={32} animated color="#ff4655" />
              <span className="creative-pulse-bpm">{data.city_pulse.heartbeat_bpm}</span>
              <span>BPM</span>
            </div>
            <div className="mega-stat-row">{t("creative_ambient")}: <strong>{data.city_pulse.ambient_level}</strong></div>
            <div className="mega-stat-row">{t("creative_glow")}: <strong>{(data.city_pulse.glow_intensity * 100).toFixed(0)}%</strong></div>
            <div className="mega-stat-row">{t("creative_building_pulse")}: <strong>{(data.city_pulse.building_pulse * 100).toFixed(0)}%</strong></div>
            <div className="mega-stat-row">{t("creative_social_speed")}: <strong>{data.city_pulse.social_scroll_speed}x</strong></div>
          </div>
        )}

        {tab === "podcast" && (
          <div className="adv-block">
            <button className="btn-primary" disabled={busy} onClick={() => run(() => post("/api/v1/creative/podcast/generate"))}>
              {t("creative_podcast_generate")}
            </button>
            {data.crisis_podcast?.segments && (
              <>
                <h4>{data.crisis_podcast.title}</h4>
                <small>{data.crisis_podcast.duration_sec}s · {data.crisis_podcast.status}</small>
                {data.crisis_podcast.segments.map((s, i) => (
                  <div key={i} className="creative-podcast-seg">
                    <strong>{s.speaker}</strong> ({s.duration_sec}s)
                    <p>{s.text}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "citytwin" && data.city_twin && (
          <div className="adv-block">
            <div className="mega-stat-row">{t("creative_active_city")}: <strong>{data.city_twin.active.name}</strong></div>
            <p className="hint">{data.city_twin.active.lat.toFixed(4)}°, {data.city_twin.active.lng.toFixed(4)}° · {data.city_twin.active.country}</p>
            <div className="creative-city-grid">
              {data.city_twin.presets.map((c) => (
                <button key={c.id} className={`btn-ghost creative-city-btn${data.city_twin!.active.id === c.id ? " active" : ""}`} disabled={busy}
                  onClick={() => run(() => post("/api/v1/creative/city/select", { city_id: c.id }))}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
