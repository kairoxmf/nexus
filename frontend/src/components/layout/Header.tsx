import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Briefcase,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  Phone,
  ShieldCheck,
  Trophy,
  X,
} from "lucide-react";
import Logo from "../ui/Logo";
import { BRAND, NAV_LINKS, TOPBAR } from "../../data/site";

const TOPBAR_ICONS = [Trophy, Briefcase, ShieldCheck];
const SOCIALS = [
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* ---- Top information bar ---- */}
      <div className="bg-navy-abyss text-white">
        <div className="shell flex h-9 items-center justify-between gap-4 text-[11.5px] font-semibold">
          <div className="flex min-w-0 items-center gap-5">
            {TOPBAR.highlights.map((text, i) => (
              <span
                key={text}
                className={`hidden items-center gap-1.5 sm:inline-flex ${i === 0 ? "inline-flex" : ""}`}
              >
                <span className="text-gold" aria-hidden="true">
                  {TOPBAR_ICONS[i] && (() => { const Icon = TOPBAR_ICONS[i]; return <Icon className="h-3.5 w-3.5" strokeWidth={2} />; })()}
                </span>
                {text}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a
              href={BRAND.phoneHref}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gold"
            >
              <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={2} aria-hidden="true" />
              <span className="hidden xs:inline sm:inline">{BRAND.phone}</span>
            </a>
            <div className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden="true" />
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Built Right on ${label}`}
                  className="text-white/75 transition-colors hover:text-gold"
                >
                  <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Main navigation ---- */}
      <header
        className={`sticky top-0 z-50 border-b border-line bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-[0_6px_24px_-12px_rgba(14,27,44,0.18)]" : ""
        }`}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-6 lg:h-[76px]">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-6 xl:gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <div key={link.to} className="group relative">
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    `relative inline-flex items-center gap-1 py-2 text-[13.5px] font-bold tracking-wide transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-gold after:transition-all after:duration-300 ${
                      isActive
                        ? "text-navy-darker after:w-full"
                        : "text-ink/75 after:w-0 group-hover:after:w-full group-hover:text-gold-dark"
                    }`
                  }
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className="h-3.5 w-3.5 text-muted transition-transform duration-300 group-hover:rotate-180 group-hover:text-gold"
                      strokeWidth={2.4}
                      aria-hidden="true"
                    />
                  )}
                </NavLink>

                {link.children && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="overflow-hidden rounded-lg border border-line bg-white py-2 shadow-lifted">
                      {link.children.map((child) => (
                        <li key={child.to}>
                          <Link
                            to={child.to}
                            className="block border-l-2 border-transparent px-5 py-2.5 text-[13px] font-semibold text-ink/75 transition-colors hover:border-gold hover:bg-mist hover:text-navy-darker"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/contact" className="btn btn-gold hidden !px-5 !py-2.5 text-[13px] lg:inline-flex">
              Get a Quote
              <span aria-hidden="true" className="font-extrabold">
                →
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-lg border border-line text-navy-darker transition-colors hover:border-navy hover:bg-mist lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ---- Mobile menu ---- */}
      <div
        className={`fixed inset-0 z-[70] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-navy-abyss/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <nav
          aria-label="Mobile"
          className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-navy-darker px-7 pb-10 pt-6 text-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Logo light />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="grid h-11 w-11 place-items-center rounded-lg border border-white/20 text-white transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <ul className="mt-8 flex-1 space-y-1">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.to}
                className={`border-b border-white/10 transition-all duration-500 ${
                  open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
              >
                <div className="flex items-center justify-between">
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `block py-3.5 text-[15px] font-bold tracking-wide ${
                        isActive ? "text-gold" : "text-white/90 hover:text-gold"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                  {link.children && (
                    <button
                      type="button"
                      aria-label={`Toggle ${link.label} submenu`}
                      aria-expanded={expanded === link.to}
                      onClick={() => setExpanded(expanded === link.to ? null : link.to)}
                      className="grid h-9 w-9 place-items-center text-gold"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          expanded === link.to ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
                {link.children && (
                  <div
                    className={`grid transition-all duration-300 ${
                      expanded === link.to ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <ul className="overflow-hidden">
                      {link.children.map((child) => (
                        <li key={child.to}>
                          <NavLink
                            to={child.to}
                            className="block border-l-2 border-gold/40 py-2.5 pl-4 text-[13.5px] font-semibold text-white/70 transition-colors hover:border-gold hover:text-gold"
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-4">
            <Link to="/contact" className="btn btn-gold w-full">
              Get a Quote
              <span aria-hidden="true" className="font-extrabold">
                →
              </span>
            </Link>
            <a
              href={BRAND.phoneHref}
              className="flex items-center justify-center gap-2 text-sm font-bold text-white/80"
            >
              <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
              {BRAND.phone}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
