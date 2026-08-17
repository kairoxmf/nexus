import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon3D } from "@shared/icons";
import { useAuth } from "../context/AuthContext";
import { GlowButton } from "../ui/GlowButton";
import { useI18n } from "../i18n";

type Mode = "login" | "register";

const DEMO_ACCOUNTS = [
  { username: "commander", role: "admin", color: "#f4a100" },
  { username: "analyst", role: "analyst", color: "#4cc9f0" },
  { username: "citizen", role: "citizen", color: "#33c17a" },
] as const;

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  trailing,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  trailing?: ReactNode;
}) {
  const filled = value.length > 0;

  return (
    <label className={`nx-auth-field${filled ? " is-filled" : ""}`}>
      <span className="nx-auth-field-label">{label}</span>
      <div className="nx-auth-field-wrap">
        <input
          className="nx-auth-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
        {trailing}
      </div>
    </label>
  );
}

export function AuthPage() {
  const { login, register, isUsernameTaken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const from = (location.state as { from?: string } | null)?.from ?? "/profile";

  const [mode, setMode] = useState<Mode>("login");
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [goals, setGoals] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const strengthLabel =
    strength <= 1 ? t("auth_password_weak") : strength <= 2 ? t("auth_password_medium") : t("auth_password_strong");

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 520);
  };

  const fillDemo = (user: string) => {
    setMode("login");
    setUsername(user);
    setPassword("nexus123");
    setError("");
    setSuccess("");
  };

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch {
      setError(t("auth_invalid"));
      triggerShake();
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t("auth_password_mismatch"));
      triggerShake();
      return;
    }
    if (isUsernameTaken(username)) {
      setError(t("auth_username_taken"));
      triggerShake();
      return;
    }

    setBusy(true);
    try {
      await register({
        username: username.trim(),
        password,
        name,
        email,
        phone,
        goals: goals || t("auth_default_goals"),
      });
      setSuccess(t("auth_register_success"));
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(t("auth_fill_required"));
      triggerShake();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={`nx-auth-page${mounted ? " is-mounted" : ""}`}>
      <div className="nx-auth-bg">
        <div className="nx-auth-orb nx-auth-orb--1" />
        <div className="nx-auth-orb nx-auth-orb--2" />
        <div className="nx-auth-orb nx-auth-orb--3" />
        <div className="nx-auth-grid" />
      </div>

      <div className="nx-auth-layout">
        <aside className="nx-auth-brand">
          <p className="nx-auth-logo">NEXUS</p>
          <h1 className="nx-auth-brand-title">{t("auth_welcome")}</h1>
          <p className="nx-auth-brand-sub">{t("auth_welcome_sub")}</p>

          <ul className="nx-auth-features">
            {[
              t("home_f1_title"),
              t("home_f2_title"),
              t("home_f3_title"),
            ].map((feat, i) => (
              <li key={feat} className="nx-auth-feature" style={{ animationDelay: `${i * 0.12}s` }}>
                <span className="nx-auth-feature-dot" />
                {feat}
              </li>
            ))}
          </ul>

          <div className="nx-auth-demo-block">
            <p className="nx-auth-demo-label">{t("auth_demo_accounts")}</p>
            <div className="nx-auth-demo-chips">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  className="nx-auth-demo-chip"
                  style={{ ["--chip-color" as string]: acc.color }}
                  onClick={() => fillDemo(acc.username)}
                >
                  <span className="nx-auth-demo-role">{t(`auth_role_${acc.role}`)}</span>
                  <span className="nx-auth-demo-user">{acc.username}</span>
                </button>
              ))}
            </div>
            <p className="nx-auth-demo-hint">{t("auth_demo")}</p>
          </div>
        </aside>

        <section className={`nx-auth-panel${shake ? " is-shake" : ""}`}>
          <div className="nx-auth-panel-glow" />

          <div className="nx-auth-tabs">
            <div
              className="nx-auth-tab-slider"
              style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(100%)" }}
            />
            <button
              type="button"
              className={`nx-auth-tab${mode === "login" ? " active" : ""}`}
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            >
              {t("auth_signin")}
            </button>
            <button
              type="button"
              className={`nx-auth-tab${mode === "register" ? " active" : ""}`}
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            >
              {t("auth_register")}
            </button>
          </div>

          <p className="nx-auth-panel-sub">
            {mode === "login" ? t("auth_subtitle_login") : t("auth_subtitle_register")}
          </p>

          {success && (
            <div className="nx-auth-success">
              <Icon3D name="check" size={16} color="var(--green)" />
              {success}
            </div>
          )}

          {error && (
            <div className="nx-auth-error">
              <Icon3D name="warning" size={16} color="var(--red)" animated />
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={(e) => void submitLogin(e)} className="nx-auth-form">
              <AuthField
                label={t("auth_username")}
                value={username}
                onChange={setUsername}
                placeholder={t("auth_username")}
                autoComplete="username"
                required
              />
              <AuthField
                label={t("auth_password")}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder={t("auth_password")}
                autoComplete="current-password"
                required
                trailing={
                  <button
                    type="button"
                    className="nx-auth-toggle-pw"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("auth_hide_password") : t("auth_show_password")}
                  >
                    {showPassword ? t("auth_hide_password") : t("auth_show_password")}
                  </button>
                }
              />
              <GlowButton type="submit" className="nx-auth-submit" disabled={busy}>
                {busy ? (
                  <span className="nx-auth-loading">
                    <Icon3D name="loading" size={16} animated />
                    {t("auth_authenticating")}
                  </span>
                ) : (
                  <>
                    {t("auth_enter")}
                    <Icon3D name="chevron-right" size={14} />
                  </>
                )}
              </GlowButton>
            </form>
          ) : (
            <form onSubmit={(e) => void submitRegister(e)} className="nx-auth-form">
              <div className="nx-auth-form-row">
                <AuthField
                  label={t("auth_fullname")}
                  value={name}
                  onChange={setName}
                  placeholder={t("auth_fullname")}
                  autoComplete="name"
                  required
                />
                <AuthField
                  label={t("auth_username")}
                  value={username}
                  onChange={setUsername}
                  placeholder={t("auth_username")}
                  autoComplete="username"
                  required
                />
              </div>
              <AuthField
                label={t("auth_email")}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={t("auth_email")}
                autoComplete="email"
                required
              />
              <div className="nx-auth-form-row">
                <AuthField
                  label={t("auth_phone")}
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder={t("auth_phone")}
                  autoComplete="tel"
                />
                <AuthField
                  label={t("auth_goals")}
                  value={goals}
                  onChange={setGoals}
                  placeholder={t("auth_goals")}
                />
              </div>
              <AuthField
                label={t("auth_password")}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder={t("auth_password")}
                autoComplete="new-password"
                required
                trailing={
                  <button
                    type="button"
                    className="nx-auth-toggle-pw"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? t("auth_hide_password") : t("auth_show_password")}
                  </button>
                }
              />
              {password.length > 0 && (
                <div className="nx-auth-strength">
                  <div className="nx-auth-strength-bar">
                    <div
                      className="nx-auth-strength-fill"
                      style={{ width: `${(strength / 4) * 100}%` }}
                      data-level={strength <= 1 ? "weak" : strength <= 2 ? "medium" : "strong"}
                    />
                  </div>
                  <span className="nx-auth-strength-label">{strengthLabel}</span>
                </div>
              )}
              <AuthField
                label={t("auth_confirm_password")}
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder={t("auth_confirm_password")}
                autoComplete="new-password"
                required
              />
              <GlowButton type="submit" className="nx-auth-submit" disabled={busy}>
                {busy ? (
                  <span className="nx-auth-loading">
                    <Icon3D name="loading" size={16} animated />
                    {t("auth_registering")}
                  </span>
                ) : (
                  t("auth_create_profile")
                )}
              </GlowButton>
            </form>
          )}

          <p className="nx-auth-guest">
            <Link to="/command" className="nx-auth-guest-link">
              {t("auth_continue_guest")}
              <Icon3D name="chevron-right" size={14} />
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
