import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { HERO_IMAGE } from "../../data/site";

export default function Hero() {
  return (
    <section className="relative flex min-h-[620px] items-start justify-center overflow-hidden bg-navy-abyss lg:min-h-[92vh]">
      <img
        src={HERO_IMAGE}
        alt="Modern luxury villa with infinity pool at blue hour"
        fetchPriority="high"
        className="hero-img absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-abyss/80 via-navy-abyss/30 to-navy-abyss/75"
      />

      <div className="shell relative z-10 flex w-full flex-col items-center pb-28 pt-36 text-center sm:pt-40 lg:pb-36 lg:pt-48">
        <span className="hero-rise eyebrow" style={{ animationDelay: "100ms" }}>
          Premium Real Estate
        </span>
        <h1
          className="hero-rise mt-5 max-w-4xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-[66px] lg:leading-[1.06]"
          style={{ animationDelay: "220ms" }}
        >
          Discover Exceptional
          <br />
          Homes &amp; Investments
        </h1>
        <p
          className="hero-rise mt-7 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          style={{ animationDelay: "380ms" }}
        >
          Premium properties in prime locations. Find your dream home or the
          perfect investment with confidence.
        </p>
        <div
          className="hero-rise mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "520ms" }}
        >
          <Link to="/properties" className="btn btn-gold">
            Browse Properties
            <ArrowRight className="arrow" aria-hidden="true" />
          </Link>
          <Link to="/contact" className="btn btn-outline-light">
            Talk to an Expert
          </Link>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"
      />
    </section>
  );
}
