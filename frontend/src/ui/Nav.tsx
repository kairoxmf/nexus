import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { GlowButton } from "./GlowButton";
import { LangSwitch } from "./LangSwitch";

const LINKS = [
  { to: "/", key: "nav_home", end: true },
  { to: "/command", key: "nav_command" },
  { to: "/intel", key: "nav_intel" },
  { to: "/profile", key: "nav_profile" },
  { to: "/contact", key: "nav_contact" },
] as const;

export function Nav() {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <header className="nx-nav">
      <Link to="/" className="nx-logo">NEXUS</Link>

      <nav className="nx-nav-links">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={"end" in l ? l.end : undefined}
            className={({ isActive }) => `nx-nav-link${isActive ? " active" : ""}`}
            onMouseMove={(e) => {
              const target = e.currentTarget;
              const r = target.getBoundingClientRect();
              target.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
              target.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            {t(l.key)}
          </NavLink>
        ))}
      </nav>

      <div className="nx-nav-actions">
        <LangSwitch />
        {user?.authenticated ? (
          <>
            {user.role === "admin" && (
              <>
                <Link to="/admin" className="nx-nav-link">
                  {t("nav_admin_panel")}
                  <span className="nx-nav-admin-dot" aria-hidden />
                </Link>
                <span className="nx-nav-badge">{t("nav_admin")}</span>
              </>
            )}
            <button type="button" onClick={logout} className="nx-nav-link nx-nav-logout">
              {t("nav_logout")}
            </button>
          </>
        ) : (
          <Link to="/auth">
            <GlowButton>{t("nav_access")}</GlowButton>
          </Link>
        )}
      </div>
    </header>
  );
}
