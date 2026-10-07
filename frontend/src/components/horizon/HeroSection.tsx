import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { heroImage } from "../../data/content";

export function HeroSection() {
  return (
    <section className="hp-hero" aria-label="Hero">
      <div className="hp-hero-bg">
        <img src={heroImage} alt="Modern luxury villa at dusk with infinity pool" />
        <div className="hp-hero-overlay" />
      </div>

      <div className="hp-hero-content">
        <div className="hp-hero-text">
          <p className="hp-label-line hp-hero-label">Premium Real Estate &amp; Investments</p>
          <h1 className="hp-display hp-hero-title">
            Discover Exceptional
            <br />
            Homes &amp; Investments
          </h1>
          <p className="hp-hero-sub">
            Premium properties in prime locations. Find your dream home
            or the perfect investment with confidence.
          </p>
          <div className="hp-hero-cta">
            <Link to="/properties" className="hp-btn hp-btn-light">
              Explore Properties
              <ArrowRight size={16} className="hp-btn-arrow" />
            </Link>
            <Link to="/contact" className="hp-btn hp-btn-ghost">
              Book a Consultation
              <ArrowRight size={16} className="hp-btn-arrow" />
            </Link>
          </div>
        </div>
      </div>

      <div className="hp-hero-scroll">
        <span>Scroll</span>
        <div className="hp-hero-scroll-line" />
      </div>
    </section>
  );
}
