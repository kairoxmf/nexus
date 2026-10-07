import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "../ui/Reveal";
import { ABOUT_IMAGES } from "../../data/site";

export default function About() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="shell grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <span className="eyebrow">About Us</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.1] text-ink sm:text-4xl lg:text-[46px]">
            Who We Are
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted">
            At Horizon Properties, we connect people with extraordinary homes and
            smart investments. Integrity, transparency, and client satisfaction
            are at the heart of everything we do.
          </p>
          <Link to="/about" className="btn btn-primary mt-9">
            Learn More
            <ArrowRight className="arrow" aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={140}>
          <Link to="/properties" className="group relative block" aria-label="Explore our properties">
            <div className="flex gap-4 sm:gap-5">
              <div className="w-[63%] overflow-hidden rounded-2xl">
                <img
                  src={ABOUT_IMAGES.main}
                  alt="Luxury modern home with pool at dusk"
                  loading="lazy"
                  className="zoom-img aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="w-[37%] translate-y-10 overflow-hidden rounded-2xl">
                <img
                  src={ABOUT_IMAGES.side}
                  alt="Contemporary architecture detail"
                  loading="lazy"
                  className="zoom-img aspect-[3/4] w-full object-cover"
                />
              </div>
            </div>
            <span className="absolute -bottom-5 left-[63%] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border border-gold/60 bg-white text-navy shadow-lg shadow-navy/15 transition-colors duration-300 group-hover:bg-gold group-hover:text-navy-abyss sm:h-20 sm:w-20">
              <ArrowUpRight
                className="h-6 w-6 transition-transform duration-300 group-hover:rotate-45 sm:h-7 sm:w-7"
                aria-hidden="true"
              />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
