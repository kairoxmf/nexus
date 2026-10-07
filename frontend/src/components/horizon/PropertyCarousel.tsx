import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Property } from "../../data/properties";
import { PropertyCard } from "./PropertyCard";

interface PropertyCarouselProps {
  properties: Property[];
}

export function PropertyCarousel({ properties }: PropertyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollByCards = useCallback((dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".hp-property-card") as HTMLElement;
    const amount = cardWidth ? cardWidth.offsetWidth + 24 : 400;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  };

  const stopDrag = () => setIsDragging(false);

  return (
    <div className="hp-carousel">
      <button
        className="hp-carousel-arrow hp-carousel-arrow-left"
        onClick={() => scrollByCards(-1)}
        aria-label="Previous properties"
      >
        <ChevronLeft size={24} strokeWidth={1.5} />
      </button>
      <div
        className="hp-carousel-track hp-no-scrollbar"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {properties.map((p) => (
          <div className="hp-carousel-item" key={p.id}>
            <PropertyCard property={p} />
          </div>
        ))}
      </div>
      <button
        className="hp-carousel-arrow hp-carousel-arrow-right"
        onClick={() => scrollByCards(1)}
        aria-label="Next properties"
      >
        <ChevronRight size={24} strokeWidth={1.5} />
      </button>
    </div>
  );
}
