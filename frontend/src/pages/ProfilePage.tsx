import { Link } from "react-router-dom";
import { Icon3D } from "@shared/icons";
import { useAuth } from "../context/AuthContext";
import { useNexusControl } from "../context/NexusControlContext";
import { useNexus } from "../context/NexusContext";
import { useI18n } from "../i18n";
import { HexGridOverlay, HexPulseRing, MorphBlob, OperatorRankBadge, ProfileConstellation } from "../components/creative/PageGraphics";
import { HoverCard } from "../ui/HoverCard";
import { GlowButton } from "../ui/GlowButton";

const ROLE_COLORS: Record<string, string> = {
  admin: "#f4a100",
  analyst: "#4cc9f0",
  citizen: "#33c17a",
};

const ROLE_LABEL_KEYS: Record<string, string> = {
  admin: "auth_role_admin",
  analyst: "auth_role_analyst",
  citizen: "auth_role_citizen",
};

function MetricBar({ label, value, color = "var(--cyan)" }: { label: string; value: number; color?: string }) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <div className="nx-profile-metric">
      <div className="nx-profile-metric-head">
        <span className="nx-stat-label">{label}</span>
        <span className="nx-profile-metric-val" style={{ color }}>{pct}%</span>
      </div>
      <div className="nx-profile-metric-track">
        <div
          className="nx-profile-metric-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
    </div>
  );
}

