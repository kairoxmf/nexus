import { useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import type { SimulationState } from "../../types";

const API = import.meta.env.VITE_API_URL ?? "";

type Props = {
  state: SimulationState;
};

export function SOSDispatchPanel({ state }: Props) {
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);
  const [lastMsg, setLastMsg] = useState<string | null>(null);

  const reports = state.creative?.sos_sync?.reports ?? [];

  const dispatch = async (sosId: string, unitType: string) => {
    setLoading(sosId);
    setLastMsg(null);
    try {
      const r = await fetch(`${API}/api/v1/creative/sos/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sos_id: sosId, unit_type: unitType, message: t("sos_dispatch_msg") }),
      });
      const d = (await r.json()) as { ok?: boolean; report?: { eta_minutes?: number } };
      if (d.ok) {
        setLastMsg(t("sos_dispatch_ok").replace("{eta}", String(d.report?.eta_minutes ?? 5)));
      } else {
        setLastMsg(t("sos_dispatch_fail"));
      }
    } catch {
      setLastMsg(t("sos_dispatch_fail"));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="cmd-sos">
      <div className="section-title">{t("sos_dispatch_title")}</div>
      <p className="hint">{t("sos_dispatch_sub")}</p>
      {lastMsg && <div className="hint" style={{ color: "var(--cyan)" }}>{lastMsg}</div>}
      {reports.length === 0 ? (
        <div className="hint">{t("sos_dispatch_empty")}</div>
      ) : (
        <div className="cmd-sos-list">
          {reports.map((r) => (
            <div key={r.id} className="cmd-sos-item">
              <div>
                <strong>SOS #{r.id}</strong>
                <div className="hint">{r.message?.slice(0, 60) ?? "—"}</div>
                <div className="hint">{r.status} · ETA {r.eta_minutes ?? "?"}m</div>
              </div>
              <div className="cmd-sos-actions">
                <button
                  type="button"
                  className="btn-primary btn-xs"
                  disabled={loading === r.id || r.status === "resolved"}
                  onClick={() => dispatch(r.id, "ambulance")}
                >
                  {loading === r.id ? <Icon3D name="loading" size={12} animated /> : t("sos_unit_ambulance")}
                </button>
                <button
                  type="button"
                  className="btn-ghost btn-xs"
                  disabled={loading === r.id}
                  onClick={() => dispatch(r.id, "fire_truck")}
                >
                  {t("sos_unit_fire")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
