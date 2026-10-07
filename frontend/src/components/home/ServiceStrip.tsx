import { Link } from "react-router-dom";
import ServiceIcon from "../ui/ServiceIcon";
import { SERVICES } from "../../data/site";

/** Dark floating strip of four flagship services, overlapping the hero. */
export default function ServiceStrip() {
  const items = SERVICES.slice(0, 4);

  return (
    <section aria-label="Core construction services" className="relative z-20 -mt-24 lg:-mt-28">
      <div className="shell">
        <div className="grid overflow-hidden rounded-xl bg-navy-darker shadow-lifted sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
          {items.map((service) => (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className="group flex items-start gap-4 border-b border-white/10 p-6 transition-colors duration-300 last:border-b-0 hover:bg-navy-deep sm:border-b-0 lg:p-7"
            >
              <ServiceIcon
                name={service.icon}
                className="mt-0.5 h-9 w-9 shrink-0 text-gold transition-transform duration-300 group-hover:scale-110"
              />
              <span className="block transition-transform duration-300 group-hover:translate-x-0.5">
                <span className="block text-[14px] font-extrabold leading-snug text-white transition-colors group-hover:text-gold-soft">
                  {service.title}
                </span>
                <span className="mt-1.5 block text-[12px] leading-relaxed text-white/55">
                  {service.tagline}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
