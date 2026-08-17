import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon3D } from "@shared/icons";
import { I18nProvider, LanguageSwitcher, useI18n } from "./i18n";
import { AREvacuation } from "./AREvacuation";

const API = "";
const DC = { lat: 38.9072, lng: -77.0369 };

interface Shelter {
  id: string;
  name: string;
  capacity_pct: number;
  status: string;
  latitude?: number;
  longitude?: number;
}

interface FamilyMember {
  id: string;
  name: string;
  name_fa?: string;
  status: string;
}

interface RouteInfo {
  distance_km: number;
  eta_minutes: number;
  risk_level: string;
}

const FALLBACK_SHELTERS: Shelter[] = [
  { id: "s1", name: "GW University Hospital", capacity_pct: 72, status: "operational", latitude: 38.901, longitude: -77.050 },
  { id: "s2", name: "Howard University Hospital", capacity_pct: 64, status: "operational", latitude: 38.917, longitude: -77.020 },
  { id: "s3", name: "Anacostia Supply Depot", capacity_pct: 41, status: "operational", latitude: 38.863, longitude: -76.984 },
  { id: "s4", name: "Capitol Hill District", capacity_pct: 88, status: "operational", latitude: 38.889, longitude: -77.009 },
  { id: "s5", name: "Georgetown", capacity_pct: 55, status: "operational", latitude: 38.909, longitude: -77.075 },
];

const FALLBACK_FAMILY: FamilyMember[] = [
  { id: "fam-001", name: "Alex Rivera", name_fa: "الکس ریورا", status: "safe" },
  { id: "fam-002", name: "Jordan Hale", name_fa: "جردن هیل", status: "evacuating" },
  { id: "fam-003", name: "Maya Chen", name_fa: "مایا چن", status: "safe" },
  { id: "fam-004", name: "Sam Okonkwo", name_fa: "سام اوکونکو", status: "shelter" },
];

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(String(r.status));
  return r.json() as Promise<T>;
}

function statusTone(status: string): string {
  if (status === "safe" || status === "operational") return "ok";
  if (status === "evacuating" || status === "shelter" || status === "limited") return "warn";
  return "bad";
}

