import { useState } from "react";
import ReactECharts from "echarts-for-react";
import { useI18n } from "../i18n";
import type { RLTrainResult } from "../types";
import { NexusModal } from "../ui/NexusModal";
import { rlStep, trainRL } from "../lib/gridSimApi";
import { useGridCity } from "../context/GridCityContext";

interface Props {
  onStep?: () => void;
}

function RewardChart({ data, title }: { data: RLTrainResult; title: string }) {
  const option = {
    backgroundColor: "transparent",
    grid: { left: 40, right: 16, top: 28, bottom: 32 },
    xAxis: { type: "category", data: data.episode_rewards.map((_, i) => `${i + 1}`), axisLabel: { color: "#8aa0b4" } },
    yAxis: { type: "value", axisLabel: { color: "#8aa0b4" } },
    series: [{ type: "line", smooth: true, data: data.episode_rewards, lineStyle: { color: "#4cc9f0" }, areaStyle: { opacity: 0.15 } }],
    title: { text: title, textStyle: { color: "#8aa0b4", fontSize: 12 } },
  };
  return <ReactECharts option={option} style={{ height: 280, width: "100%" }} />;
}

export function RLPanel({ onStep }: Props) {
  const { t } = useI18n();
  const { setGridState } = useGridCity();
  const [training, setTraining] = useState(false);
  const [qResult, setQResult] = useState<RLTrainResult | null>(null);
  const [ppoResult, setPpoResult] = useState<RLTrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  const handleTrain = async () => {
    setTraining(true);
    setError(null);
    try {
      const res = await trainRL("both", 5);
      if (res.q_learning) setQResult(res.q_learning);
      if (res.ppo) setPpoResult(res.ppo);
      setChartOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Training failed");
    } finally {
      setTraining(false);
    }
  };

  const handleStep = async (algo: "q_learning" | "ppo") => {
    try {
      const state = await rlStep(algo);
      setGridState(state);
      onStep?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "RL step failed");
    }
  };

  return (
    <div className="rl-panel">
      <p className="hint">{t("grid_rl_desc")}</p>
      <div className="rl-actions">
        <button type="button" className="btn-primary" disabled={training} onClick={handleTrain}>
          {training ? t("grid_rl_training") : t("grid_rl_train")}
        </button>
        <button type="button" className="btn-ghost" onClick={() => handleStep("q_learning")}>
          Q-Learning {t("grid_step")}
        </button>
        <button type="button" className="btn-ghost" onClick={() => handleStep("ppo")}>
          PPO {t("grid_step")}
        </button>
        {(qResult || ppoResult) && (
          <button type="button" className="btn-ghost" onClick={() => setChartOpen(true)}>
            {t("grid_open_chart")}
          </button>
        )}
      </div>
      {error && <div className="grid-panel-error">{error}</div>}

      {qResult && (
        <div className="rl-result">
          Q-Learning · avg {qResult.avg_reward} · {qResult.q_states_learned} states
        </div>
      )}
      {ppoResult && (
        <div className="rl-result">PPO · avg {ppoResult.avg_reward}</div>
      )}

      <NexusModal
        open={chartOpen}
        onClose={() => setChartOpen(false)}
        title={t("grid_rl_chart_title")}
        subtitle={t("grid_rl_tab")}
        wide
      >
        {qResult && <RewardChart data={qResult} title="Q-Learning" />}
        {ppoResult && <RewardChart data={ppoResult} title="PPO" />}
      </NexusModal>
    </div>
  );
}
