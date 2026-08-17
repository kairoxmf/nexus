import type { TimeMachineFuture } from "../types";
import { useI18n } from "../i18n";

type TimelinePoint = { hour: number; health: number };

export function TimeMachineChart({ futures }: { futures: TimeMachineFuture[] }) {
  const { t } = useI18n();
  if (futures.length < 2) return null;

  const maxHour = Math.max(
    ...futures.flatMap((f) => (f.timeline ?? []).map((p) => p.hour)),
    1,
  );

  return (
    <div className="adv-tm-chart">
      <div className="adv-tm-chart-title">{t("adv_tm_chart_title")}</div>
      {futures.map((f) => {
        const points = (f.timeline ?? []) as TimelinePoint[];
        const path = points
          .map((p, i) => {
            const x = (p.hour / maxHour) * 100;
            const y = 100 - p.health;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ");

        return (
          <div key={f.id} className="adv-tm-row">
            <span className="adv-tm-label">{f.label}</span>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="adv-tm-svg">
              <defs>
                <linearGradient id={`tm-${f.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4cc9f0" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#33c17a" stopOpacity="0.55" />
                </linearGradient>
              </defs>
              <path d={`${path} L 100 100 L 0 100 Z`} fill={`url(#tm-${f.id})`} />
              <path d={path} fill="none" stroke="#4cc9f0" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="adv-tm-meta">{f.recovery_hours}{t("adv_h_short")} · {f.infrastructure_recovery_pct}% {t("adv_infra")}</span>
          </div>
        );
      })}
    </div>
  );
}
