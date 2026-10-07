import { Phone, Mail } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { team } from "../../data/content";

export function TeamSection() {
  return (
    <section className="hp-section hp-team" id="team" aria-labelledby="team-heading">
      <div className="hp-container">
        <ScrollReveal className="hp-team-header">
          <p className="hp-label-line">Our Team</p>
          <h2 className="hp-heading" id="team-heading">
            Meet the experts behind<br />every great transaction.
          </h2>
        </ScrollReveal>

        <div className="hp-team-grid">
          {team.map((member, i) => (
            <ScrollReveal key={member.id} delay={((i % 4) + 1) as 1 | 2 | 3 | 4} className="hp-team-card">
              <div className="hp-team-img hp-img-zoom">
                <img src={member.photo} alt={`${member.name} — ${member.role}`} loading="lazy" />
              </div>
              <div className="hp-team-info">
                <h3 className="hp-team-name">{member.name}</h3>
                <p className="hp-team-role">{member.role}</p>
                <div className="hp-team-links">
                  <a href={`tel:${member.phone}`} aria-label={`Call ${member.name}`}>
                    <Phone size={16} strokeWidth={1.5} />
                  </a>
                  <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`}>
                    <Mail size={16} strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
