import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import ServiceIcon from "../ui/ServiceIcon";
import { WHY_CHOOSE } from "../../data/site";

const WHY_IMG =
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80";

/** "Why choose us" — sticky editorial heading beside a benefits grid. */
export default function WhyChoose() {
  return (
    <section className="py-20 lg:py-24">
      <div className="shell grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="Built on Experience. Driven by Excellence."
            description="For over three decades, owners have trusted us with the projects that matter most — because we treat every build as a reputation, not a job."
          />
          <Reveal delay={150} className="mt-8 overflow-hidden rounded-xl">
            <img
              src={WHY_IMG}
              alt="Engineer in a hard hat reviewing plans on an active construction site"
              loading="lazy"
              className="zoom-img aspect-[16/11] w-full object-cover"
            />
          </Reveal>
        </div>

        <div className="grid gap-x-10 sm:grid-cols-2">
          {WHY_CHOOSE.map((item, i) => (
            <Reveal key={item.title} delay={(i % 2) * 80} className="border-b border-line">
              <div className="flex gap-4 py-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gold-pale text-gold-dark transition-colors duration-300">
                  <ServiceIcon name={item.icon} className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[15.5px] font-extrabold text-ink">{item.title}</span>
                  <span className="mt-1.5 block text-[13.5px] leading-relaxed text-muted">{item.text}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
