import { useEffect, useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import { useNexus } from "../../context/NexusContext";
import type { SimulationState } from "../../types";

type Props = {
  state: SimulationState;
};

export function CrisisCinemaDirector({ state }: Props) {
  const { t, locale } = useI18n();
  const { immersivePost, actionBusy, actionError } = useNexus();
  const [running, setRunning] = useState(false);
  const cinema = state.immersive?.cinema;
  const active = cinema?.active ?? false;
  const shots = cinema?.shots ?? [];
  const progress = cinema?.progress_pct ?? 0;

  useEffect(() => {
    setRunning(active);
  }, [active]);

  const start = async () => {
    const data = await immersivePost("cinema/start", { locale });
    if (data?.state?.immersive?.cinema?.active) {
      setRunning(true);
    } else {
      setRunning(false);
    }
  };

  const stop = async () => {
    const data = await immersivePost("cinema/stop");
    if (data) setRunning(false);
  };

  const shotIndex =
    shots.length === 0
      ? 0
      : Math.min(shots.length - 1, Math.floor((progress / 100) * shots.length));
  const currentShot = shots[shotIndex];

  return (
    <div className="cmd-cinema">
      <div className="section-title">{t("cinema_director_title")}</div>
      <p className="hint">{t("cinema_director_sub")}</p>

      <div className="cmd-cinema-progress">
        <div className="cmd-cinema-bar">
          <div className="cmd-cinema-fill" style={{ width: `${progress}%` }} />
        </div>
        <span>{Math.round(progress)}%</span>
      </div>

      {currentShot ? (
        <div className="cmd-cinema-shot">
          <Icon3D name="vr" size={16} animated color="#4cc9f0" />
          <div>
            <div>{currentShot.subtitle}</div>
            <div className="hint">{currentShot.camera} · {currentShot.duration_sec}s</div>
          </div>
        </div>
      ) : (
        <div className="hint">{t("imm_cinema_idle")}</div>
      )}

      {actionError && <div className="hint" style={{ color: "var(--red)" }}>{actionError}</div>}

      <div className="cmd-cinema-actions">
        {!running ? (
          <button type="button" className="btn-primary" onClick={start} disabled={actionBusy}>
            {t("cinema_start")}
          </button>
        ) : (
          <button type="button" className="btn-ghost" onClick={stop} disabled={actionBusy}>
            {t("cinema_stop")}
          </button>
        )}
      </div>
    </div>
  );
}
