import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Properties", to: "/properties" },
  { label: "About Us", to: "/#about" },
  { label: "Services", to: "/#services" },
  { label: "Team", to: "/#team" },
  { label: "Contact", to: "/contact" },
];

function Logo() {
  return (
    <Link to="/" className="hp-logo" aria-label="Horizon Properties — Home">
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden>
        <path
          d="M2 24 L12 10 L20 18 L26 12 L34 24"
          stroke="#C5A059"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 26 L34 26"
          stroke="#C5A059"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="12" cy="10" r="2" fill="#C5A059" />
      </svg>
      <span className="hp-logo-text">
        HORIZON<span className="hp-logo-dot">.</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isTransparent = isHome && !scrolled && !menuOpen;

  return (
    <>
      <header
        className={`hp-header ${isTransparent ? "hp-header-transparent" : "hp-header-solid"}`}
      >
        <div className="hp-header-inner">
          <Logo />

          <nav className="hp-header-nav" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive =
                link.to === "/"
                  ? location.pathname === "/"
                  : link.to.startsWith("/#")
                  ? false
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`hp-nav-link ${isActive ? "hp-nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hp-header-right">
            <a href="tel:+15552467890" className="hp-header-phone">
              <Phone size={16} strokeWidth={1.5} />
              <span>(555) 246-7890</span>
            </a>
            <button
              className="hp-header-burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`hp-mobile-menu ${menuOpen ? "hp-mobile-menu-open" : ""}`}>
        <div className="hp-mobile-menu-header">
          <Logo />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="hp-mobile-menu-close"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
        <nav className="hp-mobile-nav" aria-label="Mobile navigation">
          {navLinks.map((link, i) => (
            <Link
              key={link.label}
              to={link.to}
              className="hp-mobile-nav-link"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hp-mobile-menu-footer">
          <a href="tel:+15552467890" className="hp-mobile-phone">
            <Phone size={18} strokeWidth={1.5} />
            (555) 246-7890
          </a>
          <Link to="/contact" className="hp-btn hp-btn-primary hp-mobile-cta">
            Get in Touch
          </Link>
        </div>
      </div>
      {menuOpen && <div className="hp-mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
