import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import Logo from "../ui/Logo";
import { BRAND, SERVICES } from "../../data/site";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Industries", to: "/industries" },
  { label: "Careers", to: "/careers" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const SOCIALS = [
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-abyss text-white">
      <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
        {/* Brand */}
        <div className="lg:col-span-3">
          <Logo light />
          <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/60">
            We are a full-service construction company delivering high-quality projects across
            commercial, residential, and industrial sectors.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {SOCIALS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Built Right on ${label}`}
                className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white/70 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-navy-abyss"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer — quick links" className="lg:col-span-2">
          <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-gold">Quick Links</h3>
          <ul className="mt-5 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-[13.5px] font-semibold text-white/65 transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Services */}
        <nav aria-label="Footer — services" className="lg:col-span-2">
          <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-gold">Services</h3>
          <ul className="mt-5 space-y-2.5">
            {SERVICES.slice(0, 5).map((s) => (
              <li key={s.slug}>
                <Link
                  to={`/services/${s.slug}`}
                  className="text-[13.5px] font-semibold text-white/65 transition-colors hover:text-gold"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="lg:col-span-2">
          <h3 className="text-[13px] font-extrabold uppercase tracking-widest text-gold">Contact Us</h3>
          <ul className="mt-5 space-y-3.5 text-[13.5px] font-semibold text-white/65">
            <li>
              <a href={BRAND.phoneHref} className="flex items-center gap-2.5 transition-colors hover:text-gold">
                <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {BRAND.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2.5 transition-colors hover:text-gold">
                <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {BRAND.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>
                {BRAND.address1}
                <br />
                {BRAND.address2}
              </span>
            </li>
          </ul>
        </div>

        {/* Quote card */}
        <div className="rounded-xl border border-white/12 bg-navy-deep p-6 lg:col-span-3">
          <h3 className="text-lg font-extrabold">Request a Quote</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-white/60">
            Tell us about your project and we'll get back to you within one business day.
          </p>
          <Link to="/contact" className="btn btn-gold mt-5 w-full text-[13px]">
            Get a Free Quote
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-[12.5px] font-semibold text-white/50 sm:flex-row">
          <p>© 2026 Built Right Construction. All Rights Reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="transition-colors hover:text-gold">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-gold">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
