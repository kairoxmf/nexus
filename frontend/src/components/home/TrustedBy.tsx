import Reveal from "../ui/Reveal";
import { PARTNERS } from "../../data/site";

/** "Trusted by" partner wordmark strip (grayscale, minimal). */
export default function TrustedBy() {
  return (
    <section aria-label="Trusted by industry partners" className="border-b border-line py-14 lg:py-16">
      <div className="shell grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-16">
        <Reveal>
          <span className="eyebrow">Trusted By</span>
          <h2 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
            Building Strong Relationships
          </h2>
        </Reveal>
        <ul className="grid grid-cols-2 items-center justify-items-center gap-x-10 gap-y-8 text-ink/35 transition-colors duration-300 sm:grid-cols-5">
          {PARTNERS.map((partner) => (
            <li
              key={partner}
              className="cursor-default select-none text-xl font-extrabold tracking-[0.18em] transition-colors duration-300 hover:text-ink/80 lg:text-[22px]"
              aria-label={partner}
            >
              {partner.toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
