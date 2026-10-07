import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { PropertyCarousel } from "./PropertyCarousel";
import { properties } from "../../data/properties";

export function FeaturedPropertiesSection() {
  const featured = properties.filter((p) => p.featured);
  const allProps = featured.length >= 4 ? featured : properties.slice(0, 6);

  return (
    <section className="hp-section hp-featured" id="featured" aria-labelledby="featured-heading">
      <div className="hp-container">
        <ScrollReveal className="hp-featured-header">
          <div>
            <p className="hp-label-line">Featured</p>
            <h2 className="hp-heading" id="featured-heading">
              Featured Properties
            </h2>
          </div>
          <Link to="/properties" className="hp-featured-link">
            View All Properties
            <ArrowRight size={16} />
          </Link>
        </ScrollReveal>
      </div>
      <ScrollReveal delay={1}>
        <PropertyCarousel properties={allProps} />
      </ScrollReveal>
    </section>
  );
}
