import { Check } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { STATS, WHY_POINTS } from "../../data/site";

export default function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-navy-darker py-20 text-white lg:py-28">
      <img
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=70"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-15 lg:block"
        style={{ maskImage: "linear-gradient(to left, black, transparent)", WebkitMaskImage: "linear-gradient(to left, black, transparent)" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-darker via-navy-darker/85 to-navy-darker/60 lg:to-navy-darker/30" />

      <div className="shell relative grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            dark
            eyebrow="The Horizon Difference"
            title="Why Clients Choose Horizon"
            description="We treat every transaction as a relationship, not a deal. That discipline has made us the quiet standard for premium real estate."
          />
          <ul className="mt-9 space-y-5">
            {WHY_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 90}>
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/50 bg-gold/10 text-gold">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-bold text-white">{point.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-white/65">
                      {point.description}
                    </span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={150}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-navy-darker p-8 lg:p-10">
                <p className="text-3xl font-extrabold tracking-tight text-gold lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2.5 text-sm font-semibold text-white/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
