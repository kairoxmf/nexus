import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import Logo from "../ui/Logo";
import { NAV_LINKS, PHONE, PHONE_HREF } from "../../data/site";

export default function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const solid = !isHome || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-navy-darker/95 shadow-lg shadow-navy-abyss/30 backdrop-blur-md"
          : "bg-gradient-to-b from-navy-abyss/70 via-navy-abyss/25 to-transparent"
      }`}
    >
      <div className="shell flex h-[74px] items-center justify-between gap-6 lg:h-[80px]">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex xl:gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `relative py-2 text-[13.5px] font-semibold tracking-wide transition-colors duration-200 hover:text-gold ${
                  isActive
                    ? "text-gold after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-5 after:rounded-full after:bg-gold"
                    : "text-white/85"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={PHONE_HREF}
            className="hidden items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-navy-abyss xl:inline-flex"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {PHONE}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-navy-abyss/70 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-navy-darker shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col gap-1 overflow-y-auto px-6 py-8">
            {NAV_LINKS.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                style={{ transitionDelay: `${i * 40}ms` }}
                className={({ isActive }) =>
                  `border-b border-white/5 py-4 text-lg font-bold tracking-wide transition-colors ${
                    isActive ? "text-gold" : "text-white/90 hover:text-gold"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-3 px-6 pb-10">
            <Link
              to="/contact"
              className="btn btn-gold w-full"
              onClick={() => setOpen(false)}
            >
              Get in Touch
            </Link>
            <a href={PHONE_HREF} className="btn btn-outline-light w-full">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {PHONE}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
