import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Icon3D } from "@shared/icons";
import { HoverCard } from "../ui/HoverCard";
import { GlowButton } from "../ui/GlowButton";
import {
  ContactChannel,
  FloatingOrbs,
  HexPulseRing,
  ParticleField,
  RippleGlow,
  SignalRadar,
  TransmitSuccess,
} from "../components/creative/PageGraphics";
import { submitContactMessage } from "../lib/contactApi";
import { useI18n } from "../i18n";

const LOCAL_CONTACT_KEY = "nexus_contact_fallback";

function saveLocalContact(name: string, email: string, message: string) {
  try {
    const raw = localStorage.getItem(LOCAL_CONTACT_KEY);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    list.unshift({
      id: crypto.randomUUID().slice(0, 8),
      name: name.trim() || "Anonymous",
      email: email.trim(),
      message: message.trim(),
      status: "new",
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await submitContactMessage({ name, email, message });
    if (!ok) saveLocalContact(name, email, message);
    setSent(true);
    setBusy(false);
  };

  return (
    <main className="nx-page nx-contact-page px-6 py-12 mx-auto">
      <header className="nx-contact-header">
        <FloatingOrbs count={3} />
        <p className="nx-page-kicker">{t("contact_kicker")}</p>
        <h1 className="nx-page-title">{t("contact_title")}</h1>
        <p className="nx-page-sub">{t("contact_desc")}</p>
      </header>

      <div className="nx-contact-grid">
        <div className="nx-contact-visual">
          <HexPulseRing color="#4cc9f0" size={180} />
          <ParticleField color="#4cc9f0" />
          <SignalRadar />
          <RippleGlow active={sent} />
          <div className="pg-contact-channels">
            <ContactChannel icon="mail" title={t("contact_email_label")} value="ops@nexus.dc" />
            <ContactChannel icon="location" title={t("contact_location_label")} value={t("contact_location_value")} />
            <ContactChannel icon="clock" title={t("contact_hours_label")} value={t("contact_hours_value")} />
          </div>
        </div>

        <HoverCard glow="cyan" className="nx-contact-form-card">
          {sent ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <TransmitSuccess />
              <p style={{ fontFamily: "Orbitron", color: "var(--cyan)", fontSize: 18, marginBottom: 12 }}>
                {t("contact_success_title")}
              </p>
              <p className="nx-page-sub">{t("contact_success_body")}</p>
              <button type="button" className="nx-tab active" style={{ marginTop: 24 }} onClick={() => setSent(false)}>
                {t("contact_send_another")}
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void submit(e)} className="space-y-4">
              <input className="nx-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("contact_name")} />
              <input className="nx-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("contact_email")} />
              <textarea
                className="nx-input"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("contact_message")}
                style={{ resize: "vertical" }}
              />
              <GlowButton type="submit" disabled={busy} style={{ width: "100%" }}>
                <Icon3D name="send" size={14} />
                {busy ? t("contact_sending") : t("contact_send")}
              </GlowButton>
            </form>
          )}
        </HoverCard>
      </div>

      <p style={{ textAlign: "center", marginTop: 32 }}>
        <Link to="/" style={{ color: "var(--cyan)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon3D name="chevron-left" size={14} /> {t("contact_back")}
        </Link>
      </p>
    </main>
  );
}
