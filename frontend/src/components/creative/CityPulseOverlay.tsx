import { Icon3D } from "@shared/icons";
import type { CreativeModulesState } from "../../types";

export function CityPulseOverlay({ pulse }: { pulse?: CreativeModulesState["city_pulse"] }) {
  if (!pulse) return null;

  const levelColor =
    pulse.ambient_level === "calm" ? "var(--green)"
    : pulse.ambient_level === "tense" ? "var(--amber)"
    : pulse.ambient_level === "critical" ? "#ff8800"
    : "var(--red)";

  return (
    <div className="city-pulse-overlay" style={{ "--pulse-glow": pulse.glow_intensity } as React.CSSProperties}>
      <div className="city-pulse-badge" style={{ borderColor: levelColor }}>
        <Icon3D name="heart" size={18} animated color={levelColor} />
        <span>{pulse.heartbeat_bpm} BPM</span>
        <span className="city-pulse-level">{pulse.ambient_level.toUpperCase()}</span>
      </div>
    </div>
  );
}
