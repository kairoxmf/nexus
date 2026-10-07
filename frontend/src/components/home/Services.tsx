import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { SERVICES } from "../../data/site";

export default function Services() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="Our Services"
            title="What We Do"
            description="Six disciplines, one standard of care. Every engagement is led by a senior advisor from first conversation to closing."
          />
          <Reveal delay={120}>
            <Link to="/services" className="btn btn-primary mt-9">
              Explore Services
              <ArrowRight className="arrow" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="border-t border-line">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={i * 60}>
              <Link
                to="/services"
                className="group flex items-start gap-5 border-b border-line py-7 transition-colors duration-300 hover:bg-ivory/80 sm:gap-8 lg:py-8"
              >
                <span className="pt-1 text-sm font-extrabold text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-extrabold text-ink sm:text-xl">
                    {service.title}
                  </span>
                  <span className="mt-2 block max-w-xl text-[15px] leading-relaxed text-muted">
                    {service.description}
                  </span>
                </span>
                <ArrowUpRight
                  className="mt-1 h-5 w-5 shrink-0 text-muted opacity-0 transition-all duration-300 group-hover:-translate-y-0 group-hover:translate-x-0 group-hover:text-gold group-hover:opacity-100 max-lg:hidden"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
