import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";

/** Canvas that fills the map panel with correct pixel dimensions. */
export function MapCanvas({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setSize({ w, h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="map-canvas-wrap">
      {size.w > 0 && size.h > 0 && (
        <Canvas
          className="city-3d-canvas"
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
          style={{ width: size.w, height: size.h, display: "block", touchAction: "none" }}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
