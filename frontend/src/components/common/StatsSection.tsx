import CountUp from "../ui/CountUp";
import ServiceIcon from "../ui/ServiceIcon";
import Reveal from "../ui/Reveal";
import type { Stat } from "../../data/site";

interface StatsSectionProps {
  stats: Stat[];
  image: string;
}

/** Dark navy statistics band with count-up numbers (used on About). */
export default function StatsSection({ stats, image }: StatsSectionProps) {
  return (
    <section className="relative overflow-hidden bg-navy-abyss text-white">
      <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="absolute inset-0 bg-navy-abyss/60" aria-hidden="true" />
      <div className="shell relative grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-4 lg:py-16">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 100} className="flex flex-col items-center text-center">
            <ServiceIcon name={stat.icon} className="mb-3 h-9 w-9 text-gold" />
            <CountUp
              value={stat.value}
              suffix={stat.suffix}
              className="text-4xl font-extrabold tabular-nums text-white lg:text-5xl"
            />
            <p className="mt-2 text-[13px] font-bold text-white/65">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
