import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { translateStrategy, useI18n } from "../i18n";
import type { SimulationState } from "../types";

const API = import.meta.env.VITE_API_URL ?? "";

interface StrategyResult {
  strategy: string;
  label: string;
  projected_recovery: number;
  lives_saved_index: number;
  economic_cost_index: number;
  time_to_recovery_hours: number;
}

interface Props {
  state: SimulationState;
}

export function StrategyPanel({ state }: Props) {
  const { t, locale } = useI18n();
  const [strategies, setStrategies] = useState<StrategyResult[]>([]);
  const [currentHealth, setCurrentHealth] = useState(state.metrics.city_health);

  useEffect(() => {
    fetch(`${API}/api/v1/strategy/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((d) => {
        setStrategies(d.strategies ?? []);
        setCurrentHealth(d.current_health ?? state.metrics.city_health);
      })
      .catch(() => {});
  }, [state.tick, state.metrics.city_health]);

  const option = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    legend: {
      data: [t("chart_recovery"), t("chart_lives_saved"), t("chart_cost")],
      textStyle: { color: "#6b7688", fontSize: 9 },
      top: 0,
    },
    grid: { left: 40, right: 10, top: 40, bottom: 30 },
    xAxis: {
      type: "category",
      data: strategies.map((s) => translateStrategy(locale, s.strategy).split(" ")[0]),
      axisLabel: { color: "#6b7688", fontSize: 8, rotate: 20 },
      axisLine: { lineStyle: { color: "#1c2532" } },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: "#6b7688", fontSize: 9 },
      splitLine: { lineStyle: { color: "#1c2532" } },
    },
    series: [
      {
        name: t("chart_recovery"),
        type: "bar",
        data: strategies.map((s) => s.projected_recovery),
        itemStyle: { color: "#4cc9f0" },
      },
      {
        name: t("chart_lives_saved"),
        type: "bar",
        data: strategies.map((s) => s.lives_saved_index),
        itemStyle: { color: "#33c17a" },
      },
      {
        name: t("chart_cost"),
        type: "bar",
        data: strategies.map((s) => s.economic_cost_index),
        itemStyle: { color: "#f4a100" },
      },
    ],
  }), [strategies, t, locale]);

  if (strategies.length === 0) return null;

  return (
    <div className="section">
      <div className="section-title">{t("strategy_comparison")}</div>
      <div className="hint" style={{ marginBottom: 8 }}>
        {t("strategy_current_health")}: <strong style={{ color: "var(--cyan)" }}>{currentHealth}%</strong>
      </div>
      <ReactECharts option={option} style={{ height: 180, width: "100%" }} opts={{ renderer: "svg" }} />
    </div>
  );
}
