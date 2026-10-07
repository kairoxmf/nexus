import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import CtaSection from "../components/common/CtaSection";
import NotFound from "./NotFound";
import { INDUSTRIES, PROJECTS, getIndustry } from "../data/site";
import ProjectCard from "../components/projects/ProjectCard";

export default function IndustryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustry(slug) : undefined;
  if (!industry) return <NotFound />;

  const sectorProjects = PROJECTS.filter((p) => p.industry === industry.slug).slice(0, 3);
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug).slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={industry.name}
        description={industry.description}
      />

      <section className="py-16 lg:py-20">
        <div className="shell grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="overflow-hidden rounded-xl">
            <img
              src={industry.image}
              alt={`${industry.name} construction`}
              loading="lazy"
              className="zoom-img aspect-[16/11] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <span className="eyebrow">Capabilities</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.12] text-ink">
              Built for {industry.name}.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              Our {industry.name.toLowerCase()} teams bring sector-specific code knowledge, vendor
              networks and scheduling discipline — so your project opens on time and performs for
              decades.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {industry.capabilities.map((cap) => (
                <li
                  key={cap}
                  className="flex items-start gap-3 rounded-lg border border-line bg-mist p-4 text-[13.5px] font-semibold text-ink/85"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  {cap}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {sectorProjects.length > 0 && (
        <section className="bg-mist py-16 lg:py-20">
          <div className="shell">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Recent {industry.name} Projects</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sectorProjects.map((project, i) => (
                <Reveal key={project.slug} delay={i * 90}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20">
        <div className="shell">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Other Industries</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  to={`/industries/${other.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-5 py-4 text-[14px] font-extrabold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-card"
                >
                  {other.name}
                  <ArrowRight
                    className="h-4 w-4 text-gold-dark transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaSection
        eyebrow="LET'S BUILD"
        title={`Building in ${industry.name}?`}
        text="Get a detailed proposal from a team that knows your sector's codes, vendors and timelines."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image={industry.image}
      />
    </>
  );
}