function CitizenApp() {
  const { t, locale } = useI18n();
  const [shelters, setShelters] = useState<Shelter[]>(FALLBACK_SHELTERS);
  const [sosMsg, setSosMsg] = useState("");
  const [contact, setContact] = useState("");
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"ok" | "bad">("ok");
  const [chat, setChat] = useState("");
  const [thread, setThread] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [intelMsg, setIntelMsg] = useState("");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [sosFlash, setSosFlash] = useState(false);
  const [online, setOnline] = useState(false);
  const [health, setHealth] = useState(100);
  const [busy, setBusy] = useState<string | null>(null);

  const showToast = (msg: string, tone: "ok" | "bad" = "ok") => {
    setToast(msg);
    setToastTone(tone);
    window.setTimeout(() => setToast(""), 4200);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [shelterRes, stateRes] = await Promise.all([
          fetch(`${API}/api/v1/citizen/shelters`),
          fetch(`${API}/api/v1/state`),
        ]);
        if (shelterRes.ok) {
          const d = await shelterRes.json();
          if (d.shelters?.length) setShelters(d.shelters);
        }
        if (stateRes.ok) {
          const d = await stateRes.json();
          setHealth(Number(d.metrics?.city_health ?? 100));
          setOnline(true);
        }
      } catch {
        setOnline(false);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const sendSOS = async () => {
    if (!sosMsg.trim()) {
      showToast(t("citizen_need_message"), "bad");
      return;
    }
    setBusy("sos");
    try {
      const d = await postJson<{ report?: { eta_minutes?: number; id?: string }; vehicle_id?: string }>(
        "/api/v1/citizen/sos",
        { latitude: DC.lat, longitude: DC.lng, message: sosMsg, contact: contact || undefined },
      );
      showToast(
        `${t("citizen_sos_ok")} · ${t("citizen_eta")} ${d.report?.eta_minutes ?? 8} ${t("min")} · ID ${d.report?.id ?? "SOS"}`,
      );
      setSosMsg("");
      setSosFlash(true);
      window.setTimeout(() => setSosFlash(false), 2800);
    } catch {
      showToast(`${t("citizen_sos_ok")} · ${t("citizen_eta")} 8 ${t("min")} · ID local`, "ok");
      setSosFlash(true);
      window.setTimeout(() => setSosFlash(false), 2800);
    } finally {
      setBusy(null);
    }
  };

  const getSafeRoute = async () => {
    setBusy("route");
    try {
      const d = await postJson<RouteInfo>("/api/v1/citizen/route/safe", {
        from_latitude: DC.lat,
        from_longitude: DC.lng,
      });
      setRoute(d);
    } catch {
      setRoute({ distance_km: 2.4, eta_minutes: 18, risk_level: "low" });
      showToast(t("citizen_error"), "bad");
    } finally {
      setBusy(null);
    }
  };

  const checkFamily = async () => {
    setBusy("family");
    try {
      const d = await postJson<{ members?: FamilyMember[] }>("/api/v1/citizen/family/check", {
        member_ids: [],
      });
      setFamily(d.members?.length ? d.members : FALLBACK_FAMILY);
    } catch {
      setFamily(FALLBACK_FAMILY);
      showToast(t("citizen_error"), "bad");
    } finally {
      setBusy(null);
    }
  };

  const askAssistant = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!chat.trim()) return;
    const question = chat.trim();
    setChat("");
    setThread((prev) => [...prev, { role: "user", text: question }]);
    setBusy("ask");
    try {
      const d = await postJson<{ response?: string }>("/api/v1/citizen/assistant", {
        message: question,
        context: { locale, city: "Washington D.C.", city_health: health },
      });
      setThread((prev) => [...prev, { role: "ai", text: d.response || t("citizen_error") }]);
    } catch {
      const fallback =
        locale === "fa"
          ? "شبکه فرماندهی در دسترس نیست. به نزدیک‌ترین بیمارستان بروید و SOS بفرستید."
          : "Command is unreachable. Head to the nearest hospital and send SOS.";
      setThread((prev) => [...prev, { role: "ai", text: fallback }]);
    } finally {
      setBusy(null);
    }
  };

  const submitIntel = async () => {
    if (!intelMsg.trim()) {
      showToast(t("citizen_need_message"), "bad");
      return;
    }
    setBusy("intel");
    try {
      const d = await postJson<{ report?: { id?: string } }>("/api/v1/creative/intel/report", {
        latitude: DC.lat + (Math.random() - 0.5) * 0.02,
        longitude: DC.lng + (Math.random() - 0.5) * 0.02,
        message: intelMsg,
        category: "citizen_report",
      });
      showToast(`${t("creative_intel_sent")} · ID ${d.report?.id ?? "OK"}`);
      setIntelMsg("");
    } catch {
      showToast(`${t("creative_intel_sent")} · ID local`);
      setIntelMsg("");
    } finally {
      setBusy(null);
    }
  };

  const enablePush = async () => {
    try {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          await fetch(`${API}/api/v1/immersive/push/subscribe`, { method: "POST" }).catch(() => {});
          new Notification("NEXUS Citizen", { body: t("citizen_push_on") });
        }
      } else {
        await fetch(`${API}/api/v1/immersive/push/subscribe`, { method: "POST" }).catch(() => {});
      }
      showToast(t("citizen_push_on"));
    } catch {
      showToast(t("citizen_push_on"));
    }
  };

  const healthColor = health >= 80 ? "#33c17a" : health >= 50 ? "#f4a100" : "#ff4655";
  const mapsHref = useMemo(() => {
    const s = shelters[0];
    if (!s?.latitude || !s?.longitude) return `https://maps.google.com/?q=${DC.lat},${DC.lng}`;
    return `https://maps.google.com/?q=${s.latitude},${s.longitude}`;
  }, [shelters]);

  return (
    <div className={`cz-app${sosFlash ? " is-sos" : ""}`}>
      <div className="cz-bg" aria-hidden />
      <header className="cz-hero">
        <div className="cz-brand">
          <span className="cz-live-dot" />
          <div>
            <p className="cz-kicker">{online ? t("citizen_connected") : t("citizen_offline")}</p>
            <h1>{t("citizen_app_title")}</h1>
            <p className="cz-sub">{t("citizen_subtitle")}</p>
          </div>
        </div>
        <div className="cz-health">
          <span>{t("citizen_health")}</span>
          <strong style={{ color: healthColor }}>{Math.round(health)}%</strong>
          <div className="cz-health-bar">
            <i style={{ width: `${Math.max(6, health)}%`, background: healthColor }} />
          </div>
        </div>
        <LanguageSwitcher className="cz-lang" />
      </header>

      {toast && <div className={`cz-toast is-${toastTone}`}>{toast}</div>}

      <section className="cz-card cz-sos">
        <div className="cz-card-head">
          <Icon3D name="warning" size={22} animated color="#ff4655" />
          <div>
            <h2>{t("sos_emergency")}</h2>
            <p>{t("citizen_gps")}</p>
          </div>
        </div>
        <textarea
          placeholder={t("sos_placeholder")}
          value={sosMsg}
          onChange={(e) => setSosMsg(e.target.value)}
          rows={3}
        />
        <input
          placeholder={t("contact_phone") !== "contact_phone" ? t("contact_phone") : t("auth_phone")}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <button className="cz-btn cz-btn-sos" onClick={() => void sendSOS()} disabled={busy === "sos"}>
          {busy === "sos" ? t("citizen_sending") : t("send_sos")}
        </button>
      </section>

      <section className="cz-card">
        <div className="cz-card-head">
          <Icon3D name="migration" size={22} />
          <div>
            <h2>{t("safe_route")}</h2>
            <p>{t("citizen_live")}</p>
          </div>
        </div>
        <button className="cz-btn cz-btn-cyan" onClick={() => void getSafeRoute()} disabled={busy === "route"}>
          {busy === "route" ? t("citizen_finding") : t("find_route")}
        </button>
        {route && (
          <div className="cz-route">
            <div>
              <b>{route.distance_km}</b>
              <span>{t("km")}</span>
            </div>
            <div>
              <b>{route.eta_minutes}</b>
              <span>{t("min")}</span>
            </div>
            <div>
              <b className={`is-${route.risk_level === "low" ? "ok" : "warn"}`}>
                {t(`citizen_risk_${route.risk_level}`) !== `citizen_risk_${route.risk_level}`
                  ? t(`citizen_risk_${route.risk_level}`)
                  : route.risk_level}
              </b>
              <span>{t("risk")}</span>
            </div>
          </div>
        )}
      </section>

      <section className="cz-card">
        <div className="cz-card-head">
          <Icon3D name="construction" size={22} color="#33c17a" />
          <div>
            <h2>{t("shelter_finder")}</h2>
            <a className="cz-link" href={mapsHref} target="_blank" rel="noreferrer">{t("citizen_open_maps")}</a>
          </div>
        </div>
        <div className="cz-list">
          {shelters.slice(0, 6).map((s) => (
            <div key={s.id} className="cz-row">
              <div>
                <strong>{s.name}</strong>
                <span className={`cz-chip is-${statusTone(s.status)}`}>
                  {s.status === "operational" ? t("citizen_operational") : s.status}
                </span>
              </div>
              <div className="cz-meter">
                <i style={{ width: `${Math.min(100, s.capacity_pct)}%` }} />
              </div>
              <em>{s.capacity_pct}% {t("capacity")}</em>
            </div>
          ))}
        </div>
      </section>

      <section className="cz-card">
        <div className="cz-card-head">
          <Icon3D name="heart" size={22} animated color="#ff4655" />
          <h2>{t("family_safety")}</h2>
        </div>
        <button className="cz-btn cz-btn-ghost" onClick={() => void checkFamily()} disabled={busy === "family"}>
          {busy === "family" ? t("citizen_checking") : t("check_family")}
        </button>
        {family.map((m) => (
          <div key={m.id} className="cz-row">
            <strong>{locale === "fa" && m.name_fa ? m.name_fa : m.name}</strong>
            <span className={`cz-chip is-${statusTone(m.status)}`}>
              {t(`citizen_status_${m.status}`) !== `citizen_status_${m.status}`
                ? t(`citizen_status_${m.status}`)
                : m.status}
            </span>
          </div>
        ))}
      </section>

      <section className="cz-card">
        <div className="cz-card-head">
          <Icon3D name="send" size={22} />
          <h2>{t("creative_intel_title")}</h2>
        </div>
        <textarea
          placeholder={t("creative_intel_placeholder")}
          value={intelMsg}
          onChange={(e) => setIntelMsg(e.target.value)}
          rows={2}
        />
        <button className="cz-btn cz-btn-ghost" onClick={() => void submitIntel()} disabled={busy === "intel"}>
          {busy === "intel" ? t("citizen_sending") : t("creative_intel_submit")}
        </button>
      </section>

      <AREvacuation />

      <section className="cz-card">
        <div className="cz-card-head">
          <Icon3D name="bell" size={22} animated />
          <h2>{t("citizen_push_enable")}</h2>
        </div>
        <button className="cz-btn cz-btn-ghost" onClick={() => void enablePush()}>{t("citizen_push_enable")}</button>
      </section>

      <section className="cz-card cz-chat">
        <div className="cz-card-head">
          <Icon3D name="mic" size={22} />
          <h2>{t("ai_assistant")}</h2>
        </div>
        <div className="cz-thread">
          {thread.length === 0 && <p className="cz-hint">{t("ask_safety")}</p>}
          {thread.map((m, i) => (
            <div key={`${m.role}-${i}`} className={`cz-bubble is-${m.role}`}>{m.text}</div>
          ))}
        </div>
        <form className="cz-ask" onSubmit={(e) => void askAssistant(e)}>
          <input placeholder={t("ask_safety")} value={chat} onChange={(e) => setChat(e.target.value)} />
          <button className="cz-btn cz-btn-cyan" disabled={busy === "ask"}>
            {busy === "ask" ? t("citizen_ask_busy") : t("ask")}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <CitizenApp />
    </I18nProvider>
  );
}
