import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import StatsSection from "../components/common/StatsSection";
import TeamGrid from "../components/team/TeamGrid";
import CtaSection from "../components/common/CtaSection";
import { STATS, TEAM, BRAND } from "../data/site";

const STORY_IMG =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";

const VALUES = [
  {
    title: "Safety Above All",
    text: "Every schedule, every budget and every decision starts with the people on the site.",
  },
  {
    title: "Precision Engineering",
    text: "We measure twice — in the office, in the model and in the field — so we cut once.",
  },
  {
    title: "Honest Partnerships",
    text: "Transparent budgets, real schedules and advice we would give our own family.",
  },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Built Right"
        title="Three Decades of Building It Right."
        description="From a two-office shop to one of the region's most trusted builders — our story is written in the skylines we've helped shape."
      />

      {/* Story */}
      <section className="py-20 lg:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="overflow-hidden rounded-xl">
            <img
              src={STORY_IMG}
              alt="Built Right project team collaborating on site"
              loading="lazy"
              className="zoom-img aspect-[16/11] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <span className="eyebrow">Our Story</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.12] text-ink sm:text-4xl">
              Founded on Craft. Growing on Trust.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              Built Right Construction was founded in {2026 - 30} with a single crew and a stubborn
              belief: buildings should be delivered the way they were promised. Three decades and
              500 projects later, that belief still runs the company.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Today our teams deliver commercial towers, custom residences, industrial facilities
              and complex renovations across the country — self-performing the critical trades and
              holding one accountable line from first survey to final handover.
            </p>
            <ul className="mt-7 space-y-3">
              {["Self-performed concrete, steel and carpentry", "In-house engineering and pre-construction", "One accountable point of contact per project"].map(
                (item) => (
                  <li key={item} className="flex items-start gap-3 text-[14.5px] font-semibold text-ink">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-mist py-20 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="What Guides Us"
            title="The Values We Build By."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal key={value.title} delay={i * 100}>
                <div className="h-full rounded-xl border border-line bg-white p-8 shadow-card">
                  <span className="text-3xl font-extrabold tabular-nums text-gold">0{i + 1}</span>
                  <h3 className="mt-4 text-lg font-extrabold text-ink">{value.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StatsSection stats={STATS} image="https://images.unsplash.com/photo-1503328427499-d92d1ac3d174?auto=format&fit=crop&w=1800&q=80" />

      {/* Team */}
      <section className="py-20 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Leadership"
            title="Meet the Team Behind the Buildings."
            action={
              <Link to="/careers" className="btn btn-outline">
                Join the Team
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          <Reveal className="mt-12">
            <TeamGrid members={TEAM} />
          </Reveal>
        </div>
      </section>

      <CtaSection
        eyebrow="WORK WITH US"
        title="Have a Project in Mind?"
        text={`Call us at ${BRAND.phone} or request a proposal online — our pre-construction team responds within one business day.`}
        ctaLabel="Get a Quote"
        ctaTo="/contact"
        image="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1800&q=80"
      />
    </>
  );
}
