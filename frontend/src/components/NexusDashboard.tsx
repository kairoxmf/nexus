import { useEffect, useState } from "react";
import { Icon3D } from "@shared/icons";
import { useNexus } from "../context/NexusContext";
import { WashingtonCity3D } from "./WashingtonCity3D";
import { MetricsBar } from "./MetricsBar";
import { AIFeed } from "./AIFeed";
import { PredictionsPanel } from "./PredictionsPanel";
import { ReplayPanel } from "./ReplayPanel";
import { StrategyPanel } from "./StrategyPanel";
import { SimulationLab } from "./SimulationLab";
import { AdvancedModulesPanel } from "./AdvancedModulesPanel";
import { MegaModulesPanel } from "./MegaModulesPanel";
import { CreativeModulesPanel } from "./creative/CreativeModulesPanel";
import { ExtendedModulesPanel } from "./ExtendedModulesPanel";
import { ImmersiveModulesPanel } from "./ImmersiveModulesPanel";
import { CrisisNewsTicker } from "./creative/CrisisNewsTicker";
import { CityPulseOverlay } from "./creative/CityPulseOverlay";
import { CommandFeatureHub, installCommandFeatureBridge, type CommandFeatureTab } from "./command/CommandFeatureHub";
import { CommandDemoBoot } from "./command/CommandDemoBoot";
import { VisualWowProvider, useVisualWowOptional } from "../context/VisualWowContext";
import { VisualWowPanel } from "./visual/VisualWowPanel";
import { EKGHeaderLine } from "./visual/VisualWowEffects";
import { LangSwitch } from "../ui/LangSwitch";
import { NexusModal } from "../ui/NexusModal";
import { translateDisaster, translateDna, useI18n, type Locale } from "../i18n";
import type { SimulationState, CityNode } from "../types";
import "../nexus.css";
import "../styles/visual-wow.css";

const API = import.meta.env.VITE_API_URL ?? "";

type Props = {
  embedded?: boolean;
  fullPage?: boolean;
};

