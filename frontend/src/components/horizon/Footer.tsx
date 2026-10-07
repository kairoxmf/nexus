import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowRight, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const footerNav = [
  { label: "Home", to: "/" },
  { label: "Properties", to: "/properties" },
  { label: "About Us", to: "/#about" },
  { label: "Services", to: "/#services" },
  { label: "Team", to: "/#team" },
  { label: "Contact", to: "/contact" },
];

function FooterLogo() {
  return (
    <Link to="/" className="hp-logo" aria-label="Horizon Properties — Home">
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden>
        <path d="M2 24 L12 10 L20 18 L26 12 L34 24" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 26 L34 26" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <circle cx="12" cy="10" r="2" fill="#C5A059" />
      </svg>
      <span className="hp-logo-text hp-logo-text-light">
        HORIZON<span className="hp-logo-dot">.</span>
      </span>
    </Link>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="hp-footer">
      <div className="hp-container">
        <div className="hp-footer-grid">
          {/* Brand + Newsletter */}
          <div className="hp-footer-col hp-footer-brand">
            <FooterLogo />
            <p className="hp-footer-desc">
              Horizon Properties connects discerning clients with extraordinary homes and
              smart investments. Integrity, transparency, and client satisfaction drive
              everything we do.
            </p>
            <form className="hp-footer-newsletter" onSubmit={handleSubscribe}>
              <label htmlFor="newsletter-email" className="hp-footer-newsletter-label">
                Newsletter
              </label>
              <div className="hp-footer-newsletter-input">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" aria-label="Subscribe">
                  <ArrowRight size={18} />
                </button>
              </div>
              {subscribed && (
                <span className="hp-footer-newsletter-success">
                  Thank you for subscribing.
                </span>
              )}
            </form>
          </div>

          {/* Navigation */}
          <div className="hp-footer-col">
            <h4 className="hp-footer-heading">Navigation</h4>
            <ul className="hp-footer-links">
              {footerNav.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="hp-footer-col">
            <h4 className="hp-footer-heading">Contact</h4>
            <ul className="hp-footer-contact">
              <li>
                <Phone size={16} strokeWidth={1.5} />
                <a href="tel:+15552467890">(555) 246-7890</a>
              </li>
              <li>
                <Mail size={16} strokeWidth={1.5} />
                <a href="mailto:hello@horizonproperties.com">hello@horizonproperties.com</a>
              </li>
              <li>
                <MapPin size={16} strokeWidth={1.5} />
                <span>1200 Architectural Plaza, Suite 500<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="hp-footer-col">
            <h4 className="hp-footer-heading">Follow Us</h4>
            <div className="hp-footer-social">
              <a href="#" aria-label="Facebook"><Facebook size={18} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={18} strokeWidth={1.5} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={18} strokeWidth={1.5} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={18} strokeWidth={1.5} /></a>
            </div>
          </div>
        </div>

        <div className="hp-footer-bottom">
          <p>© {new Date().getFullYear()} Horizon Properties. All rights reserved.</p>
          <div className="hp-footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
