import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Briefcase, MapPin } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import CtaSection from "../components/common/CtaSection";
import { BENEFITS, JOBS } from "../data/site";

const CULTURE_IMG =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80";

export default function Careers() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build Your Career With Us."
        description="Join a team of professionals shaping the future of construction — where safety, craft and growth come standard."
      />

      {/* Culture */}
      <section className="py-20 lg:py-24">
        <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="eyebrow">Company Culture</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.12] text-ink sm:text-4xl">
              Serious Work. Genuine Team.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              Our offices are full of people who started on the tools and grew into leadership —
              because we promote from within and invest in certifications, training and mentorship
              at every level.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Expect high standards, honest feedback and crews that look out for each other. Every
              site runs on our zero-injury culture, and every idea — from apprentice to executive —
              gets a hearing.
            </p>
            <Link to="/contact" className="btn btn-outline mt-7">
              Ask Us Anything
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={120} className="overflow-hidden rounded-xl">
            <img
              src={CULTURE_IMG}
              alt="Built Right team members collaborating in the office"
              loading="lazy"
              className="zoom-img aspect-[16/11] w-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-mist py-20 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Benefits"
            title="We Take Care of Our People."
            align="center"
          />
          <ul className="mx-auto mt-12 grid max-w-4xl gap-x-10 sm:grid-cols-2">
            {BENEFITS.map((benefit, i) => (
              <Reveal key={benefit} delay={(i % 2) * 70} className="border-b border-line">
                <div className="flex items-center gap-3.5 py-4">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  <span className="text-[14.5px] font-semibold text-ink">{benefit}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Open positions */}
      <section className="py-20 lg:py-24">
        <div className="shell">
          <SectionHeading
            eyebrow="Open Positions"
            title="Current Openings."
            description="Don't see your role? Send us an open application — we're always hiring exceptional people."
          />
          <div className="mt-12 space-y-4">
            {JOBS.map((job, i) => (
              <Reveal key={job.id} delay={Math.min(i, 3) * 70}>
                <article className="group flex flex-col gap-5 rounded-xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted sm:flex-row sm:items-center sm:justify-between sm:p-7">
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold text-ink transition-colors duration-300 group-hover:text-navy">
                      {job.title}
                    </h3>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] font-bold text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                        {job.department} · {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                        {job.location}
                      </span>
                    </p>
                    <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-muted">
                      {job.description}
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    state={{ interest: `Application — ${job.title}` }}
                    className="btn btn-gold shrink-0 !px-5 text-[13px]"
                  >
                    Apply Now
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="READY WHEN YOU ARE"
        title="Ready to Build With Us?"
        text="Send your application or an open one — our hiring team reviews every submission and responds within a week."
        ctaLabel="Contact Our Team"
        ctaTo="/contact"
        image="https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1800&q=80"
      />
    </>
  );
}
