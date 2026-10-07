import { ScrollReveal } from "./ScrollReveal";
import { ServiceIcon } from "./ServiceIcon";
import { services } from "../../data/content";

export function ServicesSection() {
  return (
    <section className="hp-section hp-services hp-section-navy" id="services" aria-labelledby="services-heading">
      <div className="hp-container">
        <ScrollReveal className="hp-services-header">
          <p className="hp-label-line">Our Services</p>
          <h2 className="hp-heading" id="services-heading">
            Complete design solutions<br />for every space.
          </h2>
        </ScrollReveal>

        <div className="hp-services-grid">
          {services.map((service, i) => (
            <ScrollReveal key={service.id} delay={((i % 3) + 1) as 1 | 2 | 3} className="hp-service-card">
              <div className="hp-service-icon">
                <ServiceIcon name={service.icon} size={28} />
              </div>
              <h3 className="hp-service-title">{service.title}</h3>
              <p className="hp-service-desc">{service.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