function AvatarRing({ name, role }: { name: string; role?: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
  const color = ROLE_COLORS[role ?? ""] ?? "var(--cyan)";

  return (
    <div className="nx-profile-avatar" style={{ ["--avatar-color" as string]: color }}>
      <div className="nx-profile-avatar-ring" />
      <div className="nx-profile-avatar-inner">{initials}</div>
    </div>
  );
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { state, connected } = useNexus();
  const { gestureEnabled, setGestureEnabled, reopenOnboarding } = useNexusControl();
  const { t } = useI18n();
  const m = state?.metrics;

  const displayName = user?.authenticated
    ? user.username ?? user.profile?.name ?? t("profile_guest")
    : user?.profile?.name ?? t("profile_guest");

  const role = user?.role ?? (user?.authenticated ? undefined : undefined);
  const roleColor = ROLE_COLORS[role ?? ""] ?? "var(--muted)";

  const memberSince = user?.profile?.createdAt
    ? new Date(user.profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const recentLog = state?.log?.slice(-6).reverse() ?? [];

  const infraMetrics = m
    ? [
        { label: t("metric_power_grid"), value: m.power_grid, color: "#f4a100" },
        { label: t("metric_water_network"), value: m.water_network, color: "#4cc9f0" },
        { label: t("metric_healthcare"), value: m.healthcare, color: "#ff6b9d" },
        { label: t("metric_transport"), value: m.transport, color: "#a78bfa" },
        { label: t("metric_safety"), value: m.safety_index, color: "#33c17a" },
        { label: t("profile_economic"), value: m.economic_index, color: "#fbbf24" },
      ]
    : [];

  const coreStats = m
    ? [
        { label: t("city_health"), value: m.city_health, glow: "cyan" as const },
        { label: t("profile_recovery"), value: m.recovery_percentage, glow: "cyan" as const },
        { label: t("profile_satisfaction"), value: m.citizen_satisfaction, glow: "amber" as const },
        { label: t("metric_housing"), value: m.housing, glow: "amber" as const },
      ]
    : [];

  return (
    <main className="nx-profile-page nx-page px-6 md:px-12 py-12 max-w-6xl mx-auto">
      {/* Hero banner */}
      <header className="nx-profile-hero">
        <div className="nx-profile-hero-bg">
          <MorphBlob color={roleColor} />
          <HexGridOverlay />
          <ProfileConstellation />
        </div>
        <div className="nx-profile-hero-content">
          <div className="nx-profile-avatar-wrap">
            <HexPulseRing color={roleColor} size={140} />
            <AvatarRing name={displayName} role={role} />
          </div>
          <div className="nx-profile-hero-info">
            <p className="nx-page-kicker">{t("profile_kicker")}</p>
            <h1 className="nx-profile-hero-name">{displayName}</h1>
            {user?.authenticated && user.role && (
              <OperatorRankBadge role={user.role} label={t(ROLE_LABEL_KEYS[user.role] ?? "profile_role")} />
            )}
            <div className="nx-profile-hero-meta">
              {user?.authenticated ? (
                <>
                  <span className="nx-profile-badge" style={{ borderColor: roleColor, color: roleColor }}>
                    {user.role ?? t("profile_role")}
                  </span>
                  {user.tenant && (
                    <span className="nx-profile-meta-item">
                      {t("profile_tenant")}: <strong>{user.tenant}</strong>
                    </span>
                  )}
                </>
              ) : (
                <span className="nx-profile-meta-item nx-profile-meta-muted">{t("profile_not_auth")}</span>
              )}
              <span className={`nx-profile-live${connected ? " is-live" : ""}`}>
                <span className="nx-profile-live-dot" />
                {connected ? t("live") : t("offline")}
              </span>
            </div>
            {memberSince && (
              <p className="nx-profile-since">
                {t("profile_member_since")} {memberSince}
              </p>
            )}
          </div>
          <div className="nx-profile-hero-actions">
            {user?.authenticated ? (
              <button type="button" className="nx-profile-logout" onClick={logout}>
                <Icon3D name="close" size={14} />
                {t("profile_logout")}
              </button>
            ) : (
              <Link to="/auth">
                <GlowButton>{t("profile_authenticate")}</GlowButton>
              </Link>
            )}
          </div>
        </div>
      </header>

      {!user?.authenticated && (
        <HoverCard glow="amber" className="nx-profile-cta">
          <div className="nx-profile-cta-inner">
            <Icon3D name="warning" size={28} color="var(--amber)" animated />
            <div>
              <p className="nx-profile-cta-title">{t("profile_signin_prompt")}</p>
              <p className="nx-page-sub">{t("auth_welcome_sub")}</p>
            </div>
            <Link to="/auth"><GlowButton>{t("profile_authenticate")}</GlowButton></Link>
          </div>
        </HoverCard>
      )}

      {/* Core stats */}
      {coreStats.length > 0 && (
        <section className="nx-profile-section">
          <h2 className="nx-profile-section-title">{t("home_live_status")}</h2>
          <div className="nx-profile-stats">
            {coreStats.map((s, i) => (
              <HoverCard key={s.label} glow={s.glow} className="nx-profile-stat-card nx-glass-accent" style={{ animationDelay: `${i * 0.08}s` }}>
                <p className="nx-stat-label">{s.label}</p>
                <p className="nx-stat-value">{Math.round(s.value)}%</p>
                <div className="nx-profile-stat-track">
                  <div className="nx-profile-stat-fill" style={{ width: `${Math.round(s.value)}%` }} />
                </div>
              </HoverCard>
            ))}
          </div>
        </section>
      )}

      <div className="nx-profile-grid">
        {/* Profile details */}
        <section className="nx-profile-section">
          <h2 className="nx-profile-section-title">{t("profile_saved")}</h2>
          <HoverCard className="nx-profile-detail-card nx-glass-accent">
            {user?.profile ? (
              <dl className="nx-profile-dl">
                <div className="nx-profile-dl-row">
                  <dt>{t("auth_fullname")}</dt>
                  <dd>{user.profile.name}</dd>
                </div>
                <div className="nx-profile-dl-row">
                  <dt>{t("contact_email")}</dt>
                  <dd>{user.profile.email}</dd>
                </div>
                {user.profile.phone && (
                  <div className="nx-profile-dl-row">
                    <dt>{t("profile_phone")}</dt>
                    <dd>{user.profile.phone}</dd>
                  </div>
                )}
                {user.profile.goals && (
                  <div className="nx-profile-dl-row">
                    <dt>{t("profile_goals")}</dt>
                    <dd>{user.profile.goals}</dd>
                  </div>
                )}
                {user.authenticated && user.username && (
                  <div className="nx-profile-dl-row">
                    <dt>{t("profile_operator_id")}</dt>
                    <dd className="nx-profile-mono">{user.username}</dd>
                  </div>
                )}
                {user.authenticated && user.role && (
                  <div className="nx-profile-dl-row">
                    <dt>{t("profile_access_level")}</dt>
                    <dd style={{ color: roleColor }}>{user.role}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="nx-page-sub">{t("profile_no_profile")}</p>
            )}
          </HoverCard>

          {user?.role === "admin" && (
            <div className="nx-profile-admin-banner">
              <Icon3D name="check" size={18} color="var(--amber)" />
              {t("profile_admin_granted")}
              <Link to="/admin" style={{ marginInlineStart: "auto", color: "var(--amber)", fontSize: 12 }}>
                {t("nav_admin_panel")} →
              </Link>
            </div>
          )}

          <h2 className="nx-profile-section-title" style={{ marginTop: 28 }}>{t("profile_quick_actions")}</h2>
          <div className="nx-profile-actions">
            <Link to="/command"><GlowButton>{t("profile_command")}</GlowButton></Link>
            <Link to="/intel"><GlowButton variant="ghost">{t("home_ai_intel")}</GlowButton></Link>
            {!user?.authenticated && (
              <Link to="/auth"><GlowButton variant="ghost">{t("auth_signin")}</GlowButton></Link>
            )}
          </div>

          <h2 className="nx-profile-section-title" style={{ marginTop: 28 }}>{t("profile_control_settings")}</h2>
          <HoverCard className="nx-profile-control-card">
            <p className="nx-page-sub">{t("profile_control_sub")}</p>
            <div className="nx-profile-control-row">
              <div>
                <strong>{t("gesture_active")}</strong>
                <p className="nx-profile-control-hint">{t("gesture_pan_hint")}</p>
              </div>
              <button
                type="button"
                className={`nx-profile-toggle${gestureEnabled ? " is-on" : ""}`}
                onClick={() => setGestureEnabled(!gestureEnabled)}
              >
                {gestureEnabled ? t("gesture_off") : t("gesture_on")}
              </button>
            </div>
            <button type="button" className="nx-btn-ghost nx-profile-reopen-tour" onClick={reopenOnboarding}>
              <Icon3D name="vr" size={14} animated />
              {t("profile_reopen_onboarding")}
            </button>
          </HoverCard>
        </section>

        {/* Right column: infra + activity */}
        <section className="nx-profile-section">
          {infraMetrics.length > 0 && (
            <>
              <h2 className="nx-profile-section-title">{t("profile_infrastructure")}</h2>
              <HoverCard className="nx-profile-infra-card nx-glass-accent">
                {infraMetrics.map((item) => (
                  <MetricBar key={item.label} label={item.label} value={item.value} color={item.color} />
                ))}
              </HoverCard>
            </>
          )}

          <h2 className="nx-profile-section-title" style={{ marginTop: infraMetrics.length ? 28 : 0 }}>
            {t("profile_activity")}
            {state?.tick != null && (
              <span className="nx-profile-tick-badge">
                {t("home_tick")} {state.tick}
              </span>
            )}
          </h2>
          <HoverCard className="nx-profile-activity-card nx-glass-accent">
            {recentLog.length > 0 ? (
              <ul className="nx-profile-activity-list">
                {recentLog.map((entry, i) => (
                  <li
                    key={`${entry.tick}-${i}`}
                    className={`nx-profile-activity-item level-${entry.level}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <span className="nx-profile-activity-tick">T{entry.tick}</span>
                    <span className="nx-profile-activity-text">{entry.text}</span>
                    {entry.agent && (
                      <span className="nx-profile-activity-agent">{entry.agent}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="nx-page-sub nx-profile-empty">{t("profile_no_activity")}</p>
            )}
            {state?.active_agents && state.active_agents.length > 0 && (
              <div className="nx-profile-agents">
                <span className="nx-stat-label">{t("profile_agents")}</span>
                <div className="nx-profile-agent-chips">
                  {state.active_agents.slice(0, 8).map((agent) => (
                    <span key={agent} className="nx-profile-agent-chip">{agent}</span>
                  ))}
                </div>
              </div>
            )}
          </HoverCard>
        </section>
      </div>
    </main>
  );
}