export function NexusDashboard({ embedded = false, fullPage = false }: Props) {
  const { t, locale } = useI18n();
  const {
    state,
    connected,
    disasters,
    error,
    actionError,
    actionBusy,
    clearActionError,
    loading,
    retry,
    triggerDisaster,
    toggleRecovery,
    godMode,
    reset,
  } = useNexus();

  const [selectedDisaster, setSelectedDisaster] = useState("earthquake");
  const [magnitude, setMagnitude] = useState(6);
  const [radius, setRadius] = useState(5000);
  const [armed, setArmed] = useState(false);
  const [viewState, setViewState] = useState<SimulationState | null>(null);
  const [advOpen, setAdvOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [extendedOpen, setExtendedOpen] = useState(false);
  const [immersiveOpen, setImmersiveOpen] = useState(false);
  const [wowOpen, setWowOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeCityId, setActiveCityId] = useState("dc");
  const [mayorMode, setMayorMode] = useState(false);
  const [featureTab, setFeatureTab] = useState<CommandFeatureTab>("timeline");

  useEffect(() => {
    return installCommandFeatureBridge(setFeatureTab);
  }, []);

  useEffect(() => {
    if (!mayorMode) return;
    setLeftOpen(false);
    setRightOpen(false);
    setFeatureTab("mayor");
  }, [mayorMode]);

  useEffect(() => {
    const onVoiceDisaster = (ev: Event) => {
      const d = (ev as CustomEvent<{ type?: string; magnitude?: number }>).detail;
      if (!d?.type) return;
      setSelectedDisaster(d.type);
      if (d.magnitude) setMagnitude(d.magnitude);
      setArmed(true);
    };
    window.addEventListener("nexus-voice-disaster", onVoiceDisaster);
    return () => window.removeEventListener("nexus-voice-disaster", onVoiceDisaster);
  }, []);

  useEffect(() => {
    const cityTwin = state?.creative?.city_twin?.active;
    if (cityTwin?.id) setActiveCityId(cityTwin.id);
  }, [state?.creative?.city_twin?.active]);

  const focusRobot = () => {
    window.dispatchEvent(new CustomEvent("nexus-robot-focus"));
  };

  const handleSeekTick = async (targetTick: number) => {
    if (!state) return;
    window.dispatchEvent(new CustomEvent("nexus-vhs-rewind"));
    try {
      const countRes = await fetch(`${API}/api/v1/replay/count`);
      const { count } = (await countRes.json()) as { count?: number };
      if (!count) return;
      const idx = Math.min(count - 1, Math.max(0, Math.floor((targetTick / Math.max(state.tick, 1)) * count)));
      const res = await fetch(`${API}/api/v1/replay/${idx}`);
      if (res.ok) setViewState((await res.json()) as SimulationState);
    } catch {
      /* ignore */
    }
  };

  const handleSosClick = () => {
    setFeatureTab("sos");
    window.dispatchEvent(new CustomEvent("nexus-command-feature", { detail: { tab: "sos" } }));
  };

  const displayState = viewState ?? state;

  if (loading && !state) {
    return (
      <div className={`nexus-shell${embedded ? " is-embedded" : ""}${fullPage ? " is-fullpage" : ""}`}>
        <div className="loading">
          {t("connecting")}
          <div className="hint" style={{ marginTop: 12, textAlign: "center", maxWidth: 420 }}>
            {t("waiting_backend")}
          </div>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className={`nexus-shell${embedded ? " is-embedded" : ""}${fullPage ? " is-fullpage" : ""}`}>
        <div className="loading" style={{ flexDirection: "column", padding: 24 }}>
          <div style={{ color: "var(--red)", marginBottom: 12 }}>{t("backend_failed")}</div>
          <div className="hint" style={{ maxWidth: 520, textAlign: "center", lineHeight: 1.6 }}>
            {error}
          </div>
          <button className="btn-primary" style={{ maxWidth: 220, marginTop: 20 }} onClick={() => retry()}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!state || !displayState) {
    return (
      <div className={`nexus-shell${embedded ? " is-embedded" : ""}${fullPage ? " is-fullpage" : ""}`}>
        <div className="loading">{t("loading_state")}</div>
      </div>
    );
  }

  const handleMapClick = async (lat: number, lng: number) => {
    setArmed(false);
    setViewState(null);
    await triggerDisaster({
      disaster_type: selectedDisaster,
      latitude: lat,
      longitude: lng,
      magnitude,
      radius,
    });
  };

  const triggerAtCenter = async () => {
    setArmed(false);
    setViewState(null);
    await triggerDisaster({
      disaster_type: selectedDisaster,
      latitude: 38.9072,
      longitude: -77.0369,
      magnitude,
      radius,
    });
  };

  const triggerShowcaseQuake = async () => {
    setSelectedDisaster("earthquake");
    setMagnitude(7);
    setArmed(false);
    setViewState(null);
    await triggerDisaster({
      disaster_type: "earthquake",
      latitude: 38.9072,
      longitude: -77.0369,
      magnitude: 7,
      radius: 5000,
    });
  };

  return (
    <VisualWowProvider state={displayState} cityId={activeCityId}>
      <CommandDemoBoot
        fullPage={fullPage}
        state={displayState}
        onOpenTab={setFeatureTab}
        onCollapseSidebars={() => {
          setLeftOpen(false);
          setRightOpen(false);
        }}
        onTriggerDisaster={triggerShowcaseQuake}
        onToggleRecovery={() => toggleRecovery(true)}
        onReset={reset}
      />
      <NexusDashboardView
        embedded={embedded}
        fullPage={fullPage}
        displayState={displayState}
        state={state}
        connected={connected}
        viewState={viewState}
        t={t}
        locale={locale}
        selectedDisaster={selectedDisaster}
        setSelectedDisaster={setSelectedDisaster}
        magnitude={magnitude}
        setMagnitude={setMagnitude}
        radius={radius}
        setRadius={setRadius}
        armed={armed}
        setArmed={setArmed}
        disasters={disasters}
        actionError={actionError}
        actionBusy={actionBusy}
        clearActionError={clearActionError}
        triggerDisaster={triggerDisaster}
        toggleRecovery={toggleRecovery}
        godMode={godMode}
        reset={reset}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        rightOpen={rightOpen}
        setRightOpen={setRightOpen}
        activeCityId={activeCityId}
        setActiveCityId={setActiveCityId}
        mayorMode={mayorMode}
        setMayorMode={setMayorMode}
        featureTab={featureTab}
        setFeatureTab={setFeatureTab}
        advOpen={advOpen}
        setAdvOpen={setAdvOpen}
        megaOpen={megaOpen}
        setMegaOpen={setMegaOpen}
        creativeOpen={creativeOpen}
        setCreativeOpen={setCreativeOpen}
        extendedOpen={extendedOpen}
        setExtendedOpen={setExtendedOpen}
        immersiveOpen={immersiveOpen}
        setImmersiveOpen={setImmersiveOpen}
        wowOpen={wowOpen}
        setWowOpen={setWowOpen}
        handleMapClick={handleMapClick}
        triggerAtCenter={triggerAtCenter}
        handleSeekTick={handleSeekTick}
        handleSosClick={handleSosClick}
        focusRobot={focusRobot}
        setViewState={setViewState}
      />
    </VisualWowProvider>
  );
}

type DashboardViewProps = {
  embedded: boolean;
  fullPage: boolean;
  displayState: SimulationState;
  state: SimulationState;
  connected: boolean;
  viewState: SimulationState | null;
  t: (key: string) => string;
  locale: Locale;
  selectedDisaster: string;
  setSelectedDisaster: (v: string) => void;
  magnitude: number;
  setMagnitude: (v: number) => void;
  radius: number;
  setRadius: (v: number) => void;
  armed: boolean;
  setArmed: (v: boolean) => void;
  disasters: { id: string; label: string; color: string }[];
  actionError: string | null;
  actionBusy: boolean;
  clearActionError: () => void;
  triggerDisaster: (p: { disaster_type: string; latitude: number; longitude: number; magnitude: number; radius: number }) => Promise<boolean | void>;
  toggleRecovery: (on: boolean) => Promise<boolean | void>;
  godMode: (action: string, nodeId?: string) => Promise<boolean | void>;
  reset: () => Promise<boolean | void>;
  leftOpen: boolean;
  setLeftOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  rightOpen: boolean;
  setRightOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  activeCityId: string;
  setActiveCityId: (v: string) => void;
  mayorMode: boolean;
  setMayorMode: (v: boolean) => void;
  featureTab: CommandFeatureTab;
  setFeatureTab: (v: CommandFeatureTab) => void;
  advOpen: boolean;
  setAdvOpen: (v: boolean) => void;
  megaOpen: boolean;
  setMegaOpen: (v: boolean) => void;
  creativeOpen: boolean;
  setCreativeOpen: (v: boolean) => void;
  extendedOpen: boolean;
  setExtendedOpen: (v: boolean) => void;
  immersiveOpen: boolean;
  setImmersiveOpen: (v: boolean) => void;
  wowOpen: boolean;
  setWowOpen: (v: boolean) => void;
  handleMapClick: (lat: number, lng: number) => Promise<void>;
  triggerAtCenter: () => Promise<void>;
  handleSeekTick: (tick: number) => Promise<void>;
  handleSosClick: () => void;
  focusRobot: () => void;
  setViewState: (s: SimulationState | null) => void;
};

function NexusDashboardView(props: DashboardViewProps) {
  const wow = useVisualWowOptional();
  const moodClass = wow?.toggles.moodRing ? ` mood-${wow.derived.moodTier}` : "";

  const {
    embedded,
    fullPage,
    displayState,
    state,
    connected,
    viewState,
    t,
    locale,
    selectedDisaster,
    setSelectedDisaster,
    magnitude,
    setMagnitude,
    radius,
    setRadius,
    armed,
    setArmed,
    disasters,
    actionError,
    actionBusy,
    clearActionError,
    toggleRecovery,
    godMode,
    reset,
    leftOpen,
    setLeftOpen,
    rightOpen,
    setRightOpen,
    activeCityId,
    setActiveCityId,
    mayorMode,
    setMayorMode,
    setFeatureTab,
    featureTab,
    advOpen,
    setAdvOpen,
    megaOpen,
    setMegaOpen,
    creativeOpen,
    setCreativeOpen,
    extendedOpen,
    setExtendedOpen,
    immersiveOpen,
    setImmersiveOpen,
    wowOpen,
    setWowOpen,
    handleMapClick,
    triggerAtCenter,
    handleSeekTick,
    handleSosClick,
    focusRobot,
    setViewState,
  } = props;

  const handleNodeRepair = (node: CityNode) => {
    void godMode("repair", node.id);
  };

  return (
    <div className={`nexus-shell${embedded ? " is-embedded" : ""}${fullPage ? " is-fullpage" : ""}${moodClass}`}>
      <div className="app">
        <header>
          <div className="brand">
            <div>
              <h1>{t("app_title")}</h1>
              <div className="sub">{t("app_subtitle")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {wow?.toggles.ekgHeader && (
              <EKGHeaderLine bpm={wow.derived.bpm} tier={wow.derived.moodTier} />
            )}
            <LangSwitch />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>
                {t("simulation_tick")}
              </div>
              <div style={{ fontFamily: "Rajdhani", fontSize: 18, color: "var(--cyan)" }}>
                T+{displayState.tick}
              </div>
            </div>
            <span className={`status-pill ${connected ? "online" : "offline"}`}>
              {viewState ? t("replay") : connected ? t("live") : t("offline")}
            </span>
            <div
              style={{
                padding: "6px 14px",
                border: "1px solid var(--line)",
                borderRadius: 4,
                fontSize: 11,
              }}
            >
              {t("city_health")}:{" "}
              <strong
                style={{
                  color:
                    displayState.metrics.city_health >= 70
                      ? "var(--green)"
                      : displayState.metrics.city_health >= 40
                        ? "var(--amber)"
                        : "var(--red)",
                }}
              >
                {displayState.metrics.city_health}%
              </strong>
            </div>
          </div>
        </header>

        <MetricsBar metrics={displayState.metrics} />

        {actionError && (
          <div className="action-error">
            <span>{actionError}</span>
            <button type="button" onClick={clearActionError}>
              <Icon3D name="close" size={14} />
            </button>
          </div>
        )}

        <div
          className={`main${leftOpen ? "" : " is-left-collapsed"}${rightOpen ? "" : " is-right-collapsed"}`}
        >
          <aside className={`panel panel-side panel-left nx-scroll-sm nx-scroll-glow${leftOpen ? "" : " is-collapsed"}`}>
            <div className="section">
              <div className="section-title">{t("crisis_sandbox")}</div>
              <label className="field">{t("disaster_type")}</label>
              <select
                value={selectedDisaster}
                onChange={(e) => setSelectedDisaster(e.target.value)}
              >
                {disasters.map((d) => (
                  <option key={d.id} value={d.id}>
                    {translateDisaster(locale, d.id)}
                  </option>
                ))}
              </select>
              <label className="field">
                {t("magnitude")} <span className="range-val">{magnitude}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={magnitude}
                onChange={(e) => setMagnitude(Number(e.target.value))}
              />
              <label className="field">
                {t("radius")} <span className="range-val">{radius}m</span>
              </label>
              <input
                type="range"
                min={500}
                max={15000}
                step={100}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
              <button className="btn-primary" onClick={() => setArmed(!armed)} disabled={actionBusy}>
                {armed ? t("cancel_arm") : t("arm_disaster")}
              </button>
              <button
                className="btn-ghost"
                style={{ marginTop: 8 }}
                onClick={triggerAtCenter}
                disabled={actionBusy}
              >
                {t("trigger_center")}
              </button>
            </div>

            <div className="section">
              <div className="section-title">{t("god_mode")}</div>
              <button
                className="btn-ghost"
                disabled={actionBusy}
                onClick={() => {
                  setViewState(null);
                  void godMode("random_failure");
                }}
              >
                {t("random_failure")}
              </button>
              <button
                className="btn-ghost"
                disabled={actionBusy}
                onClick={() => {
                  setViewState(null);
                  void godMode("repair_all");
                }}
              >
                {t("repair_all")}
              </button>
              <button
                className="btn-ghost"
                disabled={actionBusy}
                onClick={() => {
                  setViewState(null);
                  void godMode("cut_power");
                }}
              >
                {t("cut_power")}
              </button>
            </div>

            <div className="section">
              <div className="section-title">{t("recovery")}</div>
              <button
                className={`btn-recover ${displayState.recovery_mode ? "active" : ""}`}
                disabled={actionBusy}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                onClick={() => {
                  setViewState(null);
                  void toggleRecovery(!displayState.recovery_mode);
                }}
              >
                {displayState.recovery_mode && <Icon3D name="dot" size={12} animated color="#33c17a" />}
                {displayState.recovery_mode ? t("recovery_active") : t("recover_city")}
              </button>
            </div>

            <ReplayPanel
              tick={state.tick}
              liveState={state}
              onReplayState={(s) => setViewState(s)}
            />

            <StrategyPanel state={state} />
            <SimulationLab state={state} />

            <div className="section">
              <button
                className="btn-ghost"
                disabled={actionBusy}
                onClick={() => {
                  setViewState(null);
                  void reset();
                }}
              >
                {t("reset_city")}
              </button>
            </div>

            <PredictionsPanel predictions={displayState.predictions} />

            <div className="section">
              <div className="cmd-module-grid">
                <button type="button" className="btn-ghost cmd-module-btn adv-open-btn" onClick={() => setAdvOpen(true)}>
                  {t("adv_open_modules")}
                </button>
                <button type="button" className="btn-primary cmd-module-btn mega-open-btn" onClick={() => setMegaOpen(true)}>
                  {t("mega_open_modules")}
                </button>
                <button type="button" className="btn-primary cmd-module-btn creative-open-btn" onClick={() => setCreativeOpen(true)}>
                  {t("creative_open_modules")}
                </button>
                <button type="button" className="btn-primary cmd-module-btn extended-open-btn" onClick={() => setExtendedOpen(true)}>
                  {t("ext_open_modules")}
                </button>
                <button type="button" className="btn-primary cmd-module-btn immersive-open-btn" onClick={() => setImmersiveOpen(true)}>
                  {t("imm_open_modules")}
                </button>
                <button type="button" className="btn-primary cmd-module-btn wow-open-btn" onClick={() => setWowOpen(true)}>
                  {t("wow_open_modules")}
                </button>
              </div>
            </div>
          </aside>

          <div className="panel map-panel">
            <button
              type="button"
              className={`map-drawer-toggle map-drawer-toggle-left${leftOpen ? " is-open" : ""}`}
              onClick={() => setLeftOpen((v) => !v)}
              aria-label={leftOpen ? t("panel_close_controls") : t("panel_open_controls")}
              aria-expanded={leftOpen}
              title={t("panel_controls")}
            >
              <Icon3D name={leftOpen ? "chevron-left" : "chevron-right"} size={14} />
              <span className="map-drawer-label">{t("panel_controls")}</span>
            </button>
            <button
              type="button"
              className={`map-drawer-toggle map-drawer-toggle-right${rightOpen ? " is-open" : ""}`}
              onClick={() => setRightOpen((v) => !v)}
              aria-label={rightOpen ? t("panel_close_intelligence") : t("panel_open_intelligence")}
              aria-expanded={rightOpen}
              title={t("panel_intelligence")}
            >
              <span className="map-drawer-label">{t("panel_intelligence")}</span>
              <Icon3D name={rightOpen ? "chevron-right" : "chevron-left"} size={14} />
            </button>
            <CrisisNewsTicker news={displayState.creative?.news_network} />
            <CityPulseOverlay pulse={displayState.creative?.city_pulse} />
            <WashingtonCity3D
              state={displayState}
              armed={armed}
              onMapClick={handleMapClick}
              cityId={activeCityId}
              onSosClick={handleSosClick}
              onOpenWowPanel={() => setWowOpen(true)}
              onNodeRepair={handleNodeRepair}
              compactOverlays
            />
            <CommandFeatureHub
              state={displayState}
              activeCityId={activeCityId}
              mayorMode={mayorMode}
              activeTab={featureTab}
              onCityChange={setActiveCityId}
              onMayorModeToggle={setMayorMode}
              onSeekTick={handleSeekTick}
              onScenarioRun={setActiveCityId}
              onOpenTab={setFeatureTab}
            />
          </div>

          <aside className={`panel panel-side panel-right nx-scroll-sm nx-scroll-glow${rightOpen ? "" : " is-collapsed"}`}>
            <AIFeed log={displayState.log} activeAgents={displayState.active_agents} />

            <div className="section">
              <button type="button" className="btn-primary chat-open-btn" onClick={focusRobot}>
                {t("chat_open")}
              </button>
            </div>

            {mayorMode && (
              <div className="section hint" style={{ color: "var(--amber)" }}>
                {t("mayor_mode_active")}
              </div>
            )}

            {displayState.last_debate && (
              <div className="section" style={{ marginTop: 18 }}>
                <div className="section-title">{t("ai_debate")}</div>
                <div className="hint">
                  <strong>{t("decision")}:</strong> {displayState.last_debate.decision}
                  <br />
                  <strong>{t("confidence")}:</strong>{" "}
                  {Math.round(displayState.last_debate.confidence * 100)}%
                  <br />
                  <strong>{t("impact")}:</strong> {displayState.last_debate.expected_impact}
                </div>
              </div>
            )}

            {displayState.citizen_agents && (
              <div className="section" style={{ marginTop: 18 }}>
                <div className="section-title">{t("citizen_agents")}</div>
                <div style={{ fontSize: 10, lineHeight: 1.8 }}>
                  {t("safe")}:{" "}
                  <strong style={{ color: "var(--green)" }}>
                    {(displayState.citizen_agents.safe / 1000).toFixed(0)}k
                  </strong>
                  {" · "}
                  {t("evacuating")}: {displayState.citizen_agents.evacuating.toLocaleString()}
                  {" · "}
                  {t("needs_help")}:{" "}
                  <strong style={{ color: "var(--red)" }}>
                    {displayState.citizen_agents.needs_help.toLocaleString()}
                  </strong>
                </div>
                {displayState.weather && displayState.weather.overlay !== "none" && (
                  <div className="hint" style={{ marginTop: 6 }}>
                    {t("weather")}: {displayState.weather.condition} ·{" "}
                    {displayState.weather.wind_speed_kmh} km/h {t("wind")}
                  </div>
                )}
              </div>
            )}

            {Object.keys(displayState.city_dna).length > 0 && (
              <div className="section" style={{ marginTop: 18 }}>
                <div className="section-title">{t("city_dna")}</div>
                {Object.entries(displayState.city_dna).map(([k, v]) => (
                  <div key={k} style={{ fontSize: 10, marginBottom: 4 }}>
                    {translateDna(locale, k)}:{" "}
                    <strong style={{ color: "var(--cyan)" }}>{String(v)}</strong>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      <NexusModal
        open={advOpen}
        onClose={() => setAdvOpen(false)}
        title={t("adv_modules_title")}
        subtitle={t("adv_modal_sub")}
        wide
      >
        <AdvancedModulesPanel data={displayState.advanced} expanded />
      </NexusModal>

      <NexusModal
        open={megaOpen}
        onClose={() => setMegaOpen(false)}
        title={t("mega_modules_title")}
        subtitle={t("mega_modal_sub")}
        wide
      >
        <MegaModulesPanel data={displayState.mega} expanded />
      </NexusModal>

      <NexusModal
        open={creativeOpen}
        onClose={() => setCreativeOpen(false)}
        title={t("creative_modules_title")}
        subtitle={t("creative_modal_sub")}
        wide
      >
        <CreativeModulesPanel data={displayState.creative} expanded />
      </NexusModal>

      <NexusModal
        open={extendedOpen}
        onClose={() => setExtendedOpen(false)}
        title={t("ext_modules_title")}
        subtitle={t("ext_modal_sub")}
        wide
      >
        <ExtendedModulesPanel data={displayState.extended} expanded />
      </NexusModal>

      <NexusModal
        open={immersiveOpen}
        onClose={() => setImmersiveOpen(false)}
        title={t("imm_modules_title")}
        subtitle={t("imm_modal_sub")}
        wide
      >
        <ImmersiveModulesPanel data={displayState.immersive} expanded />
      </NexusModal>

      <NexusModal
        open={wowOpen}
        onClose={() => setWowOpen(false)}
        title={t("wow_title")}
        subtitle={t("wow_modal_sub")}
        wide
      >
        <VisualWowPanel state={displayState} expanded />
      </NexusModal>
    </div>
  );
}
