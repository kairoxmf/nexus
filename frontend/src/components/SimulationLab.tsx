import { useCallback, useState } from "react";
import { useI18n } from "../i18n";
import type { SimulationState } from "../types";
import { WhatIfPanel } from "./WhatIfPanel";
import { CascadeGraph } from "./CascadeGraph";
import { ReplayReport } from "./ReplayReport";
import { GridSimPanel } from "./GridSimPanel";
import { OptimizationPanel } from "./OptimizationPanel";
import { RLPanel } from "./RLPanel";
import { AutoTrainPanel } from "./AutoTrainPanel";

interface Props {
  state: SimulationState;
}

type Tab = "whatif" | "cascade" | "report" | "grid" | "optimize" | "rl" | "autotrain";

export function SimulationLab({ state }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("grid");
  const [gridKey, setGridKey] = useState(0);
  const refreshGrid = useCallback(() => setGridKey((k) => k + 1), []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "grid", label: t("grid_tab") },
    { id: "optimize", label: t("grid_optimize_tab") },
    { id: "rl", label: t("grid_rl_tab") },
    { id: "autotrain", label: t("auto_train_tab") },
    { id: "whatif", label: t("what_if") },
    { id: "cascade", label: t("cascade") },
    { id: "report", label: t("report") },
  ];

  return (
    <div className="section simulation-lab">
      <div className="section-title">{t("simulation_lab")}</div>
      <div className="lab-tabs">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`lab-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "grid" && <GridSimPanel key={gridKey} />}
      {tab === "optimize" && <OptimizationPanel onApplied={refreshGrid} />}
      {tab === "rl" && <RLPanel onStep={refreshGrid} />}
      {tab === "autotrain" && <AutoTrainPanel />}
      {tab === "whatif" && <WhatIfPanel state={state} />}
      {tab === "cascade" && <CascadeGraph />}
      {tab === "report" && <ReplayReport />}
    </div>
  );
}
