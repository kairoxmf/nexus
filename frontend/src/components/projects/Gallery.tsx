import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

interface GalleryProps {
  images: string[];
  title: string;
}

/** Project gallery: thumbnail navigation + fullscreen viewer with keyboard & swipe support. */
export default function Gallery({ images, title }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, next, prev]);

  return (
    <div>
      {/* Main image */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block w-full overflow-hidden rounded-xl focus-visible:outline-none"
        aria-label="Open fullscreen image viewer"
      >
        <img
          key={index}
          src={images[index]}
          alt={`${title} — image ${index + 1} of ${images.length}`}
          loading="lazy"
          className="fade-in aspect-[16/9] w-full object-cover"
        />
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-navy-abyss/70 px-3 py-2 text-[12px] font-bold text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <Expand className="h-4 w-4" aria-hidden="true" />
          View Fullscreen
        </span>
      </button>

      {/* Thumbnails */}
      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Project gallery images">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 ${
              i === index
                ? "border-gold opacity-100"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Fullscreen lightbox */}
      {lightbox && (
        <div
          className="fade-in fixed inset-0 z-[80] flex flex-col items-center justify-center bg-navy-abyss/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — fullscreen image viewer`}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            if (delta < -50) next();
            else if (delta > 50) prev();
            touchStartX.current = null;
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close fullscreen viewer"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <img
            key={images[index]}
            src={images[index]}
            alt={`${title} — fullscreen image ${index + 1}`}
            className="fade-in max-h-[80vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />

          <div className="mt-5 flex items-center gap-5">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:bg-gold hover:text-navy-abyss"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="text-sm font-bold tabular-nums text-white/80">
              {index + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-gold hover:bg-gold hover:text-navy-abyss"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
