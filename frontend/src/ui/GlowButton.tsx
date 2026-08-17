import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function GlowButton({ children, className = "", variant = "primary", ...props }: Props) {
  return (
    <button type="button" className={`nx-btn ${variant === "ghost" ? "nx-btn-ghost" : ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
