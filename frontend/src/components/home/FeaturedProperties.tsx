import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import PropertyCard from "../properties/PropertyCard";
import { PROPERTIES } from "../../data/site";

export default function FeaturedProperties() {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: 0 });
  const featured = PROPERTIES.filter((p) => p.featured);

  // Keep the first card visually leading the track as it scrolls.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.querySelector<HTMLElement>("[data-card]");
    if (first && track.scrollLeft < 10) track.classList.add("grabbing-cursor");
  }, []);

  const scrollByCard = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 380) + 24;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // native touch scrolling
    const track = trackRef.current;
    if (!track) return;
    drag.current = { down: true, startX: e.clientX, startLeft: track.scrollLeft, moved: 0 };
    track.classList.add("is-dragging");
    track.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!drag.current.down || !track) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    track.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    const track = trackRef.current;
    drag.current.down = false;
    track?.classList.remove("is-dragging");
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved > 8) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <section className="bg-ivory py-20 lg:py-28">
      <div className="shell">
        <SectionHeading
          eyebrow="Featured"
          title="Featured Properties"
          description="A curated selection from our current portfolio — each one visited, vetted and personally known by our advisors."
        />

        <Reveal delay={150}>
          <div className="relative mt-12 lg:mt-14">
            <div
              ref={trackRef}
              role="region"
              aria-label="Featured properties carousel"
              tabIndex={0}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
              onClickCapture={onClickCapture}
              className="snap-track no-scrollbar flex gap-6 overflow-x-auto pb-2 outline-none"
              style={{
                paddingInlineStart: "max(1.25rem, calc((100vw - var(--shell)) / 2 + 2.5rem))",
                paddingInlineEnd: "max(1.25rem, calc((100vw - var(--shell)) / 2 + 2.5rem))",
              }}
            >
              {featured.map((property) => (
                <div data-card key={property.slug}>
                  <PropertyCard property={property} variant="carousel" />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous properties"
              className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-lg shadow-navy/10 transition-all duration-300 hover:bg-navy hover:text-white md:grid lg:-left-2"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next properties"
              className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-lg shadow-navy/10 transition-all duration-300 hover:bg-navy hover:text-white md:grid lg:-right-2"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={200} className="mt-10 text-center">
          <Link to="/properties" className="btn btn-outline">
            View All Properties
            <ArrowRight className="arrow" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
