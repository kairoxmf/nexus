import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  Check,
  Phone,
  Mail,
  Heart,
  Calendar,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { getPropertyBySlug, getSimilarProperties } from "../../data/properties";
import { PropertyGallery } from "../../components/horizon/PropertyGallery";
import { PropertyCard } from "../../components/horizon/PropertyCard";
import { ScrollReveal } from "../../components/horizon/ScrollReveal";
import { useFavorites } from "../../hooks/useFavorites";

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const property = getPropertyBySlug(id || "");
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showContactForm, setShowContactForm] = useState(false);

  if (!property) {
    return (
      <div className="hp-container" style={{ padding: "120px 0", textAlign: "center" }}>
        <h1 className="hp-heading">Property not found</h1>
        <p className="hp-body" style={{ margin: "16px 0 32px" }}>
          The property you're looking for is no longer available.
        </p>
        <Link to="/properties" className="hp-btn hp-btn-primary">
          Back to Properties
          <ArrowRight size={16} className="hp-btn-arrow" />
        </Link>
      </div>
    );
  }

  const fav = isFavorite(property.id);
  const similar = getSimilarProperties(property, 3);

  return (
    <div className="hp-detail">
      {/* Sticky mobile CTA */}
      <div className="hp-detail-mobile-cta">
        <span className="hp-detail-mobile-price">{property.priceFormatted}</span>
        <button
          className="hp-btn hp-btn-primary"
          onClick={() => setShowContactForm(true)}
        >
          Contact Agent
        </button>
      </div>

      <div className="hp-container hp-detail-top">
        <Link to="/properties" className="hp-detail-back">
          <ArrowLeft size={16} strokeWidth={1.5} />
          All Properties
        </Link>
      </div>

      <div className="hp-container">
        <PropertyGallery images={property.images} title={property.name} />
      </div>

      <div className="hp-container hp-detail-body">
        <div className="hp-detail-main">
          <div className="hp-detail-header">
            <div>
              <p className="hp-label-line">{property.type}</p>
              <h1 className="hp-heading">{property.name}</h1>
              <p className="hp-detail-location">
                <MapPin size={18} strokeWidth={1.5} />
                {property.location}
              </p>
            </div>
            <button
              className={`hp-fav-btn hp-fav-btn-lg ${fav ? "hp-fav-btn-active" : ""}`}
              onClick={() => toggleFavorite(property.id)}
              aria-pressed={fav}
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={20} fill={fav ? "currentColor" : "none"} strokeWidth={1.5} />
              <span>{fav ? "Saved" : "Save"}</span>
            </button>
          </div>

          <div className="hp-detail-specs">
            <div className="hp-detail-spec">
              <Bed size={24} strokeWidth={1.5} />
              <div>
                <span className="hp-detail-spec-val">{property.bedrooms}</span>
                <span className="hp-detail-spec-label">Bedrooms</span>
              </div>
            </div>
            <div className="hp-detail-spec">
              <Bath size={24} strokeWidth={1.5} />
              <div>
                <span className="hp-detail-spec-val">{property.bathrooms}</span>
                <span className="hp-detail-spec-label">Bathrooms</span>
              </div>
            </div>
            <div className="hp-detail-spec">
              <Maximize size={24} strokeWidth={1.5} />
              <div>
                <span className="hp-detail-spec-val">{property.areaFormatted}</span>
                <span className="hp-detail-spec-label">Area</span>
              </div>
            </div>
          </div>

          <div className="hp-detail-section">
            <h2 className="hp-detail-h2">Description</h2>
            <p className="hp-body">{property.description}</p>
          </div>

          <div className="hp-detail-section">
            <h2 className="hp-detail-h2">Key Features</h2>
            <div className="hp-detail-features">
              {property.features.map((f) => (
                <div key={f} className="hp-detail-feature">
                  <Check size={18} strokeWidth={1.5} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="hp-detail-section">
            <h2 className="hp-detail-h2">Amenities</h2>
            <div className="hp-detail-features">
              {property.amenities.map((a) => (
                <div key={a} className="hp-detail-feature">
                  <Check size={18} strokeWidth={1.5} />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hp-detail-sidebar">
          <div className="hp-detail-price-card">
            <div className="hp-detail-price">{property.priceFormatted}</div>
            <div className="hp-divider" />
            <div className="hp-detail-agent">
              <img src={property.agent.photo} alt={property.agent.name} />
              <div>
                <h3 className="hp-detail-agent-name">{property.agent.name}</h3>
                <p className="hp-detail-agent-role">{property.agent.role}</p>
              </div>
            </div>
            <div className="hp-detail-agent-contact">
              <a href={`tel:${property.agent.phone}`}>
                <Phone size={16} strokeWidth={1.5} />
                {property.agent.phone}
              </a>
              <a href={`mailto:${property.agent.email}`}>
                <Mail size={16} strokeWidth={1.5} />
                {property.agent.email}
              </a>
            </div>
            <button
              className="hp-btn hp-btn-primary hp-detail-cta"
              onClick={() => setShowContactForm(true)}
            >
              Contact Agent
              <ArrowRight size={16} className="hp-btn-arrow" />
            </button>
            <button className="hp-btn hp-btn-outline hp-detail-cta">
              <Calendar size={16} />
              Schedule a Viewing
            </button>
          </div>
        </aside>
      </div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="hp-section hp-detail-similar">
          <div className="hp-container">
            <ScrollReveal className="hp-detail-similar-header">
              <h2 className="hp-heading">Similar Properties</h2>
              <Link to="/properties" className="hp-featured-link">
                View All
                <ArrowRight size={16} />
              </Link>
            </ScrollReveal>
            <div className="hp-properties-grid">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact modal */}
      {showContactForm && (
        <div className="hp-modal-overlay" onClick={() => setShowContactForm(false)}>
          <div className="hp-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="hp-modal-close"
              onClick={() => setShowContactForm(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="hp-heading">Contact Agent</h2>
            <p className="hp-body" style={{ margin: "8px 0 24px" }}>
              Interested in {property.name}? Send a message to {property.agent.name}.
            </p>
            <form
              className="hp-contact-form"
              onSubmit={(e) => {
                e.preventDefault();
                setShowContactForm(false);
                navigate("/contact");
              }}
            >
              <div className="hp-form-row">
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
              </div>
              <input type="tel" placeholder="Your Phone" />
              <textarea placeholder="I'm interested in this property..." rows={4} />
              <button type="submit" className="hp-btn hp-btn-primary">
                Send Message
                <ArrowRight size={16} className="hp-btn-arrow" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
