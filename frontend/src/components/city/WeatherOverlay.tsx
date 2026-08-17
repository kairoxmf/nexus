import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WeatherState } from "../../types";

export const WeatherOverlay = memo(function WeatherOverlay({ weather }: { weather?: WeatherState }) {
  const rainRef = useRef<THREE.Points>(null!);
  const overlay = weather?.overlay ?? "none";

  const rainGeo = useMemo(() => {
    if (overlay !== "rain") return null;
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3000;
      pos[i * 3 + 1] = Math.random() * 300 + 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [overlay]);

  useFrame(() => {
    if (!rainRef.current || overlay !== "rain") return;
    const attr = rainRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < attr.count; i++) {
      const yi = i * 3 + 1;
      arr[yi] -= 3;
      if (arr[yi] < 0) arr[yi] = 340;
    }
    attr.needsUpdate = true;
  });

  if (overlay === "none") return null;

  return (
    <group>
      {overlay === "rain" && rainGeo && (
        <points ref={rainRef} geometry={rainGeo}>
          <pointsMaterial color="#6ab0ff" size={1.5} transparent opacity={0.5} sizeAttenuation />
        </points>
      )}
      {overlay === "smoke" && (
        <mesh position={[0, 180, 0]}>
          <sphereGeometry args={[1600, 12, 12]} />
          <meshBasicMaterial color="#443322" transparent opacity={0.06} side={THREE.BackSide} />
        </mesh>
      )}
      {overlay === "heat" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
          <planeGeometry args={[4000, 4000]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.03} />
        </mesh>
      )}
    </group>
  );
});
