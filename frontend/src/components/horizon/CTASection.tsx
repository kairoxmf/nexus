import { Link } from "react-router-dom";
import { ArrowRight, Key } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function CTASection() {
  return (
    <section className="hp-cta" aria-labelledby="cta-heading">
      <div className="hp-container">
        <ScrollReveal className="hp-cta-inner">
          <div className="hp-cta-left">
            <div className="hp-cta-icon">
              <Key size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="hp-heading" id="cta-heading">
                Ready to Find Your<br />Perfect Property?
              </h2>
              <p className="hp-body hp-cta-text">
                Let our experts guide you to the right home or investment.
              </p>
            </div>
          </div>
          <Link to="/contact" className="hp-btn hp-btn-primary hp-cta-btn">
            Get in Touch
            <ArrowRight size={16} className="hp-btn-arrow" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
