import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Hero from "../components/home/Hero";
import About from "../components/home/About";
import FeaturedProperties from "../components/home/FeaturedProperties";
import Services from "../components/home/Services";
import WhyChoose from "../components/home/WhyChoose";
import SectionHeading from "../components/ui/SectionHeading";
import TeamGrid from "../components/team/TeamGrid";
import CtaSection from "../components/home/CtaSection";
import Reveal from "../components/ui/Reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedProperties />
      <Services />
      <WhyChoose />
      <section className="bg-white py-20 lg:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Team"
            title="Meet the Experts"
            description="Senior advisors who know these markets street by street — and answer their own phones."
          />
          <div className="mt-14">
            <TeamGrid />
          </div>
          <Reveal delay={120} className="mt-12 text-center">
            <Link to="/team" className="btn btn-outline">
              Meet the Full Team
              <ArrowRight className="arrow" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
