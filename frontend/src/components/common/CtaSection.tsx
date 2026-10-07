import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CountUp from "../ui/CountUp";
import ServiceIcon from "../ui/ServiceIcon";
import Reveal from "../ui/Reveal";
import type { Stat } from "../../data/site";

interface CtaSectionProps {
  eyebrow?: string;
  title: string;
  text: string;
  ctaLabel: string;
  ctaTo: string;
  image: string;
  imageAlt?: string;
  stats?: Stat[];
}

/** Dark cinematic CTA banner (optionally carrying the company statistics block). */
export default function CtaSection({
  eyebrow = "LET'S BUILD",
  title,
  text,
  ctaLabel,
  ctaTo,
  image,
  imageAlt = "",
  stats,
}: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-navy-darker text-white">
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-25 sm:w-2/3"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-darker via-navy-darker/85 to-navy-darker/40 sm:via-navy-darker/60"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px divider-fade opacity-60"
        aria-hidden="true"
      />

      <div
        className={`shell relative grid gap-12 py-16 lg:py-20 ${
          stats ? "lg:grid-cols-[1fr_1.1fr] lg:items-center" : ""
        }`}
      >
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="mt-4 max-w-xl text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-[42px]">
            {title}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70">{text}</p>
          <Link to={ctaTo} className="btn btn-gold mt-8">
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>

        {stats && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-12">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100} className="text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <ServiceIcon name={stat.icon} className="h-8 w-8 text-gold" />
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    className="text-4xl font-extrabold tabular-nums text-white lg:text-[44px]"
                  />
                </div>
                <p className="mt-2 text-[13px] font-bold text-white/65">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
