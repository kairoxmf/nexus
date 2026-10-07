import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, MapPin, Ruler } from "lucide-react";
import type { Project } from "../../data/site";

/** Premium project card used in grids across the site. */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group block overflow-hidden rounded-lg border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted focus-visible:outline-none"
      aria-label={`${project.title} — view project`}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="zoom-img h-full w-full object-cover"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-navy-abyss/0 transition-colors duration-300 group-hover:bg-navy-abyss/25"
          aria-hidden="true"
        />
        <span className="absolute left-3 top-3 rounded bg-gold px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-navy-abyss shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
          {project.category}
        </span>
        <span
          className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-gold text-navy-abyss opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          aria-hidden="true"
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-[17px] font-extrabold text-ink transition-transform duration-300 group-hover:translate-x-1">
          {project.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
          {project.location}
        </p>
        <div className="mt-4 flex items-center gap-5 border-t border-line pt-3.5 text-[12.5px] font-bold text-ink/70">
          <span className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
            {project.sqft}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
            {project.year}
          </span>
        </div>
      </div>
    </Link>
  );
}
