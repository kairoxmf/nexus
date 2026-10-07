import { Link } from "react-router-dom";
import { ArrowRight, Check, Compass, HandHeart, ShieldCheck } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import CtaSection from "../components/home/CtaSection";
import TeamGrid from "../components/team/TeamGrid";
import { ABOUT_PAGE_IMAGES, STATS } from "../data/site";

const VALUES = [
  {
    Icon: ShieldCheck,
    title: "Integrity",
    description: "Straight answers, full disclosure and advice we'd give our own family.",
  },
  {
    Icon: Compass,
    title: "Expertise",
    description: "Decades of combined experience across luxury, investment and development markets.",
  },
  {
    Icon: HandHeart,
    title: "Client-First",
    description: "Your goals set the agenda. We succeed only when you do.",
  },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A Higher Standard of Real Estate"
        description="Horizon Properties was founded on a simple belief: exceptional properties deserve exceptional representation."
      />

      {/* Story */}
      <section className="bg-white py-20 lg:py-28">
        <div className="shell grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="flex gap-4 sm:gap-5">
              <div className="w-[63%] overflow-hidden rounded-2xl">
                <img
                  src={ABOUT_PAGE_IMAGES.main}
                  alt="Modern luxury residence exterior"
                  loading="lazy"
                  className="zoom-img aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="w-[37%] translate-y-10 overflow-hidden rounded-2xl">
                <img
                  src={ABOUT_PAGE_IMAGES.side}
                  alt="Contemporary interior detail"
                  loading="lazy"
                  className="zoom-img aspect-[3/4] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <span className="eyebrow">Our Story</span>
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] text-ink sm:text-4xl">
              Built on Trust, Measured by Results
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              Since our founding, Horizon Properties has grown from a boutique
              brokerage into a full-service premium agency — without ever losing
              the personal attention that started it all. We represent a
              select number of clients at a time, so every engagement gets the
              focus it deserves.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Our advisors are market specialists, not order-takers. They walk
              every property, know every street, and negotiate every contract
              as if it were their own.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-extrabold text-gold lg:text-[26px]">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Values"
            title="What We Stand For"
            description="Three principles guide every recommendation, negotiation and handshake."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map(({ Icon, title, description }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-line bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-navy-abyss">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-ink">{title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team preview */}
      <section className="bg-white py-20 lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Team"
            title="The People Behind Horizon"
            description="Meet the advisors who will actually handle your search, your tour and your negotiation."
          />
          <div className="mt-14">
            <TeamGrid />
          </div>
          <Reveal delay={120} className="mt-12 text-center">
            <Link to="/team" className="btn btn-outline">
              Meet the Team
              <ArrowRight className="arrow" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
