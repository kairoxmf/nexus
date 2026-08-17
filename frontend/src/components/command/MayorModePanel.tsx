import { useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import type { SimulationState } from "../../types";

const API = import.meta.env.VITE_API_URL ?? "";

type Props = {
  state: SimulationState;
  onDecision?: (choice: "a" | "b" | "c") => void;
};

const MAYOR_CHOICES = [
  {
    id: "a" as const,
    titleKey: "mayor_choice_hospital",
    impact: { health: +8, satisfaction: +12, cost: -15 },
  },
  {
    id: "b" as const,
    titleKey: "mayor_choice_bridge",
    impact: { health: +5, satisfaction: +6, cost: -8 },
  },
  {
    id: "c" as const,
    titleKey: "mayor_choice_evacuate",
    impact: { health: +10, satisfaction: -5, cost: -20 },
  },
];

export function MayorModePanel({ state, onDecision }: Props) {
  const { t } = useI18n();
  const [mediaPressure, setMediaPressure] = useState(62);
  const [satisfaction, setSatisfaction] = useState(58);
  const [selected, setSelected] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const resolve = async (choiceId: "a" | "b" | "c") => {
    setSelected(choiceId);
    setResolving(true);
    try {
      const apiChoice = choiceId === "c" ? "b" : choiceId;
      await fetch(`${API}/api/v1/creative/dilemma/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: apiChoice }),
      });
      const choice = MAYOR_CHOICES.find((c) => c.id === choiceId);
      if (choice) {
        setSatisfaction((s) => Math.min(100, s + choice.impact.satisfaction));
        setMediaPressure((p) => Math.max(0, p - 8));
      }
      onDecision?.(choiceId);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="cmd-mayor">
      <div className="section-title">{t("mayor_mode_title")}</div>
      <p className="hint">{t("mayor_mode_sub")}</p>

      <div className="cmd-mayor-stats">
        <div className="cmd-mayor-stat">
          <span>{t("city_health")}</span>
          <strong style={{ color: state.metrics.city_health >= 60 ? "var(--green)" : "var(--red)" }}>
            {Math.round(state.metrics.city_health)}%
          </strong>
        </div>
        <div className="cmd-mayor-stat">
          <span>{t("mayor_satisfaction")}</span>
          <strong style={{ color: "var(--cyan)" }}>{satisfaction}%</strong>
        </div>
        <div className="cmd-mayor-stat">
          <span>{t("mayor_media")}</span>
          <strong style={{ color: mediaPressure > 70 ? "var(--red)" : "var(--amber)" }}>{mediaPressure}%</strong>
        </div>
      </div>

      <div className="cmd-mayor-choices">
        {MAYOR_CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cmd-mayor-choice${selected === c.id ? " is-selected" : ""}`}
            onClick={() => resolve(c.id)}
            disabled={resolving}
          >
            <div className="cmd-mayor-choice-title">{t(c.titleKey)}</div>
            <div className="cmd-mayor-choice-impact">
              {t("mayor_health")} {c.impact.health > 0 ? "+" : ""}{c.impact.health}% ·{" "}
              {t("mayor_satisfaction")} {c.impact.satisfaction > 0 ? "+" : ""}{c.impact.satisfaction}%
            </div>
          </button>
        ))}
      </div>

      {state.creative?.ethical_dilemmas?.current && (
        <div className="cmd-mayor-dilemma hint">
          <Icon3D name="warning" size={14} color="var(--amber)" animated />
          {state.creative.ethical_dilemmas.current.question}
        </div>
      )}
    </div>
  );
}
