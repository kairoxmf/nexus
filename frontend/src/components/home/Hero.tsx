import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2000&q=80";

/** Full-width hero with staggered entrance animation. */
export default function Hero() {
  return (
    <section className="relative flex min-h-[540px] items-center overflow-hidden lg:min-h-[82vh]">
      <img
        src={HERO_IMG}
        alt="Modern commercial building under construction with tower cranes at golden hour"
        className="hero-img absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-abyss/85 via-navy-deep/45 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-abyss/40 to-transparent" aria-hidden="true" />

      <div className="shell relative pb-36 pt-20 sm:pb-40 lg:pb-44 lg:pt-24">
        <span className="eyebrow hero-rise inline-block" style={{ animationDelay: "80ms" }}>
          We Build Your Vision
        </span>
        <h1
          className="hero-rise mt-4 max-w-2xl text-4xl font-extrabold leading-[1.06] text-white sm:text-5xl lg:text-[64px]"
          style={{ animationDelay: "200ms" }}
        >
          Building Structures.
          <br />
          <span className="text-gold">Building Trust.</span>
        </h1>
        <p
          className="hero-rise mt-5 max-w-md text-[15px] leading-relaxed text-white/80 sm:text-base"
          style={{ animationDelay: "340ms" }}
        >
          Delivering exceptional construction solutions with quality, safety and integrity at every step.
        </p>
        <div className="hero-rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: "480ms" }}>
          <Link to="/services" className="btn btn-gold">
            Our Services
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/projects" className="btn bg-navy-deep text-white hover:bg-navy-darker">
            View Projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
