import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import Reveal from "../ui/Reveal";
import { TEAM, type TeamMember } from "../../data/site";

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  return (
    <Reveal delay={index * 80}>
      <article className="group">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={member.photo}
            alt={`Portrait of ${member.name}`}
            loading="lazy"
            className="zoom-img aspect-[3/4] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex translate-y-3 justify-center gap-2 bg-gradient-to-t from-navy-abyss/85 to-transparent p-5 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <a
              href={`mailto:${member.email}`}
              aria-label={`Email ${member.name}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-navy-abyss"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
              aria-label={`Call ${member.name}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-navy-abyss"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-navy-abyss"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.88 2.65 4.88 6.1V24h-4v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.23 2.2-3.23 4.45V24h-4V8z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="mt-5 text-center">
          <h3 className="text-lg font-extrabold text-ink">{member.name}</h3>
          <p className="mt-1 text-sm font-semibold text-gold">{member.role}</p>
        </div>
      </article>
    </Reveal>
  );
}

export default function TeamGrid({ members = TEAM }: { members?: TeamMember[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member, i) => (
        <TeamCard key={member.id} member={member} index={i} />
      ))}
    </div>
  );
}
