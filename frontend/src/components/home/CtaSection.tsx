import { Link } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import Reveal from "../ui/Reveal";

export default function CtaSection() {
  return (
    <section className="bg-mist py-16 lg:py-20">
      <div className="shell flex flex-col items-center gap-9 text-center lg:flex-row lg:justify-between lg:gap-12 lg:text-left">
        <Reveal className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-gold/60 bg-white text-gold shadow-sm lg:h-24 lg:w-24">
            <KeyRound className="h-8 w-8 lg:h-9 lg:w-9" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold leading-tight text-ink sm:text-3xl lg:text-[34px]">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-muted sm:text-base">
              Let our experts guide you to the right home or investment.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120} className="shrink-0">
          <Link to="/contact" className="btn btn-primary px-8">
            Get in Touch
            <ArrowRight className="arrow" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
