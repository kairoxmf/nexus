import { useState } from "react";
import ReactECharts from "echarts-for-react";
import { useI18n } from "../i18n";
import type { GridOptimizeResult } from "../types";
import { NexusModal } from "../ui/NexusModal";
import { METRIC_KEYS, applyPlan, runOptimization } from "../lib/gridSimApi";
import { useGridCity } from "../context/GridCityContext";

interface Props {
  onApplied?: () => void;
}

export function OptimizationPanel({ onApplied }: Props) {
  const { t } = useI18n();
  const { setGridState } = useGridCity();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<GridOptimizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      setResult(await runOptimization({ population_size: 40, generations: 25 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimization failed");
    } finally {
      setRunning(false);
    }
  };

  const handleApply = async (plan: Record<string, number>) => {
    try {
      const state = await applyPlan(plan);
      setGridState(state);
      onApplied?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Apply failed");
    }
  };

  const chartOption = result?.pareto_front?.length
    ? {
        backgroundColor: "transparent",
        grid: { left: 48, right: 24, top: 32, bottom: 40 },
        tooltip: { trigger: "item" },
        xAxis: { type: "value", name: t("grid_metric_survival"), axisLabel: { color: "#8aa0b4", fontSize: 12 } },
        yAxis: { type: "value", name: t("grid_metric_satisfaction"), axisLabel: { color: "#8aa0b4", fontSize: 12 } },
        series: [
          {
            type: "scatter",
            symbolSize: 16,
            data: result.pareto_front.map((s) => [s.metrics.survival, s.metrics.satisfaction, s.score]),
            itemStyle: { color: "#4cc9f0" },
          },
        ],
      }
    : null;

  return (
    <div className="optimize-panel">
      <p className="hint">{t("grid_optimize_desc")}</p>
      <button type="button" className="btn-primary" disabled={running} onClick={handleRun}>
        {running ? t("grid_optimize_running") : t("grid_optimize_run")}
      </button>
      {error && <div className="grid-panel-error">{error}</div>}

      {result?.best && (
        <div className="optimize-best">
          <div className="optimize-best-title">{t("grid_best_plan")} · NSGA-II</div>
          <div className="optimize-metrics">
            {METRIC_KEYS.map((k) => (
              <span key={k}>{t(`grid_metric_${k}`)}: {Math.round(result.best!.metrics[k])}</span>
            ))}
          </div>
          <div className="grid-expand-row">
            <button type="button" className="btn-ghost" onClick={() => handleApply(result.best!.plan)}>
              {t("grid_apply_plan")}
            </button>
            {chartOption && (
              <button type="button" className="btn-primary" onClick={() => setChartOpen(true)}>
                {t("grid_open_chart")}
              </button>
            )}
          </div>
        </div>
      )}

      {result?.pareto_front && (
        <div className="optimize-solutions">
          {result.pareto_front.slice(0, 4).map((sol, i) => (
            <div key={i} className="optimize-solution-card">
              <strong>#{i + 1}</strong> score {sol.score}
              <button type="button" className="btn-ghost" onClick={() => handleApply(sol.plan)}>
                {t("grid_apply_plan")}
              </button>
            </div>
          ))}
        </div>
      )}

      <NexusModal
        open={chartOpen}
        onClose={() => setChartOpen(false)}
        title={t("grid_pareto_front")}
        subtitle="NSGA-II"
        wide
      >
        {chartOption && <ReactECharts option={chartOption} style={{ height: 420, width: "100%" }} />}
      </NexusModal>
    </div>
  );
}
