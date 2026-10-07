import PageHero from "../components/ui/PageHero";
import TeamGrid from "../components/team/TeamGrid";
import CtaSection from "../components/home/CtaSection";

export default function Team() {
  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="Meet the Experts"
        description="Senior advisors who know these markets street by street — and answer their own phones."
      />
      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell">
          <TeamGrid />
        </div>
      </section>
      <CtaSection />
    </>
  );
}
