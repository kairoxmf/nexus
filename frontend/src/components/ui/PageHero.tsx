import Reveal from "./Reveal";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
}

/** Compact navy banner used at the top of inner pages (below the sticky nav). */
export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-darker pb-14 pt-14 text-white lg:pb-20 lg:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-navy/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px divider-fade opacity-60"
      />
      <div className="shell relative">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[54px]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{description}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
