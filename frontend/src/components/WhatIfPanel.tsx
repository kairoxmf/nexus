import { useState } from "react";
import { translateScenario, useI18n } from "../i18n";
import type { SimulationState } from "../types";

const API = import.meta.env.VITE_API_URL ?? "";

const SCENARIOS = ["bridge_collapse", "double_rainfall", "grid_surge", "hospital_overload"];

interface Props {
  state: SimulationState;
}

export function WhatIfPanel({ state }: Props) {
  const { t, locale } = useI18n();
  const [scenario, setScenario] = useState("bridge_collapse");
  const [nodeId, setNodeId] = useState(state.nodes[0]?.id ?? "");
  const [mult, setMult] = useState(1);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/v1/simulation/what-if`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, node_id: nodeId, magnitude_multiplier: mult }),
      });
      if (!r.ok) {
        const err = await r.text();
        setResult({ error: err || "Request failed" });
        return;
      }
      setResult(await r.json());
    } catch {
      setResult({ error: "Failed to run scenario" });
    } finally {
      setLoading(false);
    }
  };

  const projectedHealth = result?.projected_city_health as number | undefined;

  return (
    <div className="lab-panel">
      <label className="field">{t("whatif_scenario")}</label>
      <select value={scenario} onChange={(e) => setScenario(e.target.value)}>
        {SCENARIOS.map((id) => (
          <option key={id} value={id}>{translateScenario(locale, id)}</option>
        ))}
      </select>

      <label className="field">{t("whatif_target_node")}</label>
      <select value={nodeId} onChange={(e) => setNodeId(e.target.value)}>
        {state.nodes.map((n) => (
          <option key={n.id} value={n.id}>{n.name}</option>
        ))}
      </select>

      <label className="field">{t("whatif_magnitude_mult")} × <span className="range-val">{mult.toFixed(1)}</span></label>
      <input type="range" min={0.5} max={3} step={0.1} value={mult} onChange={(e) => setMult(Number(e.target.value))} />

      <button className="btn-primary" onClick={run} disabled={loading}>
        {loading ? t("whatif_simulating") : t("whatif_run")}
      </button>

      {result && !result.error && (
        <div className="lab-result">
          <div className="hint" style={{ marginTop: 10 }}>
            <strong>{t("whatif_recommendation")}:</strong> {String(result.recommendation ?? "")}
          </div>
          {projectedHealth != null && (
            <div style={{ fontSize: 10, marginTop: 8 }}>
              {t("whatif_projected_health")}: <strong style={{ color: "var(--cyan)" }}>{projectedHealth.toFixed(1)}%</strong>
              {" · "}{t("whatif_impact_delta")} {String(result.impact_delta ?? "")}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
