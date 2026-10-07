import { type ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3 | 4;
  as?: "div" | "section" | "article" | "li" | "span";
}

export function ScrollReveal({
  children,
  className = "",
  delay,
  as: Tag = "div",
}: ScrollRevealProps) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  const delayClass = delay ? ` hp-reveal-delay-${delay}` : "";
  return (
    <Tag
      ref={ref as never}
      className={`hp-reveal${revealed ? " hp-revealed" : ""}${delayClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
