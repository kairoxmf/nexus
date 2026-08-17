import { useI18n } from "../i18n";
import type { ImpactMatrixRow } from "../types";
import { METRIC_KEYS } from "../lib/gridSimApi";
import { BUILDING_I18N_KEYS } from "../lib/gridMapVisuals";
import { GridBuildingIcon } from "./GridBuildingIcon";

interface Props {
  row: ImpactMatrixRow | undefined;
  color: string;
}

export function BuildingEffectCard({ row, color }: Props) {
  const { t } = useI18n();

  if (!row) return null;

  return (
    <div className="building-effect-card" style={{ borderColor: color }}>
      <div className="building-effect-header">
        <span className="building-effect-icon" style={{ background: color }}>
          <GridBuildingIcon symbol={row.symbol} size={18} color="#04141c" />
        </span>
        <div>
          <div className="building-effect-name">{t(BUILDING_I18N_KEYS[row.symbol] ?? "bld_unknown")}</div>
          <div className="building-effect-hint">{t("grid_build_hint")}</div>
        </div>
      </div>
      <div className="building-effect-metrics">
        {METRIC_KEYS.map((key) => {
          const val = row[key];
          const cls = val > 0 ? "pos" : val < 0 ? "neg" : "zero";
          return (
            <div key={key} className={`building-effect-chip ${cls}`}>
              <span>{t(`grid_metric_${key}`)}</span>
              <strong>{val > 0 ? `+${val}` : val}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
