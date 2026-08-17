import { useI18n } from "../i18n";
import type { Prediction } from "../types";

interface Props {
  predictions: Prediction[];
}

export function PredictionsPanel({ predictions }: Props) {
  const { t } = useI18n();
  if (predictions.length === 0) return null;

  return (
    <div className="section">
      <div className="section-title">{t("crisis_predictions")}</div>
      {predictions.slice(0, 5).map((p, i) => (
        <div key={i} className="prediction-card">
          <div>
            <span className="prob">{Math.round(p.probability * 100)}%</span>
            {" · "}{p.horizon_hours}h · {p.event_type.replace(/_/g, " ")}
          </div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>{p.description}</div>
        </div>
      ))}
    </div>
  );
}
