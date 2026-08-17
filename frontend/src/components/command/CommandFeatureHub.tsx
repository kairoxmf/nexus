import { useEffect, useState } from "react";
import { Icon3D } from "@shared/icons";
import { useI18n } from "../../i18n";
import type { SimulationState } from "../../types";
import { CrisisTimeline } from "./CrisisTimeline";
import { LiveDebatePanel } from "./LiveDebatePanel";
import { MayorModePanel } from "./MayorModePanel";
import { ScenarioLibrary } from "./ScenarioLibrary";
import { SOSDispatchPanel } from "./SOSDispatchPanel";
import { CrisisCinemaDirector } from "./CrisisCinemaDirector";
import { ButterflyEffectPanel } from "./ButterflyEffectPanel";
import { WarRoomPanel } from "./WarRoomPanel";
import { TehranCrisisMode } from "./TehranCrisisMode";
import { launchFullDemo, launchGuidedDemo, launchVoiceDemo } from "./CommandDemoBoot";

const API = import.meta.env.VITE_API_URL ?? "";

export type CommandFeatureTab =
  | "timeline"
  | "debate"
  | "mayor"
  | "scenarios"
  | "sos"
  | "cinema"
  | "butterfly"
  | "warroom"
  | "tehran";

type Props = {
  state: SimulationState;
  activeCityId: string;
  mayorMode: boolean;
  activeTab?: CommandFeatureTab;
  onCityChange: (cityId: string) => void;
  onMayorModeToggle: (on: boolean) => void;
  onSeekTick?: (tick: number) => void;
  onScenarioRun?: (cityId: string) => void;
  onOpenTab?: (tab: CommandFeatureTab) => void;
};

const TABS: { id: CommandFeatureTab; icon: string; labelKey: string }[] = [
  { id: "timeline", icon: "dot", labelKey: "feat_timeline" },
  { id: "debate", icon: "dot", labelKey: "feat_debate" },
  { id: "mayor", icon: "dot", labelKey: "feat_mayor" },
  { id: "scenarios", icon: "warning", labelKey: "feat_scenarios" },
  { id: "sos", icon: "warning", labelKey: "feat_sos" },
  { id: "cinema", icon: "vr", labelKey: "feat_cinema" },
  { id: "butterfly", icon: "dot", labelKey: "feat_butterfly" },
  { id: "warroom", icon: "dot", labelKey: "feat_warroom" },
  { id: "tehran", icon: "warning", labelKey: "feat_tehran" },
];

export function CommandFeatureHub({
  state,
  activeCityId,
  mayorMode,
  activeTab,
  onCityChange,
  onMayorModeToggle,
  onSeekTick,
  onScenarioRun,
  onOpenTab,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<CommandFeatureTab>("timeline");

  useEffect(() => {
    if (!activeTab) return;
    setTab(activeTab);
    setOpen(true);
  }, [activeTab]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const next = (ev as CustomEvent<{ tab?: CommandFeatureTab }>).detail?.tab;
      if (!next) return;
      setTab(next);
      setOpen(true);
      onOpenTab?.(next);
      if (next === "mayor") onMayorModeToggle(true);
    };
    window.addEventListener("nexus-command-feature", handler);
    return () => window.removeEventListener("nexus-command-feature", handler);
  }, [onOpenTab, onMayorModeToggle]);

  const selectTab = (id: CommandFeatureTab) => {
    setTab(id);
    setOpen(true);
    onOpenTab?.(id);
    if (id === "mayor") onMayorModeToggle(true);
  };

  const startCinema = async () => {
    selectTab("cinema");
    await fetch(`${API}/api/v1/immersive/cinema/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: "en" }),
    });
  };

  const exportBriefing = async () => {
    const r = await fetch(`${API}/api/v1/ai/briefing/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "pdf" }),
    });
    if (r.ok) {
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nexus-briefing.pdf";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`cmd-feature-hub${open ? " is-open" : ""}`}>
      <div className="cmd-feature-tabs">
        <button
          type="button"
          className="cmd-feature-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <Icon3D name={open ? "chevron-right" : "chevron-left"} size={14} />
          {t("feat_menu")}
        </button>
        <button
          type="button"
          className="cmd-feature-tab cmd-feature-demo-btn cmd-feature-voice-btn"
          onClick={() => {
            setOpen(true);
            launchVoiceDemo();
          }}
          title={t("feat_voice_demo_sub")}
        >
          <Icon3D name="mic" size={14} animated color="#4cc9f0" />
          <span>{t("feat_voice_demo")}</span>
        </button>
        <button
          type="button"
          className="cmd-feature-tab cmd-feature-demo-btn"
          onClick={() => {
            setOpen(true);
            launchGuidedDemo();
          }}
          title={t("feat_guided_demo_sub")}
        >
          <Icon3D name="dot" size={14} animated color="#33c17a" />
          <span>{t("feat_guided_demo")}</span>
        </button>
        <button
          type="button"
          className="cmd-feature-tab cmd-feature-demo-btn"
          onClick={() => {
            setOpen(true);
            launchFullDemo();
          }}
          title={t("feat_full_demo_sub")}
        >
          <Icon3D name="vr" size={14} animated color="#f4a100" />
          <span>{t("feat_full_demo")}</span>
        </button>
        {TABS.map((tb) => (
          <button
            key={tb.id}
            type="button"
            className={`cmd-feature-tab${tab === tb.id && open ? " is-active" : ""}`}
            onClick={() => selectTab(tb.id)}
            title={t(tb.labelKey)}
          >
            <Icon3D name={tb.icon as "dot"} size={14} animated={tb.id === "sos" && (state.creative?.sos_sync?.active_count ?? 0) > 0} />
            <span>{t(tb.labelKey)}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="cmd-feature-panel nx-scroll-sm nx-scroll-glow">
          {tab === "timeline" && (
            <CrisisTimeline
              state={state}
              onSeekTick={onSeekTick}
              onStartCinema={startCinema}
              onExportBriefing={exportBriefing}
            />
          )}
          {tab === "debate" && <LiveDebatePanel state={state} compact />}
          {tab === "mayor" && (
            <>
              <label className="cmd-mayor-toggle">
                <input
                  type="checkbox"
                  checked={mayorMode}
                  onChange={(e) => onMayorModeToggle(e.target.checked)}
                />
                {t("mayor_mode_enabled")}
              </label>
              <MayorModePanel state={state} />
            </>
          )}
          {tab === "scenarios" && (
            <ScenarioLibrary onScenarioRun={(cityId) => onScenarioRun?.(cityId)} />
          )}
          {tab === "sos" && <SOSDispatchPanel state={state} />}
          {tab === "cinema" && <CrisisCinemaDirector state={state} />}
          {tab === "butterfly" && <ButterflyEffectPanel state={state} />}
          {tab === "warroom" && <WarRoomPanel state={state} />}
          {tab === "tehran" && (
            <TehranCrisisMode
              activeCityId={activeCityId}
              onCityChange={onCityChange}
              onRunTehranScenario={() => onScenarioRun?.("teh")}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** Sync parent state when robot / voice opens a feature tab. */
export function installCommandFeatureBridge(openTab: (tab: CommandFeatureTab) => void) {
  const handler = (ev: Event) => {
    const tab = (ev as CustomEvent<{ tab?: CommandFeatureTab }>).detail?.tab;
    if (tab) openTab(tab);
  };
  window.addEventListener("nexus-command-feature", handler);
  return () => window.removeEventListener("nexus-command-feature", handler);
}
