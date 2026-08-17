import { useI18n } from "../i18n";
import type { ImpactMatrixRow } from "../types";
import { METRIC_KEYS } from "../lib/gridSimApi";

export function ImpactMatrixTable({ rows }: { rows: ImpactMatrixRow[] }) {
  const { t } = useI18n();

  return (
    <div className="grid-impact-scroll">
      <table className="impact-matrix-table">
        <thead>
          <tr>
            <th>{t("grid_building")}</th>
            {METRIC_KEYS.map((k) => (
              <th key={k}>{t(`grid_metric_${k}`)} ↑</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.symbol}>
              <td>{row.building}</td>
              {METRIC_KEYS.map((k) => (
                <td key={k} className={row[k] > 0 ? "pos" : row[k] < 0 ? "neg" : "zero"}>
                  {row[k] > 0 ? `+${row[k]}` : row[k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
