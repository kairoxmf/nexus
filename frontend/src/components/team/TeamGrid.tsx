import { Linkedin } from "lucide-react";
import type { TeamMember } from "../../data/site";

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => (
        <article key={member.name} className="group">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={member.image}
              alt={`Portrait of ${member.name}`}
              loading="lazy"
              className="zoom-img aspect-[3/3.4] w-full object-cover grayscale transition-all duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
            />
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-gold text-navy-abyss opacity-0 shadow-md transition-all duration-300 hover:bg-navy-darker hover:text-gold group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <h3 className="mt-4 text-[16px] font-extrabold text-ink">{member.name}</h3>
          <p className="mt-1 text-[12.5px] font-bold uppercase tracking-wider text-gold-dark">{member.role}</p>
        </article>
      ))}
    </div>
  );
}
