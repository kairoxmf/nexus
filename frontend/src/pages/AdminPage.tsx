import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon3D } from "@shared/icons";
import { FloatingOrbs, HexPulseRing } from "../components/creative/PageGraphics";
import { HoverCard } from "../ui/HoverCard";
import { GlowButton } from "../ui/GlowButton";
import { useI18n } from "../i18n";
import {
  fetchAdminMessages,
  updateMessageStatus,
  type ContactMessage,
} from "../lib/contactApi";
import {
  adminGodMode,
  adminResetCity,
  fetchAdminIntel,
  fetchAdminOverview,
  fetchAdminSos,
  updateSosStatus,
  type AdminIntelReport,
  type AdminOverview,
  type AdminSosReport,
} from "../lib/adminApi";

const STATUS_COLORS: Record<string, string> = {
  new: "#4cc9f0",
  read: "#f4a100",
  replied: "#33c17a",
  archived: "#6b7280",
  dispatched: "#4cc9f0",
  resolved: "#33c17a",
  open: "#ff4655",
};

type Tab = "overview" | "sos" | "intel" | "inbox" | "controls";

function formatDate(iso: string | null | undefined, locale: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="nx-admin-stat">
      <span className="nx-stat-label">{label}</span>
      <strong style={{ color: color ?? "var(--cyan)" }}>{value}</strong>
    </div>
  );
}

