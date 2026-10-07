import { useMemo, useState } from "react";
import { PropertyFilters, type FilterState, defaultFilters } from "../../components/horizon/PropertyFilters";
import { PropertyCard } from "../../components/horizon/PropertyCard";
import { properties, priceRanges } from "../../data/properties";

export function PropertiesPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filtered = useMemo(() => {
    let result = [...properties];

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }

    // Location
    if (filters.location !== "All") {
      result = result.filter((p) => p.city === filters.location);
    }

    // Type
    if (filters.type !== "All") {
      result = result.filter((p) => p.type === filters.type);
    }

    // Price
    const range = priceRanges.find((r) => r.label === filters.priceRange);
    if (range) {
      result = result.filter((p) => p.price >= range.min && p.price <= range.max);
    }

    // Bedrooms
    if (filters.bedrooms !== "Any") {
      const min = parseInt(filters.bedrooms);
      result = result.filter((p) => p.bedrooms >= min);
    }

    // Bathrooms
    if (filters.bathrooms !== "Any") {
      const min = parseInt(filters.bathrooms);
      result = result.filter((p) => p.bathrooms >= min);
    }

    // Sort
    switch (filters.sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "area-desc":
        result.sort((a, b) => b.area - a.area);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [filters]);

  return (
    <div className="hp-page">
      <div className="hp-page-hero">
        <div className="hp-container">
          <p className="hp-label-line">Our Portfolio</p>
          <h1 className="hp-heading">Properties</h1>
          <p className="hp-body">
            Browse our curated collection of exceptional homes and investment properties.
          </p>
        </div>
      </div>

      <div className="hp-container hp-properties-content">
        <PropertyFilters
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />

        {filtered.length > 0 ? (
          <div className="hp-properties-grid">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="hp-properties-empty">
            <p>No properties match your filters.</p>
            <button className="hp-btn hp-btn-outline" onClick={() => setFilters(defaultFilters)}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
