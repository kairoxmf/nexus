import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bath,
  BedDouble,
  CalendarCheck,
  Check,
  ChevronLeft,
  Heart,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Tag,
  X,
} from "lucide-react";
import Gallery from "../components/properties/Gallery";
import PropertyCard from "../components/properties/PropertyCard";
import Reveal from "../components/ui/Reveal";
import CtaSection from "../components/home/CtaSection";
import { useFavorites } from "../context/FavoritesContext";
import {
  PHONE,
  PHONE_HREF,
  PROPERTIES,
  formatPrice,
  getPropertyAgent,
  getSimilarProperties,
} from "../data/site";

export default function PropertyDetail() {
  const { slug } = useParams();
  const property = PROPERTIES.find((p) => p.slug === slug);
  const { has, toggle } = useFavorites();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  if (!property) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-ivory px-6 pt-24 text-center">
        <h1 className="text-3xl font-extrabold text-ink">Property not found</h1>
        <p className="mt-3 text-muted">This listing may have been sold or removed.</p>
        <Link to="/properties" className="btn btn-primary mt-8">
          Browse All Properties
          <ArrowRight className="arrow" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  const agent = getPropertyAgent(property);
  const similar = getSimilarProperties(property);
  const fav = has(property.slug);

  return (
    <>
      {/* Breadcrumb band */}
      <section className="bg-navy-darker pb-8 pt-28 text-white lg:pt-32">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Link to="/" className="transition-colors hover:text-gold">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/properties" className="transition-colors hover:text-gold">Properties</Link>
            <span aria-hidden="true">/</span>
            <span className="text-gold">{property.name}</span>
          </nav>
          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/80 transition-colors hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            All Properties
          </Link>
        </div>
      </section>

      <section className="bg-ivory pb-20 pt-10 lg:pb-28">
        <div className="shell grid items-start gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* Left column */}
          <div className="min-w-0">
            <Gallery images={property.images} name={property.name} />

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <FactTile icon={<BedDouble className="h-5 w-5" />} label="Bedrooms" value={String(property.beds)} />
              <FactTile icon={<Bath className="h-5 w-5" />} label="Bathrooms" value={String(property.baths)} />
              <FactTile icon={<Ruler className="h-5 w-5" />} label="Square feet" value={property.sqft.toLocaleString()} />
              <FactTile icon={<Tag className="h-5 w-5" />} label="Property type" value={property.type} />
            </div>

            <Reveal className="mt-12">
              <h2 className="text-2xl font-extrabold text-ink">About This Property</h2>
              <p className="mt-4 font-semibold text-navy">{property.tagline}</p>
              {property.description.map((para) => (
                <p key={para.slice(0, 24)} className="mt-4 leading-relaxed text-muted">
                  {para}
                </p>
              ))}
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="text-2xl font-extrabold text-ink">Key Features</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {property.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm font-semibold text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="text-2xl font-extrabold text-ink">Amenities</h2>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {property.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-muted">
                    {amenity}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right column — sticky sidebar */}
          <span id="schedule-anchor" aria-hidden="true" className="block h-0 scroll-mt-28" />
          <aside className="w-full lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-lg shadow-navy/5 sm:p-7">
              <p className="text-[28px] font-extrabold leading-none text-navy">
                {formatPrice(property.price)}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
                {property.location}
              </p>

              <div className="my-6 h-px bg-line" />

              <div className="flex items-center gap-4">
                <img
                  src={agent.photo}
                  alt={`Portrait of ${agent.name}`}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-extrabold text-ink">{agent.name}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-gold">{agent.role}</p>
                  <div className="mt-1.5 flex gap-3 text-muted">
                    <a href={`mailto:${agent.email}`} aria-label={`Email ${agent.name}`} className="transition-colors hover:text-navy">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <a href={`tel:${agent.phone.replace(/[^\d+]/g, "")}`} aria-label={`Call ${agent.name}`} className="transition-colors hover:text-navy">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link to={`/contact?property=${property.slug}`} className="btn btn-primary w-full">
                  Contact Agent
                  <ArrowRight className="arrow" aria-hidden="true" />
                </Link>
                {scheduleOpen && !scheduled ? (
                  <ScheduleForm
                    propertyName={property.name}
                    onDone={() => setScheduled(true)}
                    onCancel={() => setScheduleOpen(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setScheduleOpen(true)}
                    disabled={scheduled}
                    className="btn btn-outline w-full"
                  >
                    {scheduled ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                        Viewing Requested
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                        Schedule a Viewing
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggle(property.slug)}
                  aria-pressed={fav}
                  className="btn w-full border border-line bg-white text-ink hover:border-gold hover:text-navy"
                >
                  <Heart className={`h-4 w-4 ${fav ? "fill-gold text-gold" : ""}`} aria-hidden="true" />
                  {fav ? "Saved to Favorites" : "Save to Favorites"}
                </button>
              </div>

              <p className="mt-5 text-center text-xs text-muted">
                Or call us directly at{" "}
                <a href={PHONE_HREF} className="font-bold text-navy hover:text-gold">{PHONE}</a>
              </p>
            </div>
          </aside>
        </div>

        {/* Similar properties */}
        <div className="shell mt-20 lg:mt-28">
          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <span className="eyebrow">Keep Exploring</span>
              <h2 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">Similar Properties</h2>
            </div>
            <Link to="/properties" className="hidden text-sm font-bold text-navy transition-colors hover:text-gold sm:inline-flex">
              View all →
            </Link>
          </Reveal>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />

      {/* Mobile sticky contact bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-white/95 p-3 shadow-2xl shadow-navy/20 backdrop-blur lg:hidden">
        <Link to={`/contact?property=${property.slug}`} className="btn btn-primary flex-1 py-2.5">
          Contact Agent
        </Link>
        <button
          type="button"
          onClick={() => {
            setScheduleOpen(true);
            document.getElementById("schedule-anchor")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="btn btn-outline flex-1 py-2.5"
        >
          Schedule Viewing
        </button>
      </div>
    </>
  );
}

function FactTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 text-center">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gold/10 text-gold">
        {icon}
      </span>
      <p className="mt-3 text-lg font-extrabold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

function ScheduleForm({
  propertyName,
  onDone,
  onCancel,
}: {
  propertyName: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !date) {
      setError("Please fill in your name, a valid email and a date.");
      return;
    }
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-xl border border-line bg-ivory p-4">
      <p className="text-sm font-extrabold text-ink">Schedule a viewing</p>
      <p className="mt-0.5 text-xs text-muted">{propertyName}</p>
      <div className="mt-3 space-y-2.5">
        <label htmlFor="sv-name" className="sr-only">Your name</label>
        <input id="sv-name" className="field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <label htmlFor="sv-email" className="sr-only">Email</label>
        <input id="sv-email" type="email" className="field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="sv-date" className="sr-only">Preferred date</label>
        <input id="sv-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" className="btn btn-primary flex-1 py-2.5 text-xs">Request Viewing</button>
        <button type="button" onClick={onCancel} className="btn btn-outline py-2.5 text-xs">Cancel</button>
      </div>
    </form>
  );
}
