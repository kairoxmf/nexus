import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { SERVICES } from "../../data/site";

/** Editorial services list — numbered rows with image, title and arrow. */
export default function ServicesSection({ limit }: { limit?: number }) {
  const items = limit ? SERVICES.slice(0, limit) : SERVICES;

  return (
    <section className="bg-ivory py-20 lg:py-24">
      <div className="shell">
        <SectionHeading
          eyebrow="What We Do"
          title="Construction Services Built Around Your Goals."
          description="Eight integrated capabilities covering the full life of a project — from first survey to final handover."
        />

        <div className="mt-14 border-t border-line">
          {items.map((service, i) => (
            <Reveal key={service.slug} delay={Math.min(i, 3) * 60}>
              <Link
                to={`/services/${service.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line py-6 transition-colors duration-300 hover:bg-white sm:gap-8 sm:px-4 lg:py-7"
                aria-label={`${service.title} — learn more`}
              >
                <span className="w-10 text-xl font-extrabold tabular-nums text-ink/25 transition-colors duration-300 group-hover:text-gold-dark sm:text-2xl">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0">
                  <span className="block text-lg font-extrabold text-ink transition-colors duration-300 group-hover:text-navy sm:text-xl">
                    {service.title}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">
                    {service.description}
                  </span>
                </span>

                <span className="hidden w-48 shrink-0 overflow-hidden rounded-md md:block">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className="zoom-img aspect-[16/10] h-full w-full object-cover"
                  />
                </span>

                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-navy-darker transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-navy-abyss">
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
