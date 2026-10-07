import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "./ScrollReveal";
import { aboutMainImage, aboutSecondaryImage } from "../../data/content";

export function AboutSection() {
  return (
    <section className="hp-section hp-about" id="about" aria-labelledby="about-heading">
      <div className="hp-container">
        <div className="hp-about-grid">
          {/* Left: Text */}
          <ScrollReveal className="hp-about-text">
            <p className="hp-label-line">About Us</p>
            <h2 className="hp-heading" id="about-heading">
              Who We Are
            </h2>
            <p className="hp-body hp-about-body">
              At Horizon Properties, we connect people with extraordinary homes and smart
              investments. Integrity, transparency, and client satisfaction are at the
              heart of everything we do.
            </p>
            <p className="hp-body hp-about-body">
              With over two decades of experience in luxury real estate, our team brings
              deep market knowledge, an unwavering commitment to quality, and a
              client-first philosophy to every transaction.
            </p>
            <Link to="/contact" className="hp-btn hp-btn-primary hp-about-cta">
              Learn More
              <ArrowRight size={16} className="hp-btn-arrow" />
            </Link>
          </ScrollReveal>

          {/* Right: Image composition */}
          <ScrollReveal className="hp-about-images" delay={2}>
            <div className="hp-about-img-main hp-img-zoom">
              <img
                src={aboutMainImage}
                alt="Luxury modern home with pool — architectural photography"
                loading="lazy"
              />
            </div>
            <div className="hp-about-img-secondary hp-img-zoom">
              <img
                src={aboutSecondaryImage}
                alt="Modern luxury interior with warm lighting"
                loading="lazy"
              />
            </div>
            <button className="hp-about-arrow" aria-label="Explore our work">
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
