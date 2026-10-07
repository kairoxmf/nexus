import { ScrollReveal } from "./ScrollReveal";
import { whyChoose } from "../../data/content";

export function WhyChooseSection() {
  return (
    <section className="hp-section hp-why" id="why-choose" aria-labelledby="why-heading">
      <div className="hp-container">
        <ScrollReveal className="hp-why-header">
          <p className="hp-label-line">Why Horizon</p>
          <h2 className="hp-heading" id="why-heading">
            A standard above the rest.
          </h2>
        </ScrollReveal>

        <div className="hp-why-grid">
          {whyChoose.map((item, i) => (
            <ScrollReveal key={item.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} className="hp-why-card">
              <div className="hp-why-stat">{item.stat}</div>
              <div className="hp-why-stat-label">{item.statLabel}</div>
              <div className="hp-divider-champagne hp-why-divider" />
              <h3 className="hp-why-title">{item.title}</h3>
              <p className="hp-body hp-why-desc">{item.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
