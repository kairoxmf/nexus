import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const next = useCallback(() => {
    setActiveIdx((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, next, prev]);

  return (
    <>
      <div className="hp-gallery">
        <div className="hp-gallery-main hp-img-zoom">
          <img src={images[activeIdx]} alt={`${title} — view ${activeIdx + 1}`} />
          <button
            className="hp-gallery-fullscreen"
            onClick={() => setFullscreen(true)}
            aria-label="View fullscreen"
          >
            <Expand size={20} strokeWidth={1.5} />
          </button>
          <button
            className="hp-gallery-nav hp-gallery-nav-left"
            onClick={prev}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          <button
            className="hp-gallery-nav hp-gallery-nav-right"
            onClick={next}
            aria-label="Next image"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        </div>
        <div className="hp-gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`hp-gallery-thumb ${i === activeIdx ? "hp-gallery-thumb-active" : ""}`}
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt={`${title} — thumbnail ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {fullscreen && (
        <div className="hp-gallery-fullscreen-overlay" onClick={() => setFullscreen(false)}>
          <button className="hp-gallery-fullscreen-close" aria-label="Close fullscreen">
            <X size={28} strokeWidth={1.5} />
          </button>
          <img src={images[activeIdx]} alt={`${title} — fullscreen view`} />
          <button
            className="hp-gallery-nav hp-gallery-nav-left"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
          >
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
          <button
            className="hp-gallery-nav hp-gallery-nav-right"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next image"
          >
            <ChevronRight size={28} strokeWidth={1.5} />
          </button>
          <span className="hp-gallery-counter">
            {activeIdx + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
