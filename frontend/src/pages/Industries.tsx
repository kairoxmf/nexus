import PageHero from "../components/ui/PageHero";
import IndustriesSection from "../components/home/IndustriesSection";
import CtaSection from "../components/common/CtaSection";

export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries We Serve"
        title="Specialists in Every Sector We Build."
        description="Dedicated teams, sector-specific playbooks and the right specialists — from hospitals to harbors."
      />
      <div className="pt-4">
        <IndustriesSection />
      </div>
      <CtaSection
        eyebrow="YOUR SECTOR"
        title="Don't See Your Industry?"
        text="If it stands on foundations, we can build it. Tell us about your sector and project — we'll bring the right team."
        ctaLabel="Start a Conversation"
        ctaTo="/contact"
        image="https://images.unsplash.com/photo-1527576539890-dfa815648363?auto=format&fit=crop&w=1800&q=80"
      />
    </>
  );
}
