import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import ProjectCard from "../projects/ProjectCard";
import { PROJECTS } from "../../data/site";

/** Featured projects grid on the homepage. */
export default function FeaturedProjects() {
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="py-20 lg:py-24">
      <div className="shell">
        <SectionHeading
          eyebrow="Our Projects"
          title="Built with Precision. Delivered with Pride."
          action={
            <Link to="/projects" className="btn btn-outline">
              View All Projects
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((project, i) => (
            <Reveal key={project.slug} delay={(i % 4) * 90}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
