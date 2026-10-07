import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import TeamGrid from "../team/TeamGrid";
import { TEAM } from "../../data/site";

/** Team section with leadership grid. */
export default function TeamSection() {
  return (
    <section className="py-20 lg:py-24">
      <div className="shell">
        <SectionHeading
          eyebrow="Our Leadership"
          title="The People Behind Every Project."
          description="Decades of combined experience across engineering, field operations and design — one accountable leadership team."
          align="center"
        />
        <Reveal className="mt-12">
          <TeamGrid members={TEAM} />
        </Reveal>
        <Reveal delay={120} className="mt-10 text-center">
          <Link to="/about" className="btn btn-outline">
            More About Built Right
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
