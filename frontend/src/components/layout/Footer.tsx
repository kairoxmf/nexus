import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send, X as CloseIcon } from "lucide-react";
import Logo from "../ui/Logo";
import { ADDRESS, EMAIL, NAV_LINKS, PHONE, PHONE_HREF } from "../../data/site";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com", Icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: Linkedin },
  { label: "X", href: "https://x.com", Icon: CloseIcon },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubscribed(true);
  };

  return (
    <footer className="bg-navy-abyss text-white/70">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1.3fr] lg:py-20">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
            Horizon Properties is a premium real estate agency connecting clients
            with extraordinary homes and smart investments in prime locations.
          </p>
          <div className="mt-7 flex gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-navy-abyss"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
            Explore
          </h3>
          <ul className="mt-6 space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm transition-colors duration-200 hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
            Contact
          </h3>
          <ul className="mt-6 space-y-4 text-sm">
            <li>
              <a href={PHONE_HREF} className="flex items-start gap-3 transition-colors hover:text-gold">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 transition-colors hover:text-gold">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {EMAIL}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{ADDRESS}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
            Newsletter
          </h3>
          <p className="mt-6 text-sm leading-relaxed text-white/55">
            Off-market listings and market insight, delivered monthly.
          </p>
          {subscribed ? (
            <p className="mt-5 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold-soft">
              Thank you — you're on the list.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-5" noValidate>
              <div className="flex overflow-hidden rounded-lg border border-white/15 bg-white/5 focus-within:border-gold">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="grid w-12 shrink-0 place-items-center bg-gold text-navy-abyss transition-colors hover:bg-gold-soft"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {error && <p className="mt-2 text-xs font-semibold text-red-300">{error}</p>}
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Horizon Properties. All rights reserved.</p>
          <p>Equal Housing Opportunity — License #RB-448210</p>
        </div>
      </div>
    </footer>
  );
}
