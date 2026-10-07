import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "outline" | "light" | "champagne" | "ghost";

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  ariaLabel?: string;
}

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  className = "",
  type = "button",
  ariaLabel,
}: ButtonProps) {
  const cls = `hp-btn hp-btn-${variant} ${className}`;
  const content = (
    <>
      {children}
      <ArrowRight size={16} className="hp-btn-arrow" aria-hidden />
    </>
  );

  if (href) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
