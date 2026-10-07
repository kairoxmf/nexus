import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import CtaSection from "../components/common/CtaSection";
import NotFound from "./NotFound";
import { SERVICES, getService } from "../data/site";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getService(slug) : undefined;
  if (!service) return <NotFound />;

  const related = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={service.title}
        description={service.tagline}
      />

      <section className="py-16 lg:py-20">
        <div className="shell grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="overflow-hidden rounded-xl">
            <img
              src={service.image}
              alt={service.title}
              loading="lazy"
              className="zoom-img aspect-[16/11] w-full object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <span className="eyebrow">Overview</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.12] text-ink">
              {service.title}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">{service.long}</p>
            <h3 className="mt-8 text-[13px] font-extrabold uppercase tracking-widest text-gold-dark">
              What's Included
            </h3>
            <ul className="mt-4 space-y-3">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-[14.5px] font-semibold text-ink">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Related services */}
      <section className="bg-mist py-16 lg:py-20">
        <div className="shell">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Related Services</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((rel, i) => (
              <Reveal key={rel.slug} delay={i * 90}>
                <Link
                  to={`/services/${rel.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      loading="lazy"
                      className="zoom-img h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4 p-5">
                    <h3 className="text-[15.5px] font-extrabold text-ink">{rel.title}</h3>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-gold-dark transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="LET'S BUILD"
        title={`Planning a ${service.title.toLowerCase()} project?`}
        text="Get a detailed proposal — scope, budget and schedule — from our pre-construction team within one business day."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image={service.image}
      />
    </>
  );
}
