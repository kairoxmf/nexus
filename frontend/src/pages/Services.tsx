import PageHero from "../components/ui/PageHero";
import ServicesSection from "../components/home/ServicesSection";
import CtaSection from "../components/common/CtaSection";
import Reveal from "../components/ui/Reveal";

const PROCESS = [
  { step: "01", title: "Consult & Survey", text: "We walk the site, listen to your goals and test every constraint before a number is quoted." },
  { step: "02", title: "Plan & Estimate", text: "Detailed scope, transparent budget and a schedule you can hold us to — reviewed with you line by line." },
  { step: "03", title: "Build & Manage", text: "Self-performed critical trades, weekly progress reports and a single accountable project lead." },
  { step: "04", title: "Deliver & Support", text: "Commissioning, walkthrough, documentation and a warranty team that actually answers the phone." },
];

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Everything a Project Needs. Under One Roof."
        description="Eight integrated capabilities — delivered by our own teams and long-term trade partners with one point of accountability."
      />
      <div className="pt-4">
        <ServicesSection />
      </div>

      {/* Process */}
      <section className="py-20 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <span className="eyebrow">How We Work</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-[1.12] text-ink sm:text-4xl">
                A Process Refined Over 500 Projects.
              </h2>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((item, i) => (
              <Reveal key={item.step} delay={i * 90}>
                <div className="relative h-full rounded-xl border border-line bg-white p-7 shadow-card">
                  <span className="text-3xl font-extrabold tabular-nums text-gold">{item.step}</span>
                  <h3 className="mt-4 text-[16px] font-extrabold text-ink">{item.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="LET'S BUILD"
        title="Not Sure Which Service Fits?"
        text="Send us your drawings, your idea or just a napkin sketch — our pre-construction team will shape the right approach with you."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image="https://images.unsplash.com/photo-1503328427499-d92d1ac3d174?auto=format&fit=crop&w=1800&q=80"
      />
    </>
  );
}
