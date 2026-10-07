import { Link } from "react-router-dom";
import { Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import { formatPrice, type Property } from "../../data/site";
import { useFavorites } from "../../context/FavoritesContext";

interface PropertyCardProps {
  property: Property;
  variant?: "carousel" | "grid";
}

export default function PropertyCard({ property, variant = "grid" }: PropertyCardProps) {
  const { has, toggle } = useFavorites();
  const fav = has(property.slug);

  return (
    <Link
      to={`/properties/${property.slug}`}
      className={`group block shrink-0 rounded-2xl border border-line bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 ${
        variant === "carousel" ? "w-[310px] sm:w-[340px] lg:w-[380px]" : "w-full"
      }`}
    >
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={property.images[0]}
          alt={property.name}
          loading="lazy"
          className="zoom-img aspect-[4/3] w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-navy-abyss/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          {property.type}
        </span>
        <button
          type="button"
          aria-pressed={fav}
          aria-label={fav ? `Remove ${property.name} from favorites` : `Save ${property.name} to favorites`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(property.slug);
          }}
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            fav ? "bg-gold text-navy-abyss" : "bg-white/90 text-ink/70 hover:text-navy"
          }`}
        >
          <Heart className={`h-[18px] w-[18px] ${fav ? "fill-current" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <div className="px-3 pb-3 pt-4 sm:px-4 sm:pb-4">
        <h3 className="text-[17px] font-extrabold text-ink transition-colors duration-200 group-hover:text-navy">
          {property.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          {property.location}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
          <span className="text-[17px] font-extrabold text-navy">
            {formatPrice(property.price)}
          </span>
          <span className="flex items-center gap-3 text-xs font-bold text-muted">
            <span className="flex items-center gap-1" title={`${property.beds} bedrooms`}>
              <BedDouble className="h-4 w-4 text-gold" aria-hidden="true" />
              {property.beds}
            </span>
            <span className="flex items-center gap-1" title={`${property.baths} bathrooms`}>
              <Bath className="h-4 w-4 text-gold" aria-hidden="true" />
              {property.baths}
            </span>
            <span className="flex items-center gap-1" title={`${property.sqft.toLocaleString()} square feet`}>
              <Ruler className="h-4 w-4 text-gold" aria-hidden="true" />
              {(property.sqft / 1000).toFixed(1)}k
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
