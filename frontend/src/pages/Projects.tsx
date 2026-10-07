import { useMemo, useState } from "react";
import PageHero from "../components/ui/PageHero";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectFilter, { type ProjectFilterState } from "../components/projects/ProjectFilter";
import Reveal from "../components/ui/Reveal";
import CtaSection from "../components/common/CtaSection";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  PROJECT_INDUSTRIES,
  PROJECT_LOCATIONS,
  PROJECT_YEARS,
  PROJECT_SIZES,
} from "../data/site";

const DEFAULT_FILTERS: ProjectFilterState = {
  query: "",
  category: "All",
  industry: "All",
  location: "All",
  year: "All",
  size: "All",
  sort: "Newest",
};

const SORTS = ["Newest", "Oldest", "Largest", "Featured"];

function matchesSize(sizeValue: number, bucket: string): boolean {
  switch (bucket) {
    case "Under 25,000":
      return sizeValue < 25000;
    case "25,000 – 60,000":
      return sizeValue >= 25000 && sizeValue <= 60000;
    case "60,000 – 100,000":
      return sizeValue > 60000 && sizeValue <= 100000;
    case "100,000+":
      return sizeValue > 100000;
    default:
      return true;
  }
}

export default function Projects() {
  const [filters, setFilters] = useState<ProjectFilterState>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    let list = PROJECTS.filter((p) => {
      if (filters.category !== "All" && p.category !== filters.category) return false;
      if (filters.industry !== "All" && p.industry !== filters.industry) return false;
      if (filters.location !== "All" && !p.location.endsWith(`, ${filters.location}`)) return false;
      if (filters.year !== "All" && String(p.year) !== filters.year) return false;
      if (!matchesSize(p.sizeValue, filters.size)) return false;
      if (
        q &&
        !`${p.title} ${p.location} ${p.category} ${p.industry} ${p.description}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });

    switch (filters.sort) {
      case "Oldest":
        list = [...list].sort((a, b) => a.year - b.year);
        break;
      case "Largest":
        list = [...list].sort((a, b) => b.sizeValue - a.sizeValue);
        break;
      case "Featured":
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year);
        break;
      default:
        list = [...list].sort((a, b) => b.year - a.year);
    }
    return list;
  }, [filters]);

  return (
    <>
      <PageHero
        eyebrow="Our Projects"
        title="Work We're Proud to Sign."
        description="500+ delivered projects across every major sector. Browse a selection of recent work — or filter by type, industry, size and year."
      />

      <section className="py-14 lg:py-16">
        <div className="shell">
          <ProjectFilter
            filters={filters}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
            onReset={() => setFilters(DEFAULT_FILTERS)}
            options={{
              categories: PROJECT_CATEGORIES,
              industries: PROJECT_INDUSTRIES,
              locations: PROJECT_LOCATIONS,
              years: PROJECT_YEARS,
              sizes: PROJECT_SIZES,
              sorts: SORTS,
            }}
            resultCount={filtered.length}
          />

          {filtered.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, i) => (
                <Reveal key={project.slug} delay={(i % 3) * 80}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-xl border border-dashed border-line bg-mist px-8 py-16 text-center">
              <h2 className="text-xl font-extrabold text-ink">No projects match your filters</h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] text-muted">
                Try widening your search — or clear the filters to see the full portfolio.
              </p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="btn btn-gold mt-6 text-[13px]"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <CtaSection
        eyebrow="START YOURS"
        title="Your Project Could Be Next."
        text="Every project above started with a conversation. Tell us about yours and get a detailed proposal within one business day."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image="https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=1800&q=80"
      />
    </>
  );
}
