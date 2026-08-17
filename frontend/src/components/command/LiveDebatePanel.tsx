import { useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import type { SimulationState } from "../../types";

const API = import.meta.env.VITE_API_URL ?? "";

type Props = {
  state: SimulationState;
  compact?: boolean;
};

export function LiveDebatePanel({ state, compact = false }: Props) {
  const { t, locale } = useI18n();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);

  const agents = [
    { id: "power", label: t("agent_power"), color: "#f4a100" },
    { id: "medical", label: t("agent_medical"), color: "#ff4655" },
    { id: "transport", label: t("agent_transportation"), color: "#6c7ce0" },
    { id: "mayor", label: t("mayor"), color: "#4cc9f0" },
  ];

  const startDebate = async (question?: string) => {
    const msg =
      question ?? (topic.trim() || t("debate_default_question"));
    if (loading) return;
    setLoading(true);
    setResponse(null);
    try {
      const r = await fetch(`${API}/api/v1/ai/debate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "debate",
          message: msg,
          locale,
          context: {
            tick: state.tick,
            city_health: state.metrics.city_health,
            active_disaster: state.active_disaster,
            recovery_mode: state.recovery_mode,
          },
        }),
      });
      const d = (await r.json()) as { response?: string; provider?: string };
      setResponse(d.response ?? t("copilot_unavailable"));
      setProvider(d.provider ?? null);
    } catch {
      setResponse(t("copilot_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`cmd-debate${compact ? " is-compact" : ""}`}>
      <div className="section-title">{t("debate_live_title")}</div>
      <div className="cmd-debate-agents">
        {agents.map((a) => (
          <span key={a.id} className="cmd-debate-agent" style={{ borderColor: a.color }}>
            <Icon3D name="dot" size={10} color={a.color} animated />
            {a.label}
          </span>
        ))}
      </div>

      {state.last_debate && (
        <div className="cmd-debate-last hint">
          <strong>{t("decision")}:</strong> {state.last_debate.decision}
          <br />
          <strong>{t("confidence")}:</strong> {Math.round(state.last_debate.confidence * 100)}%
        </div>
      )}

      <div className="cmd-debate-suggestions">
        {[t("debate_q1"), t("debate_q2"), t("debate_q3")].map((q) => (
          <button key={q} type="button" className="btn-ghost btn-xs" onClick={() => startDebate(q)} disabled={loading}>
            {q}
          </button>
        ))}
      </div>

      <textarea
        className="cmd-debate-input"
        rows={2}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder={t("debate_placeholder")}
      />
      <button type="button" className="btn-primary" onClick={() => startDebate()} disabled={loading}>
        {loading ? <Icon3D name="loading" size={14} animated /> : t("debate_start")}
      </button>

      {response && (
        <div className="cmd-debate-response nx-scroll-sm">
          {provider && <div className="hint">{provider}</div>}
          {response}
        </div>
      )}
    </div>
  );
}
