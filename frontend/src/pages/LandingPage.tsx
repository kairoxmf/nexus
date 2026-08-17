import { useNexus } from "../context/NexusContext";
import { useI18n } from "../i18n";
import { HoverCard } from "../ui/HoverCard";
import { GlowLink } from "../ui/GlowLink";
import { LangSwitch } from "../ui/LangSwitch";
import { HomeShowcase3D } from "../ui/HomeShowcase3D";
import {
  AuroraBackground,
  DataStreamCanvas,
  FeatureGraphic,
  FloatingOrbs,
  GlitchText,
  HolographicTilt,
  LivePulseTicker,
  PipelineViz,
  SectionDivider,
  StatRing,
} from "../components/creative/PageGraphics";

export function LandingPage() {
  const { connected, state } = useNexus();
  const { t } = useI18n();

  const health = state?.metrics.city_health ?? 0;
  const agentCount = state?.active_agents?.length ?? 0;

  return (
    <main className="nx-nike-home">
      <HomeShowcase3D />

      <div className="nx-home-flow">
        <section className="nx-nike-hero">
          <AuroraBackground />
          <DataStreamCanvas density={22} />
          <FloatingOrbs count={4} />
          <p className="nx-home-kicker">{t("home_hero_sub")}</p>
          <h1 className="nx-hero-title nx-nike-title">
            <GlitchText>NEXUS</GlitchText>
          </h1>
          <p className="nx-home-lead nx-nike-lead">{t("home_intro")}</p>

          <LivePulseTicker
            items={[t("home_ticker_1"), t("home_ticker_2"), t("home_ticker_3"), t("home_ticker_4")]}
          />

          <div className="nx-home-cta">
            <GlowLink to="/command">{t("home_enter_command")}</GlowLink>
            <GlowLink to="/intel" variant="ghost">{t("home_ai_intel")}</GlowLink>
          </div>

          <p className="nx-nike-scroll-hint">{t("home_scroll_hint")}</p>

          <LangSwitch variant="hero" />
        </section>

        <SectionDivider label={t("home_stack_title")} />

        <section className="nx-home-row nx-home-row--2">
          <div className="nx-nike-panel nx-glass-block nx-glass-accent">
            <p className="nx-nike-tag">{t("home_stack_title")}</p>
            <h2 className="nx-nike-heading">{t("home_mission_title")}</h2>
            <p className="nx-nike-body">{t("home_mission_body")}</p>
          </div>
          <div className="nx-nike-panel nx-glass-block nx-glass-accent">
            <h2 className="nx-nike-heading">{t("home_about_title")}</h2>
            <p className="nx-nike-body">{t("home_about_body")}</p>
          </div>
        </section>

        <HoverCard glow="cyan" className="nx-nike-panel nx-home-pipeline-panel">
          <p className="nx-nike-tag">{t("home_pipeline_tag")}</p>
          <h2 className="nx-nike-heading">{t("home_pipeline_title")}</h2>
          <PipelineViz labels={[t("home_pipeline_1"), t("home_pipeline_2"), t("home_pipeline_3")]} />
        </HoverCard>

        <SectionDivider label={t("home_features_tag")} />

        <section className="nx-home-features">
          <HolographicTilt className="nx-nike-feature-card-wrap">
            <HoverCard glow="cyan" className="nx-nike-feature-card">
              <FeatureGraphic variant="city" />
              <span className="nx-nike-feature-num">01</span>
              <h3>{t("home_f1_title")}</h3>
              <p>{t("home_f1_desc")}</p>
            </HoverCard>
          </HolographicTilt>
          <HolographicTilt className="nx-nike-feature-card-wrap">
            <HoverCard glow="amber" className="nx-nike-feature-card">
              <FeatureGraphic variant="ai" />
              <span className="nx-nike-feature-num">02</span>
              <h3>{t("home_f2_title")}</h3>
              <p>{t("home_f2_desc")}</p>
            </HoverCard>
          </HolographicTilt>
          <HolographicTilt className="nx-nike-feature-card-wrap">
            <HoverCard className="nx-nike-feature-card">
              <FeatureGraphic variant="crisis" />
              <span className="nx-nike-feature-num">03</span>
              <h3>{t("home_f3_title")}</h3>
              <p>{t("home_f3_desc")}</p>
            </HoverCard>
          </HolographicTilt>
        </section>

        <section className="nx-home-stats">
          <HoverCard glow="cyan">
            <div className="nx-home-stat-visual">
              <StatRing value={connected ? 100 : 30} color="#33c17a" label={t("home_online")} />
              <div>
                <p className="nx-stat-label">{t("home_live_status")}</p>
                <p className="nx-stat-value nx-stat-value--sm">
                  {connected ? t("home_online") : t("home_sync")}
                </p>
              </div>
            </div>
            <p className="nx-stat-meta">
              {t("home_websocket")} {connected ? t("home_ws_connected") : t("home_ws_connecting")}
            </p>
          </HoverCard>

          <HoverCard glow="amber">
            <div className="nx-home-stat-visual">
              <StatRing value={health} color="#f4a100" label={t("city_health")} />
              <div>
                <p className="nx-stat-label">{t("city_health")}</p>
                <p className="nx-stat-value">{state?.metrics.city_health ?? "—"}%</p>
              </div>
            </div>
            <p className="nx-stat-meta">{t("home_tick")} T+{state?.tick ?? 0}</p>
          </HoverCard>

          <HoverCard>
            <div className="nx-home-stat-visual">
              <StatRing value={Math.min(100, agentCount * 12)} color="#4cc9f0" label={t("home_agents")} />
              <div>
                <p className="nx-stat-label">{t("home_agents")}</p>
                <p className="nx-stat-value nx-stat-value--sm">{agentCount}</p>
              </div>
            </div>
            <p className="nx-stat-meta">{t("home_agents_active")}</p>
          </HoverCard>
        </section>

        <div className="nx-nike-final-cta">
          <GlowLink to="/command">{t("home_enter_command")}</GlowLink>
        </div>
      </div>
    </main>
  );
}
