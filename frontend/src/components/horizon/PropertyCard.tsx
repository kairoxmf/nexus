import { Link } from "react-router-dom";
import { Bed, Bath, Maximize, Heart, MapPin } from "lucide-react";
import { type Property } from "../../data/properties";
import { useFavorites } from "../../hooks/useFavorites";

interface PropertyCardProps {
  property: Property;
  variant?: "default" | "large";
}

export function PropertyCard({ property, variant = "default" }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(property.id);

  return (
    <article className={`hp-property-card ${variant === "large" ? "hp-property-card-lg" : ""}`}>
      <Link to={`/properties/${property.slug}`} className="hp-property-card-link">
        <div className="hp-property-card-img hp-img-zoom">
          <img
            src={property.images[0]}
            alt={`${property.name} — ${property.location}`}
            loading="lazy"
          />
          <div className="hp-property-card-badge">{property.type}</div>
          <button
            className={`hp-fav-btn ${fav ? "hp-fav-btn-active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property.id);
            }}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={fav}
          >
            <Heart size={18} fill={fav ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>
          <div className="hp-property-card-price">{property.priceFormatted}</div>
        </div>
        <div className="hp-property-card-body">
          <h3 className="hp-property-card-name">{property.name}</h3>
          <p className="hp-property-card-location">
            <MapPin size={14} strokeWidth={1.5} />
            {property.location}
          </p>
          <div className="hp-property-card-specs">
            <span><Bed size={16} strokeWidth={1.5} /> {property.bedrooms} Beds</span>
            <span><Bath size={16} strokeWidth={1.5} /> {property.bathrooms} Baths</span>
            <span><Maximize size={16} strokeWidth={1.5} /> {property.areaFormatted}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
