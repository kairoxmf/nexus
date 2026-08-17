import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";

type HoverCardProps = {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "amber";
  style?: CSSProperties;
};

export function HoverCard({ children, className = "", glow = "cyan", style }: HoverCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
    el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(12px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)";
  };

  return (
    <div
      ref={ref}
      className={`nx-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transition: "transform 0.15s ease-out, border-color 0.4s, box-shadow 0.4s",
        ["--glow-color" as string]: glow === "amber" ? "#f4a100" : "#4cc9f0",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
