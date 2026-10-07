import { useEffect, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Fades content up when it first enters the viewport. */
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const [visible, setVisible] = useState(false);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return (
    <div
      ref={setNode}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
