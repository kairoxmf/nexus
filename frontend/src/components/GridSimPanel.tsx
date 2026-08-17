import { useCallback, useEffect, useMemo, useState } from "react";
import { useGridCity } from "../context/GridCityContext";
import { useI18n } from "../i18n";
import type { GridSimulationState, ImpactMatrixRow } from "../types";
import { NexusModal } from "../ui/NexusModal";
import { BuildingEffectCard } from "./BuildingEffectCard";
import { GridCityCanvas } from "./GridCityCanvas";
import { GridBuildingIcon } from "./GridBuildingIcon";
import {
  BUILDING_PALETTE,
  METRIC_KEYS,
  buildOnGrid,
  exportGridJson,
  fetchGridState,
  fetchImpactMatrix,
  resetGrid,
  stepGrid,
} from "../lib/gridSimApi";

export function GridSimPanel() {
  const { t } = useI18n();
  const { setGridState } = useGridCity();
  const [state, setStateLocal] = useState<GridSimulationState | null>(null);
  const [matrix, setMatrix] = useState<ImpactMatrixRow[]>([]);
  const [selected, setSelected] = useState("=");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridModalOpen, setGridModalOpen] = useState(false);

  const selectedMeta = useMemo(
    () => BUILDING_PALETTE.find((b) => b.symbol === selected),
    [selected],
  );
  const selectedImpact = useMemo(
    () => matrix.find((row) => row.symbol === selected),
    [matrix, selected],
  );

  const applyState = useCallback(
    (next: GridSimulationState) => {
      setStateLocal(next);
      setGridState(next);
    },
    [setGridState],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [gridState, impact] = await Promise.all([fetchGridState(), fetchImpactMatrix()]);
      applyState(gridState);
      setMatrix(impact.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load grid");
    } finally {
      setLoading(false);
    }
  }, [applyState]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCellClick = async (x: number, y: number) => {
    if (!state) return;
    if (state.grid[x][y] !== ".") return;
    try {
      applyState(await buildOnGrid(x, y, selected));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Build failed");
    }
  };

  const handleStep = async () => {
    try {
      const result = await stepGrid();
      applyState(result.state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Step failed");
    }
  };

  const handleReset = async () => {
    try {
      applyState(await resetGrid());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    }
  };

  if (loading) return <div className="grid-panel-loading">{t("grid_loading")}</div>;
  if (error && !state) return <div className="grid-panel-error">{error}</div>;
  if (!state) return null;

  return (
    <div className="grid-sim-panel">
      <div className="grid-sim-toolbar">
        <div className="grid-sim-time">
          Y{state.year} M{state.month} D{state.day} · W{state.week} · T{state.ticks}/{state.max_ticks}
        </div>
        <div className="grid-sim-actions">
          <button type="button" className="btn-ghost" onClick={handleStep}>{t("grid_step")}</button>
          <button type="button" className="btn-ghost" onClick={handleReset}>{t("grid_reset")}</button>
          <button type="button" className="btn-ghost" onClick={exportGridJson}>{t("grid_export_json")}</button>
        </div>
      </div>

      <div className="grid-sim-metrics">
        {METRIC_KEYS.map((key) => (
          <div key={key} className="grid-metric-chip">
            <span>{t(`grid_metric_${key}`)}</span>
            <strong>{Math.round(state.metrics[key])}</strong>
          </div>
        ))}
        <div className="grid-metric-chip accent">
          <span>{t("grid_budget")}</span>
          <strong>${Math.round(state.budget)}</strong>
        </div>
        <div className="grid-metric-chip green">
          <span>{t("grid_environment")}</span>
          <strong>{Math.round(state.environment_score)}%</strong>
        </div>
        {state.solar_output > 0 && (
          <div className="grid-metric-chip solar">
            <span>{t("bld_solar")}</span>
            <strong>{state.solar_output} kW</strong>
          </div>
        )}
      </div>

      <div className="grid-expand-row">
        <button type="button" className="btn-primary grid-expand-btn" onClick={() => setGridModalOpen(true)}>
          {t("grid_open_map")}
        </button>
      </div>

      <BuildingEffectCard row={selectedImpact} color={selectedMeta?.color ?? "#243858"} />

      <div className="grid-sim-body compact">
        <div className="grid-palette">
          <div className="grid-palette-title">{t("grid_buildings")}</div>
          {BUILDING_PALETTE.map(({ symbol, color, i18nKey }) => (
            <button
              key={symbol}
              type="button"
              className={`grid-palette-btn ${selected === symbol ? "active" : ""}`}
              style={{ borderColor: color }}
              onClick={() => setSelected(symbol)}
            >
              <span className="grid-palette-icon" style={{ background: color }}>
                <GridBuildingIcon symbol={symbol} size={12} color="#04141c" />
              </span>
              <span>{t(i18nKey)}</span>
            </button>
          ))}
        </div>

        <div className="grid-preview-wrap">
          <GridCityCanvas state={state} selected={selected} onCellClick={handleCellClick} />
          <div className="grid-preview-hint">{t("grid_preview_hint")}</div>
        </div>
      </div>

      <div className="grid-population-row">
        👥 {state.population} {t("grid_citizens")} · 🏗 {state.placements.length} {t("grid_structures")}
      </div>

      {state.last_events.length > 0 && (
        <div className="grid-events">
          {state.last_events.map((ev) => (
            <div key={ev} className="grid-event">{ev}</div>
          ))}
        </div>
      )}

      {error && <div className="grid-panel-error">{error}</div>}

      <NexusModal
        open={gridModalOpen}
        onClose={() => setGridModalOpen(false)}
        title={t("grid_modal_title")}
        subtitle={t("grid_modal_sub")}
        wide
      >
        <div className="grid-modal-layout">
          <div className="grid-modal-palette">
            {BUILDING_PALETTE.map(({ symbol, color, i18nKey }) => (
              <button
                key={symbol}
                type="button"
                className={`grid-palette-btn large ${selected === symbol ? "active" : ""}`}
                style={{ borderColor: color }}
                onClick={() => setSelected(symbol)}
              >
                <span className="grid-palette-icon large" style={{ background: color }}>
                  <GridBuildingIcon symbol={symbol} size={20} color="#04141c" />
                </span>
                <span>{t(i18nKey)}</span>
              </button>
            ))}
          </div>
          <GridCityCanvas state={state} selected={selected} onCellClick={handleCellClick} large />
        </div>
        <p className="hint grid-modal-note">{t("grid_solar_hint")}</p>
      </NexusModal>
    </div>
  );
}
