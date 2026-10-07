import { HeroSection } from "../../components/horizon/HeroSection";
import { AboutSection } from "../../components/horizon/AboutSection";
import { FeaturedPropertiesSection } from "../../components/horizon/FeaturedPropertiesSection";
import { ServicesSection } from "../../components/horizon/ServicesSection";
import { WhyChooseSection } from "../../components/horizon/WhyChooseSection";
import { TeamSection } from "../../components/horizon/TeamSection";
import { CTASection } from "../../components/horizon/CTASection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedPropertiesSection />
      <ServicesSection />
      <WhyChooseSection />
      <TeamSection />
      <CTASection />
    </>
  );
}
