import { useMemo } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import type { SimulationState } from "../../types";

type TimelineEvent = {
  id: string;
  tick: number;
  type: "disaster" | "recovery" | "debate" | "agent" | "cinema" | "sos";
  label: string;
  icon: string;
};

type Props = {
  state: SimulationState;
  onSeekTick?: (tick: number) => void;
  onStartCinema?: () => void;
  onExportBriefing?: () => void;
};

export function CrisisTimeline({ state, onSeekTick, onStartCinema, onExportBriefing }: Props) {
  const { t } = useI18n();

  const events = useMemo<TimelineEvent[]>(() => {
    const list: TimelineEvent[] = [];

    if (state.active_disaster) {
      list.push({
        id: "disaster",
        tick: Math.max(0, state.tick - 5),
        type: "disaster",
        label: t("timeline_disaster").replace("{type}", state.active_disaster),
        icon: "warning",
      });
    }

    if (state.recovery_mode) {
      list.push({
        id: "recovery",
        tick: state.tick,
        type: "recovery",
        label: t("timeline_recovery"),
        icon: "check",
      });
    }

    if (state.last_debate) {
      list.push({
        id: "debate",
        tick: state.tick,
        type: "debate",
        label: t("timeline_debate"),
        icon: "dot",
      });
    }

    state.log.slice(-4).forEach((entry, i) => {
      list.push({
        id: `log-${i}`,
        tick: entry.tick ?? state.tick,
        type: "agent",
        label: entry.text.slice(0, 48),
        icon: "dot",
      });
    });

    const sos = state.creative?.sos_sync?.reports ?? [];
    sos.slice(-2).forEach((r, i) => {
      list.push({
        id: `sos-${i}`,
        tick: state.tick,
        type: "sos",
        label: t("timeline_sos").replace("{status}", r.status ?? "active"),
        icon: "warning",
      });
    });

    if (state.immersive?.cinema?.active) {
      list.push({
        id: "cinema",
        tick: state.tick,
        type: "cinema",
        label: t("timeline_cinema"),
        icon: "vr",
      });
    }

    return list.sort((a, b) => a.tick - b.tick);
  }, [state, t]);

  return (
    <div className="cmd-timeline">
      <div className="cmd-timeline-head">
        <span className="cmd-timeline-title">{t("timeline_title")}</span>
        <span className="cmd-timeline-tick">T+{state.tick}</span>
        <div className="cmd-timeline-actions">
          {onStartCinema && (
            <button type="button" className="btn-ghost btn-xs" onClick={onStartCinema}>
              <Icon3D name="vr" size={12} /> {t("timeline_cinema_btn")}
            </button>
          )}
          {onExportBriefing && (
            <button type="button" className="btn-ghost btn-xs" onClick={onExportBriefing}>
              {t("timeline_briefing_btn")}
            </button>
          )}
        </div>
      </div>
      <div className="cmd-timeline-track nx-scroll-sm">
        {events.length === 0 ? (
          <div className="hint">{t("timeline_empty")}</div>
        ) : (
          events.map((ev) => (
            <button
              key={ev.id}
              type="button"
              className={`cmd-timeline-event is-${ev.type}`}
              onClick={() => onSeekTick?.(ev.tick)}
              title={`T+${ev.tick}`}
            >
              <Icon3D name={ev.icon as "warning"} size={12} animated={ev.type === "disaster"} />
              <span className="cmd-timeline-event-tick">T+{ev.tick}</span>
              <span className="cmd-timeline-event-label">{ev.label}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
