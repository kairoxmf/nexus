import { Search, ChevronDown } from "lucide-react";
import {
  propertyTypes,
  locations,
  priceRanges,
} from "../../data/properties";

export interface FilterState {
  search: string;
  location: string;
  type: string;
  priceRange: string;
  bedrooms: string;
  bathrooms: string;
  sort: string;
}

export const defaultFilters: FilterState = {
  search: "",
  location: "All",
  type: "All",
  priceRange: "All Prices",
  bedrooms: "Any",
  bathrooms: "Any",
  sort: "featured",
};

const bedOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
const bathOptions = ["Any", "1+", "2+", "3+", "4+"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "area-desc", label: "Largest Area" },
];

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="hp-filter-select">
      <label className="hp-filter-label">{label}</label>
      <div className="hp-filter-select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown size={14} strokeWidth={1.5} className="hp-filter-chevron" />
      </div>
    </div>
  );
}

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export function PropertyFilters({ filters, onChange, resultCount }: PropertyFiltersProps) {
  const update = (key: keyof FilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="hp-filters">
      <div className="hp-filters-bar">
        <div className="hp-filter-search">
          <Search size={18} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            aria-label="Search properties"
          />
        </div>
        <Select label="Location" value={filters.location} options={locations} onChange={(v) => update("location", v)} />
        <Select label="Type" value={filters.type} options={propertyTypes} onChange={(v) => update("type", v)} />
        <Select label="Price" value={filters.priceRange} options={priceRanges.map((p) => p.label)} onChange={(v) => update("priceRange", v)} />
        <Select label="Beds" value={filters.bedrooms} options={bedOptions} onChange={(v) => update("bedrooms", v)} />
        <Select label="Baths" value={filters.bathrooms} options={bathOptions} onChange={(v) => update("bathrooms", v)} />
        <div className="hp-filter-select">
          <label className="hp-filter-label">Sort</label>
          <div className="hp-filter-select-wrap">
            <select value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} strokeWidth={1.5} className="hp-filter-chevron" />
          </div>
        </div>
      </div>
      <div className="hp-filters-results">
        <span>{resultCount} {resultCount === 1 ? "property" : "properties"} found</span>
        <button
          className="hp-filters-reset"
          onClick={() => onChange(defaultFilters)}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
