import { useState } from "react";
import { useI18n } from "../i18n";

const API = import.meta.env.VITE_API_URL ?? "";

interface Props {
  onLogin: (token: string, role: string) => void;
}

export function LoginPanel({ onLogin }: Props) {
  const { t } = useI18n();
  const [username, setUsername] = useState("commander");
  const [password, setPassword] = useState("nexus123");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const submit = async () => {
    setError("");
    try {
      const r = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok) throw new Error("Login failed");
      const data = await r.json();
      localStorage.setItem("nexus_token", data.access_token);
      localStorage.setItem("nexus_role", data.role);
      onLogin(data.access_token, data.role);
      setOpen(false);
    } catch {
      setError("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_role");
    onLogin("", "");
    setOpen(false);
  };

  const token = localStorage.getItem("nexus_token");

  return (
    <div style={{ position: "relative" }}>
      <button className="btn-ghost" style={{ width: "auto", padding: "6px 12px", margin: 0 }} onClick={() => setOpen(!open)}>
        {token ? t("logout") : t("login")}
      </button>
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          background: "var(--panel-2)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          padding: 12,
          minWidth: 220,
          zIndex: 100,
        }}>
          {token ? (
            <button className="btn-ghost" onClick={logout}>{t("logout")}</button>
          ) : (
            <>
              <label className="field">{t("username")}</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", marginBottom: 8, padding: 6, background: "var(--bg)", border: "1px solid var(--line)", color: "var(--text)" }} />
              <label className="field">{t("password")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", marginBottom: 8, padding: 6, background: "var(--bg)", border: "1px solid var(--line)", color: "var(--text)" }} />
              <button className="btn-primary" onClick={submit}>{t("login")}</button>
              <div className="hint" style={{ marginTop: 6 }}>{t("login_demo")}</div>
              {error && <div style={{ color: "var(--red)", fontSize: 10, marginTop: 6 }}>{error}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
