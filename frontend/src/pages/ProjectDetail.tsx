import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Calendar, ClipboardList, HardHat, MapPin, Ruler, User } from "lucide-react";
import Reveal from "../components/ui/Reveal";
import Gallery from "../components/projects/Gallery";
import ProjectCard from "../components/projects/ProjectCard";
import CtaSection from "../components/common/CtaSection";
import NotFound from "./NotFound";
import { PROJECTS, getProject } from "../data/site";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProject(slug) : undefined;
  if (!project) return <NotFound />;

  const related = PROJECTS.filter((p) => p.slug !== project.slug)
    .sort((a, b) =>
      Number(b.industry === project.industry) - Number(a.industry === project.industry) ||
      Number(b.category === project.category) - Number(a.category === project.category),
    )
    .slice(0, 3);

  const meta = [
    { icon: User, label: "Client", value: project.client },
    { icon: Building2, label: "Architect", value: project.architect },
    { icon: HardHat, label: "Duration", value: project.duration },
    { icon: Ruler, label: "Size", value: project.sqft },
    { icon: MapPin, label: "Location", value: project.location },
    { icon: Calendar, label: "Completed", value: String(project.year) },
  ];

  return (
    <>
      {/* Header */}
      <section className="bg-mist pb-10 pt-14 lg:pb-14">
        <div className="shell">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-[13px] font-extrabold text-muted transition-colors hover:text-navy-darker"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All Projects
          </Link>
          <Reveal className="mt-5">
            <span className="rounded bg-gold-pale px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-gold-dark">
              {project.category}
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] font-bold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
                {project.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-gold" aria-hidden="true" />
                {project.sqft}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
                {project.year}
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Hero image */}
      <section className="pb-16 pt-2 lg:pb-20">
        <div className="shell">
          <Reveal className="overflow-hidden rounded-xl shadow-lifted">
            <img
              src={project.image}
              alt={project.title}
              className="aspect-[21/9] w-full object-cover"
            />
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.8fr_1fr] lg:gap-16">
            {/* Left column */}
            <div>
              <Reveal>
                <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Project Overview</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">{project.description}</p>
              </Reveal>

              <Reveal delay={80} className="mt-10">
                <h2 className="flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                  <ClipboardList className="h-6 w-6 text-gold" aria-hidden="true" />
                  Scope of Work
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {project.scope.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-lg border border-line bg-white p-4 text-[13.5px] font-semibold text-ink/85"
                    >
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <Reveal>
                  <div className="h-full rounded-xl border border-line bg-mist p-6">
                    <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-gold-dark">
                      The Challenge
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-muted">{project.challenges}</p>
                  </div>
                </Reveal>
                <Reveal delay={90}>
                  <div className="h-full rounded-xl border border-line bg-navy-darker p-6 text-white">
                    <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-gold">
                      Our Solution
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-white/75">{project.solutions}</p>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Right meta column */}
            <Reveal delay={140} className="lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-xl border border-line bg-white p-6 shadow-card sm:p-7">
                <h2 className="text-[13px] font-extrabold uppercase tracking-widest text-gold-dark">
                  Project Facts
                </h2>
                <dl className="mt-5 space-y-4">
                  {meta.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                      <dt className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-muted">
                        <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                        {label}
                      </dt>
                      <dd className="text-right text-[13.5px] font-extrabold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-ivory py-16 lg:py-20">
        <div className="shell">
          <Reveal>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Project Gallery</h2>
            <p className="mt-2 text-[14px] text-muted">
              Select a photo — click any image for fullscreen, use arrow keys or swipe to browse.
            </p>
          </Reveal>
          <Reveal delay={100} className="mt-8">
            <Gallery images={project.gallery} title={project.title} />
          </Reveal>
        </div>
      </section>

      {/* Related projects */}
      <section className="py-16 lg:py-20">
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Related Projects</h2>
            <Link to="/projects" className="btn btn-outline !py-2.5 text-[13px]">
              View All
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel, i) => (
              <Reveal key={rel.slug} delay={i * 90}>
                <ProjectCard project={rel} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="LET'S BUILD"
        title="Want Results Like These?"
        text="Tell us about your project — scope, site and timeline — and our pre-construction team will respond within one business day."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image={project.gallery[project.gallery.length - 1]}
      />
    </>
  );
}
