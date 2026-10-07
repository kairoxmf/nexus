import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { INDUSTRIES } from "../../data/site";

/** Large visual industry cards with zoom + overlay hover treatment. */
export default function IndustriesSection({ limit }: { limit?: number }) {
  const items = limit ? INDUSTRIES.slice(0, limit) : INDUSTRIES;

  return (
    <section className="bg-mist py-20 lg:py-24">
      <div className="shell">
        <SectionHeading
          eyebrow="Industries We Serve"
          title="Sector Expertise That Runs Deep."
          description="From hospitals to harbors — dedicated teams, proven playbooks and the right specialists for every sector."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((industry, i) => (
            <Reveal key={industry.slug} delay={(i % 4) * 80}>
              <Link
                to={`/industries/${industry.slug}`}
                className="group relative block h-64 overflow-hidden rounded-lg focus-visible:outline-none"
              >
                <img
                  src={industry.image}
                  alt={industry.name}
                  loading="lazy"
                  className="zoom-img absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-navy-abyss/95 via-navy-abyss/35 to-navy-abyss/10 transition-colors duration-300 group-hover:from-navy-abyss group-hover:via-navy-abyss/50"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-[17px] font-extrabold text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                    {industry.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-white/70">
                    {industry.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wider text-gold opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
