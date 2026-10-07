import { Link } from "react-router-dom";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3 focus-visible:outline-none" aria-label="Horizon Properties — home">
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        className="shrink-0 text-gold transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <rect x="2.5" y="2.5" width="35" height="35" rx="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M11 28V10.5l9 6.5 9-6.5V28"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M16.2 28v-5.4h7.6V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-extrabold tracking-[0.2em] text-white">
            HORIZON
          </span>
          <span className="mt-1 block text-[8.5px] font-bold tracking-[0.44em] text-gold">
            PROPERTIES
          </span>
        </span>
      )}
    </Link>
  );
}
