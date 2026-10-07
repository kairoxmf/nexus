import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import CtaSection from "../components/home/CtaSection";
import { SERVICES } from "../data/site";

const PROCESS = [
  { title: "Consultation", description: "We listen first — goals, horizon, lifestyle, budget." },
  { title: "Search", description: "On- and off-market candidates, curated to a shortlist." },
  { title: "Negotiation", description: "Market-backed strategy that protects your position." },
  { title: "Closing", description: "Due diligence, paperwork and keys — handled." },
];

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Expertise at Every Step"
        description="Six disciplines, one standard of care. Every engagement is led by a senior advisor from first conversation to closing."
      />

      <section className="bg-white py-20 lg:py-28">
        <div className="shell">
          <div className="border-t border-line">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={i * 60}>
                <div className="group grid items-start gap-4 border-b border-line py-9 sm:grid-cols-[64px_1fr_auto] lg:gap-10 lg:py-10">
                  <span className="text-sm font-extrabold text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="max-w-2xl">
                    <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{service.title}</h2>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                      {service.description}
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="btn btn-outline self-center whitespace-nowrap"
                  >
                    Enquire
                    <ArrowUpRight className="arrow" aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-navy-darker py-20 text-white lg:py-24">
        <div className="shell">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">How It Works</span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">A Calm, Clear Process</h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => (
              <div key={step.title} className="bg-navy-darker p-8 lg:p-9">
                <span className="text-sm font-extrabold text-gold">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/65">{step.description}</p>
              </div>
            ))}
          </div>
          <Reveal delay={150} className="mt-12 text-center">
            <Link to="/contact" className="btn btn-gold">
              Start the Conversation
              <ArrowRight className="arrow" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
