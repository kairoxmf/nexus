import { useState } from "react";
import { Icon3D } from "@shared/icons";
import type { ImmersiveModulesState } from "../types";
import { useI18n } from "../i18n";
import { useNexus } from "../context/NexusContext";

const TABS = [
  { id: "cinema", titleKey: "imm_f1", shortKey: "imm_f1_short" },
  { id: "social", titleKey: "imm_f2", shortKey: "imm_f2_short" },
  { id: "diplomatic", titleKey: "imm_f3", shortKey: "imm_f3_short" },
  { id: "climate", titleKey: "imm_f4", shortKey: "imm_f4_short" },
  { id: "persian", titleKey: "imm_f5", shortKey: "imm_f5_short" },
  { id: "multiplayer", titleKey: "imm_f6", shortKey: "imm_f6_short" },
  { id: "realism", titleKey: "imm_f7", shortKey: "imm_f7_short" },
  { id: "map", titleKey: "imm_f8", shortKey: "imm_f8_short" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const API = import.meta.env.VITE_API_URL ?? "";

export function ImmersiveModulesPanel({ data, expanded = false }: { data?: ImmersiveModulesState; expanded?: boolean }) {
  const { t, locale } = useI18n();
  const { immersivePost } = useNexus();
  const [tab, setTab] = useState<TabId>("cinema");
  const [busy, setBusy] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const [negotiationCity, setNegotiationCity] = useState("nyc");

  if (!data) return null;

  const activeTab = TABS.find((x) => x.id === tab)!;
  const isFa = locale === "fa";

  const post = async (path: string, body?: object) => {
    setBusy(true);
    try {
      await immersivePost(path, body);
    } finally {
      setBusy(false);
    }
  };

  const askVoice = async () => {
    if (!voiceInput.trim()) return;
    setBusy(true);
    try {
      const r = await fetch(`${API}/api/v1/immersive/voice/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: voiceInput, locale }),
      });
      const d = await r.json();
      setVoiceReply(d.response ?? "");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`adv-modules${expanded ? " expanded" : ""}`}>
      <div className="adv-tabs">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            type="button"
            className={`adv-tab${tab === tb.id ? " active" : ""}`}
            onClick={() => setTab(tb.id)}
          >
            {expanded ? t(tb.titleKey) : t(tb.shortKey)}
          </button>
        ))}
      </div>

      <div className="adv-panel-title">{t(activeTab.titleKey)}</div>

      {tab === "cinema" && data.cinema && (
        <div className="adv-section">
          <div className="hint">{t("imm_cinema_desc")}</div>
          <div style={{ margin: "12px 0", fontSize: 11 }}>
            {data.cinema.active ? (
              <span style={{ color: "var(--cyan)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon3D name="dot" size={10} animated color="#4cc9f0" /> {t("imm_cinema_live")} — {data.cinema.progress_pct}%
              </span>
            ) : (
              <span>{t("imm_cinema_idle")}</span>
            )}
          </div>
          {data.cinema.shots?.map((s) => (
            <div key={s.scene} className="adv-card" style={{ marginBottom: 8 }}>
              <strong>Scene {s.scene}</strong> · {s.camera} · {s.duration_sec}s
              <div className="hint">{s.subtitle}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Icon3D name="music" size={12} animated /> {s.music}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn-primary" disabled={busy} onClick={() => post("cinema/start", { locale })}>
              {t("imm_cinema_start")}
            </button>
            <button className="btn-ghost" disabled={busy} onClick={() => post("cinema/stop")}>
              {t("imm_cinema_stop")}
            </button>
          </div>
        </div>
      )}

      {tab === "social" && data.mayor_social && (
        <div className="adv-section">
          <div className="hint">
            {t("imm_trust_index")}: <strong style={{ color: "var(--cyan)" }}>{data.mayor_social.public_trust_index}%</strong>
            {" · "}{data.mayor_social.platform}
          </div>
          <div style={{ fontSize: 10, margin: "8px 0", color: "var(--muted)" }}>
            {data.mayor_social.trending?.join(" · ")}
          </div>
          {data.mayor_social.posts?.slice(0, 8).map((p) => (
            <div key={p.id} className="adv-card" style={{ marginBottom: 6 }}>
              <strong>{p.author}</strong> {p.verified && <Icon3D name="check" size={12} />}
              <div>{isFa && p.text_fa ? p.text_fa : p.text}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Icon3D name="heart" size={11} animated /> {p.likes}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Icon3D name="retweet" size={11} /> {p.retweets}</span>
                <span>· {p.sentiment}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "diplomatic" && data.diplomatic_war_room && (
        <div className="adv-section">
          <div className="hint">{t("imm_diplomatic_desc")}</div>
          <select value={negotiationCity} onChange={(e) => setNegotiationCity(e.target.value)} style={{ margin: "8px 0", width: "100%" }}>
            {data.diplomatic_war_room.federated_cities?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            className="btn-primary"
            disabled={busy}
            onClick={() => post("diplomatic/negotiate", { city_id: negotiationCity, offer: "500 MW emergency power" })}
          >
            {t("imm_negotiate")}
          </button>
          {data.diplomatic_war_room.negotiations?.slice(0, 5).map((n) => (
            <div key={n.id} className="adv-card" style={{ marginTop: 8 }}>
              <strong>{n.from_city} → {n.to_city}</strong> · {n.status}
              <div className="hint">{n.offer} → {n.counter_offer}</div>
              <div style={{ fontSize: 9 }}>AI {Math.round(n.ai_confidence * 100)}% — {n.ai_reasoning}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "climate" && data.climate_2050 && (
        <div className="adv-section">
          <div className="hint">{data.climate_2050.scenario}</div>
          <div style={{ fontSize: 11, margin: "10px 0" }}>
            {t("imm_climate_year")}: <strong>{data.climate_2050.current_year}</strong>
            {" · "}{t("imm_sea_rise")}: {data.climate_2050.sea_level_rise_cm} cm
            {" · "}{t("imm_heat_days")}: {data.climate_2050.heat_days_per_year}
          </div>
          <div className="hint">{t("imm_migration")}: +{data.climate_2050.migration_influx_k}k</div>
          <button className="btn-primary" disabled={busy} style={{ marginTop: 12 }} onClick={() => post("climate/start")}>
            {t("imm_climate_start")}
          </button>
        </div>
      )}

      {tab === "persian" && data.persian_ai && (
        <div className="adv-section">
          {data.persian_ai.briefing && (
            <>
              <div className="adv-card">
                <strong>{data.persian_ai.briefing.title}</strong>
                <div className="hint" style={{ marginTop: 6 }}>{data.persian_ai.briefing.summary_fa}</div>
                <div style={{ fontSize: 10, marginTop: 8, color: "var(--cyan)" }}>
                  {data.persian_ai.briefing.news_ticker_fa}
                </div>
              </div>
              {data.persian_ai.briefing.feed_fa?.map((f, i) => (
                <div key={i} className="hint" style={{ marginTop: 4 }}>• {f}</div>
              ))}
            </>
          )}
          {data.news_anchor?.segments?.slice(-2).map((s, i) => (
            <div key={i} className="adv-card" style={{ marginTop: 8, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <Icon3D name="tv" size={14} />
              <span>{isFa && s.text_fa ? s.text_fa : s.text}</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <input
              placeholder={t("imm_voice_placeholder")}
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <button className="btn-primary" disabled={busy} onClick={askVoice}>{t("imm_voice_ask")}</button>
            {voiceReply && <div className="hint" style={{ marginTop: 8 }}>{voiceReply}</div>}
          </div>
        </div>
      )}

      {tab === "multiplayer" && (
        <div className="adv-section">
          <div className="hint">
            {t("imm_spectators")}: {data.multiplayer?.spectator_count ?? 0}
            {data.multiplayer?.spectator_mode && " · LIVE"}
          </div>
          <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
            <button className="btn-ghost" disabled={busy} onClick={() => post("spectator/enable")}>
              {t("imm_spectator_join")}
            </button>
            <button className="btn-primary" disabled={busy} onClick={() => post("multiplayer/2v2/start")}>
              {t("imm_2v2_start")}
            </button>
          </div>
          {data.multiplayer?.crisis_2v2 && (
            <div className="adv-card">
              <strong>{data.multiplayer.crisis_2v2.team_a}</strong> {Math.round(data.multiplayer.crisis_2v2.team_a_score)}
              {" vs "}
              <strong>{data.multiplayer.crisis_2v2.team_b}</strong> {Math.round(data.multiplayer.crisis_2v2.team_b_score)}
              <div className="hint">
                Adversarial AI: {Math.round(data.multiplayer.crisis_2v2.adversarial_ai_score)}
                {data.multiplayer.crisis_2v2.winner && ` · Winner: ${data.multiplayer.crisis_2v2.winner}`}
              </div>
            </div>
          )}
          <div className="section-title" style={{ marginTop: 16 }}>{t("imm_leaderboard")}</div>
          {data.leaderboard?.global?.slice(0, 5).map((e, i) => (
            <div key={i} style={{ fontSize: 10, marginBottom: 4 }}>
              #{i + 1} {e.player} · {e.mode} · {e.score}
              {e.time_sec && ` · ${e.time_sec}s`}
            </div>
          ))}
        </div>
      )}

      {tab === "realism" && data.realism && (
        <div className="adv-section">
          {data.realism.weather_live && (
            <div className="adv-card">
              <strong>{t("imm_weather_live")}</strong>
              <div className="hint">
                {String(data.realism.weather_live.condition)} · {String(data.realism.weather_live.temp_c)}°C ·
                {" "}{String(data.realism.weather_live.wind_kmh)} km/h
              </div>
            </div>
          )}
          <div style={{ margin: "12px 0" }}>
            {data.realism.historical_events?.map((ev) => (
              <button
                key={ev.id}
                className="btn-ghost"
                style={{ display: "block", width: "100%", marginBottom: 6 }}
                disabled={busy}
                onClick={() => post("historical/replay", { event_id: ev.id })}
              >
                {isFa ? ev.name_fa : ev.name} ({ev.date})
              </button>
            ))}
          </div>
          <button className="btn-primary" disabled={busy} onClick={() => post("push/subscribe")}>
            {t("imm_push_subscribe")} ({data.realism.push_notifications?.subscribers ?? 0})
          </button>
          {data.realism.push_notifications?.recent?.slice(0, 3).map((a, i) => (
            <div key={i} className="hint" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon3D name="bell" size={13} animated /> {String(a.title_fa ?? a.title)}
            </div>
          ))}
        </div>
      )}

      {tab === "map" && data.map_layer && (
        <div className="adv-section">
          <div className="adv-card">
            <strong>{t("imm_map_layer")}</strong>
            <div style={{ fontSize: 11, marginTop: 8, lineHeight: 1.8 }}>
              {t("imm_metro_pct")}: <strong style={{ color: "var(--cyan)" }}>{data.map_layer.metro_operational_pct}%</strong>
              <br />
              {t("imm_traffic_lights")}: {data.map_layer.traffic_lights_active}
              <br />
              {t("imm_priority_lanes")}: {data.map_layer.priority_lanes_open}
              <br />
              {t("imm_landmarks")}: {data.map_layer.landmarks_loaded?.join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
