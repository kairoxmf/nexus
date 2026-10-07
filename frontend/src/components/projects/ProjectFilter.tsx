import { ChevronDown, Search, X } from "lucide-react";

export interface ProjectFilterState {
  query: string;
  category: string;
  industry: string;
  location: string;
  year: string;
  size: string;
  sort: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-line bg-white py-2.5 pl-3.5 pr-9 text-[13px] font-bold text-ink outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "All" ? `${label}: All` : opt}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </label>
  );
}

interface ProjectFilterProps {
  filters: ProjectFilterState;
  onChange: (patch: Partial<ProjectFilterState>) => void;
  onReset: () => void;
  options: {
    categories: string[];
    industries: string[];
    locations: string[];
    years: string[];
    sizes: string[];
    sorts: string[];
  };
  resultCount: number;
}

export default function ProjectFilter({ filters, onChange, onReset, options, resultCount }: ProjectFilterProps) {
  const hasActive =
    filters.query !== "" ||
    filters.category !== "All" ||
    filters.industry !== "All" ||
    filters.location !== "All" ||
    filters.year !== "All" ||
    filters.size !== "All";

  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* Search */}
        <div className="relative lg:w-72">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Search projects..."
            aria-label="Search projects"
            className="field !py-2.5 !pl-10 !text-[13px]"
          />
        </div>

        {/* Sort */}
        <div className="lg:ml-auto lg:w-44">
          <Select label="Sort" value={filters.sort} options={options.sorts} onChange={(v) => onChange({ sort: v })} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by project type">
          {options.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ category: cat })}
              aria-pressed={filters.category === cat}
              className={`rounded-full px-4 py-2 text-[12.5px] font-bold transition-all duration-200 ${
                filters.category === cat
                  ? "bg-navy-darker text-white"
                  : "bg-mist text-ink/70 hover:bg-gold-pale hover:text-navy-darker"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select label="Industry" value={filters.industry} options={options.industries} onChange={(v) => onChange({ industry: v })} />
        <Select label="Location" value={filters.location} options={options.locations} onChange={(v) => onChange({ location: v })} />
        <Select label="Year" value={filters.year} options={options.years} onChange={(v) => onChange({ year: v })} />
        <Select label="Size" value={filters.size} options={options.sizes} onChange={(v) => onChange({ size: v })} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <p className="text-[12.5px] font-bold text-muted" role="status">
          {resultCount} project{resultCount === 1 ? "" : "s"} found
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-gold-dark transition-colors hover:text-navy-darker"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
