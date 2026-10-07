import { Link } from "react-router-dom";

interface LogoProps {
  /** White text variant for dark backgrounds. */
  light?: boolean;
}

/** Minimal architectural building mark + two-line wordmark. */
export default function Logo({ light = false }: LogoProps) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 focus-visible:outline-none"
      aria-label="Built Right Construction — home"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="36" height="36" rx="7" className="fill-navy-darker" />
        <path
          d="M11 29V12.5l9-5 9 5V29"
          stroke="#E9A51F"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M15.5 29v-7h9v7M20 10.5V7.8M11 29h18"
          stroke="#E9A51F"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="leading-none">
        <span
          className={`block text-[15px] font-extrabold tracking-[0.18em] ${
            light ? "text-white" : "text-navy-darker"
          }`}
        >
          BUILT RIGHT
        </span>
        <span className="mt-1 block text-[8.5px] font-bold tracking-[0.42em] text-gold">
          CONSTRUCTION
        </span>
      </span>
    </Link>
  );
}
