import { useCallback, useEffect, useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../i18n";
import type { SimulationState } from "../types";

const API = import.meta.env.VITE_API_URL ?? "";

interface Props {
  tick: number;
  onReplayState: (state: SimulationState | null) => void;
  liveState: SimulationState;
}

export function ReplayPanel({ tick, onReplayState }: Props) {
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/v1/replay/count`)
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => {});
  }, [tick]);

  const loadFrame = useCallback(async (i: number) => {
    if (i < 0) {
      onReplayState(null);
      return;
    }
    const res = await fetch(`${API}/api/v1/replay/${i}`);
    if (res.ok) {
      const data = await res.json();
      onReplayState(data as SimulationState);
    }
  }, [onReplayState]);

  useEffect(() => {
    if (!playing || count === 0) return;
    const start = index < 0 ? 0 : index;
    let i = start;
    const timer = setInterval(() => {
      i += 1;
      if (i >= count) {
        setPlaying(false);
        setIndex(-1);
        onReplayState(null);
        return;
      }
      setIndex(i);
      loadFrame(i);
    }, 600);
    return () => clearInterval(timer);
  }, [playing, count, loadFrame, onReplayState, index]);

  return (
    <div className="section">
      <div className="section-title">{t("crisis_replay")}</div>
      <div className="replay-controls">
        <button className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => { setPlaying(false); setIndex(-1); loadFrame(-1); }}>
          <Icon3D name="stop" size={14} /> {t("replay_live")}
        </button>
        <button className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setPlaying(!playing)}>
          <Icon3D name={playing ? "pause" : "play"} size={14} /> {playing ? t("replay_pause") : t("replay_play")}
        </button>
        <button
          className="btn-ghost"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          disabled={index <= 0}
          onClick={() => { const n = Math.max(0, index - 1); setIndex(n); loadFrame(n); }}
        >
          <Icon3D name="chevron-left" size={14} /> {t("replay_step_back")}
        </button>
        <button
          className="btn-ghost"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          disabled={index >= count - 1}
          onClick={() => { const n = Math.min(count - 1, index + 1); setIndex(n); loadFrame(n); }}
        >
          {t("replay_step_fwd")} <Icon3D name="chevron-right" size={14} />
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(0, count - 1)}
        value={Math.max(0, index)}
        onChange={(e) => {
          const n = Number(e.target.value);
          setIndex(n);
          setPlaying(false);
          loadFrame(n);
        }}
        style={{ width: "100%", marginTop: 8 }}
      />
      <div className="hint">
        {t("replay_frame")} {index < 0 ? count : index + 1} / {count}
        {index >= 0 && ` · ${t("replay_mode")}`}
      </div>
    </div>
  );
}
