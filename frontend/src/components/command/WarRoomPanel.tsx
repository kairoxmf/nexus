import { useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import type { SimulationState } from "../../types";
import { useVisualWowOptional } from "../../context/VisualWowContext";

const API = import.meta.env.VITE_API_URL ?? "";

const ROLES = [
  { id: "mayor", labelKey: "warroom_mayor", focusKey: "warroom_mayor_focus" },
  { id: "fema", labelKey: "warroom_fema", focusKey: "warroom_fema_focus" },
  { id: "media", labelKey: "warroom_media", focusKey: "warroom_media_focus" },
] as const;

type Props = {
  state: SimulationState;
};

export function WarRoomPanel({ state }: Props) {
  const { t } = useI18n();
  const wow = useVisualWowOptional();
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("mayor");
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);

  const warRoom = state.creative?.war_room;

  const start = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/api/v1/creative/war-room/start`, { method: "POST" });
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!decision.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/v1/creative/war-room/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, decision: decision.trim() }),
      });
      setDecision("");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLES.find((r) => r.id === role)!;

  return (
    <div className="cmd-warroom">
      <div className="section-title">{t("warroom_title")}</div>
      <p className="hint">{t("warroom_sub")}</p>

      {!warRoom?.active ? (
        <button type="button" className="btn-primary" onClick={start} disabled={loading}>
          {t("warroom_start")}
        </button>
      ) : (
        <>
          <div className="cmd-warroom-roles">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`cmd-warroom-role${role === r.id ? " is-active" : ""}`}
                onClick={() => {
                  setRole(r.id);
                  wow?.setAnnotationRole(r.id);
                }}
              >
                {t(r.labelKey)}
              </button>
            ))}
          </div>
          <div className="hint">{t(activeRole.focusKey)}</div>
          <textarea
            className="cmd-debate-input"
            rows={2}
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder={t("warroom_decision_ph")}
          />
          <button type="button" className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? <Icon3D name="loading" size={14} animated /> : t("warroom_submit")}
          </button>

          {(warRoom.decisions ?? []).slice(-3).map((d, i) => (
            <div key={i} className="cmd-warroom-decision hint">
              <strong>{d.role}:</strong> {d.action}
            </div>
          ))}

          {warRoom.conflicts > 0 && (
            <div className="cmd-warroom-conflict">
              <Icon3D name="warning" size={12} color="var(--amber)" animated />
              {t("warroom_conflicts").replace("{n}", String(warRoom.conflicts))}
            </div>
          )}

          {wow && wow.toggles.mapAnnotation && (
            <div className="cmd-warroom-annotation">
              <p className="hint">{t("wow_annotation_warroom_hint")}</p>
              <button
                type="button"
                className={`btn-ghost btn-xs${wow.annotationMode ? " active" : ""}`}
                onClick={() => {
                  wow.setAnnotationRole(role);
                  wow.setAnnotationMode(!wow.annotationMode);
                }}
              >
                {wow.annotationMode ? t("wow_annotation_cancel") : t("wow_annotation_draw")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
