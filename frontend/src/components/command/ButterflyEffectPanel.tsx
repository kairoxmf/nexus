import { useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import type { SimulationState } from "../../types";

const API = import.meta.env.VITE_API_URL ?? "";

type Props = {
  state: SimulationState;
};

export function ButterflyEffectPanel({ state }: Props) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const bf = state.creative?.butterfly_effect;

  const start = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/api/v1/creative/butterfly/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_a: t("butterfly_strategy_a"),
          strategy_b: t("butterfly_strategy_b"),
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cmd-butterfly">
      <div className="section-title">{t("butterfly_title")}</div>
      <p className="hint">{t("butterfly_sub")}</p>

      {!bf?.active ? (
        <button type="button" className="btn-primary" onClick={start} disabled={loading}>
          {loading ? <Icon3D name="loading" size={14} animated /> : t("butterfly_start")}
        </button>
      ) : (
        <div className="cmd-butterfly-universes">
          <div className="cmd-butterfly-universe">
            <div className="cmd-butterfly-label">{bf.universe_a?.strategy ?? t("butterfly_strategy_a")}</div>
            <div className="cmd-butterfly-health">
              {Math.round(bf.universe_a?.health ?? 0)}%
            </div>
            <div className="hint">{t("butterfly_lives")}: {bf.universe_a?.lives_saved ?? 0}</div>
          </div>
          <div className="cmd-butterfly-vs">VS</div>
          <div className="cmd-butterfly-universe">
            <div className="cmd-butterfly-label">{bf.universe_b?.strategy ?? t("butterfly_strategy_b")}</div>
            <div className="cmd-butterfly-health">
              {Math.round(bf.universe_b?.health ?? 0)}%
            </div>
            <div className="hint">{t("butterfly_lives")}: {bf.universe_b?.lives_saved ?? 0}</div>
          </div>
        </div>
      )}

      {bf?.active && bf.timeline_a && bf.timeline_b && (
        <div className="cmd-butterfly-timeline hint">
          {t("butterfly_elapsed")}: {bf.elapsed_minutes ?? 0}m
        </div>
      )}
    </div>
  );
}
