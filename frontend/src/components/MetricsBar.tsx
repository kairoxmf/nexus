import { useI18n } from "../i18n";
import type { DashboardMetrics } from "../types";

function healthColor(h: number): string {
  if (h >= 70) return "#33C17A";
  if (h >= 40) return "#F4A100";
  return "#FF4655";
}

interface Props {
  metrics: DashboardMetrics;
}

export function MetricsBar({ metrics }: Props) {
  const { t } = useI18n();
  const cats = [
    { label: t("city_health"), val: metrics.city_health },
    { label: t("metric_power_grid"), val: metrics.power_grid },
    { label: t("metric_water_network"), val: metrics.water_network },
    { label: t("metric_healthcare"), val: metrics.healthcare },
    { label: t("metric_safety"), val: metrics.safety },
    { label: t("metric_transport"), val: metrics.transport },
    { label: t("metric_housing"), val: metrics.housing },
  ];

  return (
    <div className="dash">
      {cats.map((c) => (
        <div className="dash-cell" key={c.label}>
          <div className="label">{c.label}</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${c.val}%`, background: healthColor(c.val) }}
            />
          </div>
          <div className="num" style={{ color: healthColor(c.val) }}>
            {c.val}%
          </div>
        </div>
      ))}
    </div>
  );
}
