import Hero from "../components/home/Hero";
import ServiceStrip from "../components/home/ServiceStrip";
import FeaturedProjects from "../components/home/FeaturedProjects";
import ServicesSection from "../components/home/ServicesSection";
import WhyChoose from "../components/home/WhyChoose";
import IndustriesSection from "../components/home/IndustriesSection";
import TrustedBy from "../components/home/TrustedBy";
import TeamSection from "../components/home/TeamSection";
import BlogSection from "../components/home/BlogSection";
import CtaSection from "../components/common/CtaSection";
import { STATS } from "../data/site";

const FINAL_CTA_IMG =
  "https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=1800&q=80";

export default function Home() {
  return (
    <>
      <Hero />
      <ServiceStrip />
      <FeaturedProjects />
      <CtaSection
        title="Let's Build Something Extraordinary Together."
        text="From concept to completion, we are committed to turning your vision into reality."
        ctaLabel="Start Your Project"
        ctaTo="/contact"
        image={FINAL_CTA_IMG}
        stats={STATS}
      />
      <ServicesSection />
      <WhyChoose />
      <IndustriesSection />
      <TrustedBy />
      <TeamSection />
      <BlogSection />
      <CtaSection
        eyebrow="GET STARTED"
        title="Start Your Project With Us."
        text="Tell us about your goals and receive a detailed proposal from our pre-construction team within one business day."
        ctaLabel="Request a Quote"
        ctaTo="/contact"
        image="https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=1800&q=80"
      />
    </>
  );
}
