import { Link, type LinkProps } from "react-router-dom";
import type { ReactNode } from "react";

type GlowLinkProps = LinkProps & {
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export function GlowLink({ children, className = "", variant = "primary", ...props }: GlowLinkProps) {
  return (
    <Link
      {...props}
      className={`nx-btn ${variant === "ghost" ? "nx-btn-ghost" : ""} ${className}`}
      style={{ textDecoration: "none", display: "inline-flex" }}
    >
      {children}
    </Link>
  );
}
