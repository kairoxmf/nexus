import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
  action?: React.ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  action,
}: SectionHeadingProps) {
  if (align === "center") {
    return (
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">{eyebrow}</span>
        <h2
          className={`mt-3 text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-[44px] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-4 leading-relaxed ${dark ? "text-white/70" : "text-muted"}`}>{description}</p>
        )}
      </Reveal>
    );
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <Reveal className="max-w-2xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2
          className={`mt-3 text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-[44px] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-4 leading-relaxed ${dark ? "text-white/70" : "text-muted"}`}>{description}</p>
        )}
      </Reveal>
      {action && <Reveal delay={120}>{action}</Reveal>}
    </div>
  );
}
