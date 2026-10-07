import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface GalleryProps {
  images: string[];
  name: string;
}

export default function Gallery({ images, name }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, prev, next]);

  return (
    <div>
      <div className="group relative overflow-hidden rounded-2xl bg-navy-abyss">
        <img
          key={index}
          src={images[index]}
          alt={`${name} — photo ${index + 1} of ${images.length}`}
          className="fade-in aspect-[16/10] w-full object-cover"
        />

        <button
          type="button"
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-navy-abyss/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-navy-abyss group-hover:opacity-100 max-md:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-navy-abyss/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-navy-abyss group-hover:opacity-100 max-md:opacity-100"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Open full-screen viewer"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-navy-abyss/60 text-white backdrop-blur-sm transition-colors hover:bg-gold hover:text-navy-abyss"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </button>

        <span className="absolute bottom-4 right-4 rounded-full bg-navy-abyss/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
          {index + 1} / {images.length}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-3">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index}
            className={`overflow-hidden rounded-lg transition-all duration-200 focus-visible:outline-none ${
              i === index
                ? "ring-2 ring-gold ring-offset-2"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <img src={src} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} full-screen viewer`}
          className="fade-in fixed inset-0 z-[100] flex items-center justify-center bg-navy-abyss/95 p-4 backdrop-blur-sm sm:p-10"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close viewer"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold hover:text-navy-abyss sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold hover:text-navy-abyss sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <img
            src={images[index]}
            alt={`${name} — photo ${index + 1}`}
            className="fade-in max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold hover:text-navy-abyss sm:right-6"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white">
            {index + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
}
