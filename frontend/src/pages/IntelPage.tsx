import { useState } from "react";
import { Icon3D } from "@shared/icons";
import { useNexus } from "../context/NexusContext";
import { AIFeed } from "../components/AIFeed";
import { AgentPulseGrid, BrainCore, CyberScanline, DataStreamCanvas, NeuralMesh, ParticleField, TypewriterText } from "../components/creative/PageGraphics";
import { useI18n } from "../i18n";

export function IntelPage() {
  const { state, connected } = useNexus();
  const { t } = useI18n();
  const [tab, setTab] = useState<"assistant" | "feed">("assistant");

  const focusRobot = () => {
    window.dispatchEvent(new CustomEvent("nexus-robot-focus"));
  };

  const agents = state?.active_agents ?? [];

  return (
    <main className="nx-page nx-intel-page px-6 md:px-12 py-12 max-w-5xl mx-auto">
      <div className="nx-intel-hero">
        <div className="nx-intel-hero-bg">
          <NeuralMesh />
          <DataStreamCanvas density={14} />
          <ParticleField color="#4cc9f0" />
          <CyberScanline />
        </div>
        <div className="nx-intel-hero-content">
          <p className="nx-page-kicker">{t("intel_kicker")}</p>
          <h1 className="nx-page-title">{t("intel_title")}</h1>
          <p className="nx-page-sub">
            {connected ? t("intel_sub_live") : t("intel_sub_wait")} · {agents.length} {t("intel_agents")}
          </p>
          <div className="nx-intel-status-bar">
            <span className={`nx-intel-status-pill${connected ? " is-live" : ""}`}>
              <span className="pg-pulse-dot" />
              {connected ? t("home_online") : t("home_sync")}
            </span>
            <span className="nx-intel-status-pill">
              <Icon3D name="chart" size={14} animated />
              {agents.length} {t("intel_agents")}
            </span>
            {state?.tick != null && (
              <span className="nx-intel-status-pill">
                {t("home_tick")} T+{state.tick}
              </span>
            )}
          </div>
          {agents.length > 0 && (
            <AgentPulseGrid agents={agents} connected={connected} />
          )}
        </div>
      </div>

      <div className="nx-intel-tabs">
        <button type="button" className={`nx-tab${tab === "assistant" ? " active" : ""}`} onClick={() => setTab("assistant")}>
          <Icon3D name="vr" size={14} animated />
          {t("ai_copilot")}
        </button>
        <button type="button" className={`nx-tab${tab === "feed" ? " active" : ""}`} onClick={() => setTab("feed")}>
          <Icon3D name="chart" size={14} />
          {t("intel_feed_tab")}
        </button>
      </div>

      <div className={`nx-intel-shell${tab === "feed" ? " nx-scroll nx-scroll-glow" : ""}`}>
        {tab === "assistant" ? (
          <div className="nx-intel-assistant-panel">
            <BrainCore active />
            <p>
              <TypewriterText text={t("intel_robot_hint")} speed={28} />
            </p>
            <button type="button" className="btn-primary" onClick={focusRobot}>
              <Icon3D name="vr" size={16} animated />
              {t("robot_name")}
            </button>
          </div>
        ) : state ? (
          <div className="nx-intel-feed nx-scroll nx-scroll-glow">
            <AIFeed log={state.log} activeAgents={state.active_agents} />
          </div>
        ) : (
          <div className="nx-intel-empty">
            <BrainCore />
            <p style={{ marginTop: 16 }}>{t("intel_connect_prompt")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
