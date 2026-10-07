import { useState } from "react";
import { Phone, Mail, MapPin, ArrowRight, Check } from "lucide-react";
import { ScrollReveal } from "../../components/horizon/ScrollReveal";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="hp-page">
      <div className="hp-page-hero hp-section-navy">
        <div className="hp-container">
          <p className="hp-label-line">Get in Touch</p>
          <h1 className="hp-heading hp-text-ivory">Contact Us</h1>
          <p className="hp-body" style={{ color: "rgba(253,252,248,0.7)" }}>
            Let's start a conversation about your property journey.
          </p>
        </div>
      </div>

      <div className="hp-container hp-contact-content">
        <div className="hp-contact-grid">
          {/* Info */}
          <ScrollReveal className="hp-contact-info">
            <h2 className="hp-heading">Let's create something extraordinary together.</h2>
            <p className="hp-body" style={{ margin: "16px 0 40px" }}>
              Whether you're buying, selling, or investing, our team is ready to guide you
              with expertise and integrity.
            </p>

            <div className="hp-contact-items">
              <a href="tel:+15552467890" className="hp-contact-item">
                <div className="hp-contact-item-icon"><Phone size={20} strokeWidth={1.5} /></div>
                <div>
                  <span className="hp-contact-item-label">Phone</span>
                  <span className="hp-contact-item-val">(555) 246-7890</span>
                </div>
              </a>
              <a href="mailto:hello@horizonproperties.com" className="hp-contact-item">
                <div className="hp-contact-item-icon"><Mail size={20} strokeWidth={1.5} /></div>
                <div>
                  <span className="hp-contact-item-label">Email</span>
                  <span className="hp-contact-item-val">hello@horizonproperties.com</span>
                </div>
              </a>
              <div className="hp-contact-item">
                <div className="hp-contact-item-icon"><MapPin size={20} strokeWidth={1.5} /></div>
                <div>
                  <span className="hp-contact-item-label">Office</span>
                  <span className="hp-contact-item-val">1200 Architectural Plaza, Suite 500<br />New York, NY 10001</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal className="hp-contact-form-wrap" delay={2}>
            {submitted ? (
              <div className="hp-contact-success">
                <div className="hp-contact-success-icon">
                  <Check size={40} strokeWidth={1.5} />
                </div>
                <h3 className="hp-heading">Thank you!</h3>
                <p className="hp-body">Your message has been sent. We'll be in touch shortly.</p>
              </div>
            ) : (
              <form className="hp-contact-form" onSubmit={handleSubmit}>
                <h3 className="hp-heading" style={{ marginBottom: 24 }}>Send us a message</h3>
                <div className="hp-form-row">
                  <div className="hp-form-field">
                    <label htmlFor="name">Full Name</label>
                    <input id="name" type="text" placeholder="John Doe" required />
                  </div>
                  <div className="hp-form-field">
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                </div>
                <div className="hp-form-field">
                  <label htmlFor="phone">Phone Number</label>
                  <input id="phone" type="tel" placeholder="(555) 000-0000" />
                </div>
                <div className="hp-form-field">
                  <label htmlFor="interest">I'm interested in</label>
                  <select id="interest">
                    <option>Buying a property</option>
                    <option>Selling a property</option>
                    <option>Investment opportunities</option>
                    <option>Property valuation</option>
                    <option>Relocation services</option>
                  </select>
                </div>
                <div className="hp-form-field">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" placeholder="Tell us about your needs..." rows={5} required />
                </div>
                <button type="submit" className="hp-btn hp-btn-primary">
                  Send Message
                  <ArrowRight size={16} className="hp-btn-arrow" />
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
