import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import PropertyCard from "../components/properties/PropertyCard";
import CtaSection from "../components/home/CtaSection";
import {
  PROPERTIES,
  PROPERTY_TYPES,
  formatPriceShort,
} from "../data/site";

const PRICE_BANDS = [
  { value: "any", label: "Any price", min: 0, max: Infinity },
  { value: "u2", label: "Under $2M", min: 0, max: 2_000_000 },
  { value: "2-4", label: "$2M – $4M", min: 2_000_000, max: 4_000_000 },
  { value: "4-6", label: "$4M – $6M", min: 4_000_000, max: 6_000_000 },
  { value: "6p", label: "$6M+", min: 6_000_000, max: Infinity },
] as const;

const SORTS = [
  { value: "featured", label: "Sort: Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "size", label: "Largest First" },
  { value: "newest", label: "Newest First" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];
type BandValue = (typeof PRICE_BANDS)[number]["value"];

const defaults = { query: "", type: "any", band: "any" as BandValue, beds: "any", baths: "any", sort: "featured" as SortValue };

export default function Properties() {
  const [filters, setFilters] = useState(defaults);

  const set = (key: keyof typeof defaults) => (value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const isFiltered =
    filters.query !== "" || filters.type !== "any" || filters.band !== "any" ||
    filters.beds !== "any" || filters.baths !== "any" || filters.sort !== "featured";

  const results = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.value === filters.band)!;
    const minBeds = filters.beds === "any" ? 0 : Number(filters.beds);
    const minBaths = filters.baths === "any" ? 0 : Number(filters.baths);
    const q = filters.query.trim().toLowerCase();

    let list = PROPERTIES.filter((p) => {
      if (q && !(`${p.name} ${p.location}`.toLowerCase().includes(q))) return false;
      if (filters.type !== "any" && p.type !== filters.type) return false;
      if (p.price < band.min || p.price > band.max) return false;
      if (p.beds < minBeds || p.baths < minBaths) return false;
      return true;
    });

    switch (filters.sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "size":
        list = [...list].sort((a, b) => b.sqft - a.sqft);
        break;
      case "newest":
        list = [...list].sort((a, b) => b.year - a.year);
        break;
      default:
        list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [filters]);

  return (
    <>
      <PageHero
        eyebrow="Properties"
        title="Find Your Property"
        description="Browse our current portfolio of homes, estates and penthouses — or search for exactly what you're looking for."
      />

      {/* Filter bar overlapping the navy band */}
      <section aria-label="Search and filters" className="bg-navy-darker">
        <div className="shell">
          <Reveal className="relative z-10 -mb-16 translate-y-16">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-xl shadow-navy/20 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="relative sm:col-span-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <label htmlFor="prop-search" className="sr-only">Search by name or location</label>
                  <input
                    id="prop-search"
                    type="search"
                    value={filters.query}
                    onChange={(e) => set("query")(e.target.value)}
                    placeholder="Search name or location…"
                    className="field pl-11"
                  />
                </div>
                <FilterSelect label="Type" value={filters.type} onChange={set("type")} options={[{ value: "any", label: "Any type" }, ...PROPERTY_TYPES.map((t) => ({ value: t, label: t }))]} />
                <FilterSelect label="Price" value={filters.band} onChange={set("band")} options={PRICE_BANDS.map((b) => ({ value: b.value, label: b.label }))} />
                <FilterSelect label="Beds" value={filters.beds} onChange={set("beds")} options={bedOptions()} />
                <FilterSelect label="Baths" value={filters.baths} onChange={set("baths")} options={bathOptions()} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-gold" aria-hidden="true" />
                  <span className="text-sm font-bold text-ink">
                    {results.length} {results.length === 1 ? "property" : "properties"}
                  </span>
                  {isFiltered && (
                    <button
                      type="button"
                      onClick={() => setFilters(defaults)}
                      className="flex items-center gap-1 text-xs font-bold text-muted transition-colors hover:text-navy"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label htmlFor="prop-sort" className="text-xs font-bold uppercase tracking-wider text-muted">Sort by</label>
                  <select
                    id="prop-sort"
                    value={filters.sort}
                    onChange={(e) => set("sort")(e.target.value)}
                    className="field w-auto py-2 pr-8 text-sm font-semibold"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory pb-20 pt-28 lg:pb-28">
        <div className="shell">
          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((property, i) => (
                <Reveal key={property.slug} delay={(i % 3) * 80}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md py-16 text-center">
              <p className="text-lg font-extrabold text-ink">No properties match your search</p>
              <p className="mt-2 text-sm text-muted">
                Try widening your filters — or tell us what you're looking for and we'll find it off-market.
              </p>
              <button type="button" onClick={() => setFilters(defaults)} className="btn btn-primary mt-6">
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <CtaSection />
    </>
  );
}

function bedOptions() {
  return [
    { value: "any", label: "Any beds" },
    { value: "2", label: "2+ beds" },
    { value: "3", label: "3+ beds" },
    { value: "4", label: "4+ beds" },
    { value: "5", label: "5+ beds" },
  ];
}
function bathOptions() {
  return [
    { value: "any", label: "Any baths" },
    { value: "2", label: "2+ baths" },
    { value: "3", label: "3+ baths" },
    { value: "4", label: "4+ baths" },
  ];
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div>
      <label htmlFor={`filter-${label}`} className="sr-only">{label}</label>
      <select
        id={`filter-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="field cursor-pointer appearance-none pr-8 font-semibold"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%235C6B7C' stroke-width='1.5'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.9rem center",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