export function AdminPage() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [sos, setSos] = useState<AdminSosReport[]>([]);
  const [intel, setIntel] = useState<AdminIntelReport[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ContactMessage["status"]>("all");
  const [flash, setFlash] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [ov, sosData, intelData, inbox] = await Promise.all([
      fetchAdminOverview(),
      fetchAdminSos(),
      fetchAdminIntel(),
      fetchAdminMessages(),
    ]);
    if (ov) setOverview(ov);
    if (sosData) setSos(sosData.reports);
    if (intelData) setIntel(intelData.reports);
    if (inbox) {
      setMessages(inbox.messages);
      setNewCount(inbox.new_count);
      if (selected) {
        const fresh = inbox.messages.find((m) => m.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    }
    setLoading(false);
  }, [selected]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 12000);
    return () => clearInterval(timer);
  }, [load]);

  const ping = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2200);
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === "new") {
      await updateMessageStatus(msg.id, "read");
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m)));
      setNewCount((c) => Math.max(0, c - 1));
    }
  };

  const setStatus = async (status: ContactMessage["status"]) => {
    if (!selected) return;
    const ok = await updateMessageStatus(selected.id, status);
    if (ok) {
      setMessages((prev) => prev.map((m) => (m.id === selected.id ? { ...m, status } : m)));
      setSelected({ ...selected, status });
    }
  };

  const runControl = async (action: "repair_all" | "cut_power" | "reset") => {
    const ok = action === "reset" ? await adminResetCity() : await adminGodMode(action);
    if (ok) {
      ping(t("admin_control_ok"));
      void load();
    }
  };

  const handleSos = async (id: string, status: string) => {
    const res = await updateSosStatus(id, status);
    if (res?.report) {
      setSos((prev) => prev.map((r) => (r.id === id ? { ...r, ...res.report } : r)));
      ping(t("admin_control_ok"));
    }
  };

  const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);
  const health = overview?.city_health ?? 0;
  const healthColor = health >= 80 ? "#33c17a" : health >= 50 ? "#f4a100" : "#ff4655";
  const tabs: Tab[] = ["overview", "sos", "intel", "inbox", "controls"];

  return (
    <main className="nx-page nx-admin-page px-6 py-10 mx-auto">
      <header className="nx-admin-header">
        <FloatingOrbs count={2} />
        <p className="nx-page-kicker">{t("admin_kicker")}</p>
        <div className="nx-admin-title-row">
          <h1 className="nx-page-title">{t("admin_ops_title")}</h1>
          {newCount > 0 && (
            <span className="nx-admin-badge">{newCount} {t("admin_new")}</span>
          )}
        </div>
        <p className="nx-page-sub">{t("admin_ops_desc")}</p>
        {flash && <p className="nx-admin-flash">{flash}</p>}
      </header>

      <div className="nx-admin-tabs">
        {tabs.map((id) => (
          <button
            key={id}
            type="button"
            className={`nx-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {t(`admin_tab_${id}`)}
            {id === "sos" && sos.length > 0 ? ` ${sos.length}` : ""}
            {id === "inbox" && newCount > 0 ? ` ${newCount}` : ""}
          </button>
        ))}
        <button type="button" className="nx-tab" onClick={() => void load()} disabled={loading}>
          <Icon3D name="refresh" size={12} />
          {loading ? t("admin_loading") : t("admin_refresh")}
        </button>
      </div>

      {tab === "overview" && (
        <div className="nx-admin-overview">
          <div className="nx-admin-stat-grid">
            <Stat label={t("city_health")} value={`${Math.round(health)}%`} color={healthColor} />
            <Stat label={t("admin_active_sos")} value={overview?.sos_count ?? sos.length} color="#ff4655" />
            <Stat label={t("admin_intel_count")} value={overview?.intel_count ?? intel.length} />
            <Stat label={t("admin_messages_count")} value={overview?.inbox_count ?? messages.length} color="#f4a100" />
            <Stat label={t("admin_tick")} value={overview?.tick ?? "—"} />
            <Stat label={t("admin_vehicles")} value={overview?.vehicles ?? 0} />
            <Stat
              label={t("admin_disaster")}
              value={overview?.active_disaster ? t(`disaster_${overview.active_disaster}`) : t("admin_none")}
              color={overview?.active_disaster ? "#ff4655" : "#33c17a"}
            />
            <Stat
              label={t("admin_db")}
              value={overview?.platform?.database_connected ? t("admin_online") : t("offline")}
            />
          </div>
          <HoverCard glow="cyan" className="nx-admin-weak">
            <span className="nx-stat-label">{t("adv_weak_points")}</span>
            {(overview?.nodes ?? []).length === 0 ? (
              <p className="nx-page-sub">{t("admin_none")}</p>
            ) : (
              overview?.nodes.map((n) => (
                <div key={n.id} className="nx-admin-weak-row">
                  <span>{n.name}</span>
                  <b style={{ color: n.health < 40 ? "#ff4655" : "#f4a100" }}>{Math.round(n.health)}%</b>
                </div>
              ))
            )}
          </HoverCard>
        </div>
      )}

      {tab === "sos" && (
        <HoverCard glow="amber" className="nx-admin-feed">
          {sos.length === 0 ? (
            <p className="nx-page-sub" style={{ textAlign: "center", padding: 24 }}>{t("admin_sos_empty")}</p>
          ) : (
            sos.map((r) => (
              <div key={r.id} className="nx-admin-feed-item">
                <div className="nx-admin-item-top">
                  <span className="nx-admin-item-name">SOS {r.id}</span>
                  <span className="nx-admin-item-status" style={{ color: STATUS_COLORS[r.status || r.response_status || "open"] }}>
                    {r.status || r.response_status || "open"}
                  </span>
                </div>
                <p className="nx-admin-item-preview">{r.message || "—"}</p>
                <span className="nx-admin-item-date">
                  {r.eta_minutes ? `${t("citizen_eta")} ${r.eta_minutes}${t("min")}` : ""} {formatDate(r.created_at || r.timestamp, locale)}
                </span>
                <div className="nx-admin-actions">
                  <GlowButton onClick={() => void handleSos(r.id, "dispatched")}>{t("admin_dispatch")}</GlowButton>
                  <button type="button" className="nx-tab" onClick={() => void handleSos(r.id, "resolved")}>
                    {t("admin_resolve")}
                  </button>
                </div>
              </div>
            ))
          )}
        </HoverCard>
      )}

      {tab === "intel" && (
        <HoverCard glow="cyan" className="nx-admin-feed">
          {intel.length === 0 ? (
            <p className="nx-page-sub" style={{ textAlign: "center", padding: 24 }}>{t("admin_intel_empty")}</p>
          ) : (
            intel.map((r) => (
              <div key={r.id} className="nx-admin-feed-item">
                <div className="nx-admin-item-top">
                  <span className="nx-admin-item-name">{r.category || "citizen_report"}</span>
                  <span className="nx-admin-item-status">{Math.round((r.credibility ?? 0) * 100)}%</span>
                </div>
                <p className="nx-admin-item-preview">{r.message || "—"}</p>
                <span className="nx-admin-item-date">{formatDate(r.timestamp, locale)}</span>
              </div>
            ))
          )}
        </HoverCard>
      )}

      {tab === "inbox" && (
        <div className="nx-admin-grid">
          <HoverCard glow="amber" className="nx-admin-inbox">
            <div className="nx-admin-inbox-head">
              <span className="nx-stat-label">{t("admin_inbox")}</span>
            </div>
            <div className="nx-admin-filters">
              {(["all", "new", "read", "replied", "archived"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`nx-tab${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {t(f === "all" ? "admin_filter_all" : `admin_status_${f}`)}
                </button>
              ))}
            </div>
            <div className="nx-admin-list">
              {filtered.length === 0 ? (
                <p className="nx-page-sub" style={{ textAlign: "center", padding: 24 }}>
                  {loading ? t("admin_loading") : t("admin_empty")}
                </p>
              ) : (
                filtered.map((msg) => (
                  <button
                    key={msg.id}
                    type="button"
                    className={`nx-admin-item${selected?.id === msg.id ? " active" : ""}${msg.status === "new" ? " unread" : ""}`}
                    onClick={() => void openMessage(msg)}
                  >
                    <div className="nx-admin-item-top">
                      <span className="nx-admin-item-name">{msg.name || t("admin_anonymous")}</span>
                      <span className="nx-admin-item-status" style={{ color: STATUS_COLORS[msg.status] ?? "var(--muted)" }}>
                        {t(`admin_status_${msg.status}`)}
                      </span>
                    </div>
                    <p className="nx-admin-item-preview">{msg.message.slice(0, 80)}{msg.message.length > 80 ? "…" : ""}</p>
                    <span className="nx-admin-item-date">{formatDate(msg.created_at, locale)}</span>
                  </button>
                ))
              )}
            </div>
          </HoverCard>

          <HoverCard glow="cyan" className="nx-admin-detail">
            {selected ? (
              <>
                <div className="nx-admin-detail-head">
                  <HexPulseRing color={STATUS_COLORS[selected.status] ?? "#4cc9f0"} size={80} />
                  <div>
                    <h2 className="nx-admin-detail-name">{selected.name || t("admin_anonymous")}</h2>
                    <a href={`mailto:${selected.email}`} className="nx-admin-detail-email">
                      {selected.email || "—"}
                    </a>
                    <span className="nx-admin-item-date">{formatDate(selected.created_at, locale)}</span>
                  </div>
                </div>
                <div className="nx-admin-detail-body">{selected.message}</div>
                <div className="nx-admin-actions">
                  {selected.status !== "read" && (
                    <GlowButton onClick={() => void setStatus("read")}>{t("admin_mark_read")}</GlowButton>
                  )}
                  {selected.status !== "replied" && (
                    <GlowButton onClick={() => void setStatus("replied")}>{t("admin_mark_replied")}</GlowButton>
                  )}
                  {selected.status !== "archived" && (
                    <button type="button" className="nx-tab" onClick={() => void setStatus("archived")}>
                      {t("admin_archive")}
                    </button>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}?subject=Re: NEXUS Contact`}>
                      <GlowButton>
                        <Icon3D name="send" size={14} />
                        {t("admin_reply_email")}
                      </GlowButton>
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="nx-admin-empty-detail">
                <HexPulseRing color="#f4a100" size={120} />
                <p className="nx-page-sub">{t("admin_select")}</p>
              </div>
            )}
          </HoverCard>
        </div>
      )}

      {tab === "controls" && (
        <HoverCard glow="amber" className="nx-admin-controls">
          <GlowButton onClick={() => void runControl("repair_all")}>{t("admin_repair_all")}</GlowButton>
          <GlowButton onClick={() => void runControl("cut_power")}>{t("admin_cut_power")}</GlowButton>
          <button type="button" className="nx-tab" onClick={() => void runControl("reset")}>
            {t("admin_reset_city")}
          </button>
          <Link to="/command">
            <GlowButton>{t("profile_command")}</GlowButton>
          </Link>
        </HoverCard>
      )}

      <p style={{ textAlign: "center", marginTop: 32 }}>
        <Link to="/profile" style={{ color: "var(--cyan)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon3D name="chevron-left" size={14} /> {t("admin_back")}
        </Link>
      </p>
    </main>
  );
}
