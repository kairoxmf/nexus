import { memo, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type BuildingKind = "tower" | "office" | "residential" | "industrial";

export interface BuildingDef {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  kind: BuildingKind;
  seed: number;
}

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const BODY_COLORS = ["#1a2840", "#1e3050", "#243858", "#152030"];
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export const CityBuildingsInstanced = memo(function CityBuildingsInstanced({
  buildings,
}: {
  buildings: BuildingDef[];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  const applyInstances = (scales: Float32Array) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      const sy = scales[i];
      _dummy.position.set(b.x, (b.h * sy) / 2, b.z);
      _dummy.scale.set(b.w, Math.max(0.04, b.h * sy), b.d);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
      _color.set(BODY_COLORS[Math.floor(hash(b.seed * 3) * BODY_COLORS.length)]);
      mesh.setColorAt(i, _color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const scales = new Float32Array(buildings.length).fill(1);
    applyInstances(scales);
  }, [buildings]);

  if (buildings.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        vertexColors
        emissive="#1a3050"
        emissiveIntensity={0.08}
        metalness={0.55}
        roughness={0.52}
      />
    </instancedMesh>
  );
});

export function generateCityBuildings(): BuildingDef[] {
  const buildings: BuildingDef[] = [];
  let seed = 0;

  for (let gx = -9; gx <= 9; gx++) {
    for (let gz = -7; gz <= 7; gz++) {
      if ((gx * 3 + gz * 2) % 5 === 0) continue;
      const cx = gx * 220 + (hash(seed++) - 0.5) * 50;
      const cz = gz * 210 + (hash(seed++) - 0.5) * 50;
      if (Math.hypot(cx, cz) < 200) continue;
      if (cz > 480 && cx < 200 && cx > -600) continue;
      if (Math.hypot(cx, cz) > 2800) continue;

      const roll = hash(seed++);
      const kind: BuildingKind =
        roll > 0.88 ? "tower" :
        roll > 0.55 ? "office" :
        roll > 0.25 ? "residential" : "industrial";

      const h =
        kind === "tower" ? 55 + hash(seed++) * 50 :
        kind === "office" ? 30 + hash(seed++) * 35 :
        kind === "residential" ? 16 + hash(seed++) * 18 :
        22 + hash(seed++) * 15;

      buildings.push({
        x: cx,
        z: cz,
        w: 28 + hash(seed++) * 24,
        d: 24 + hash(seed++) * 20,
        h,
        kind,
        seed: seed++,
      });

      if (hash(seed++) > 0.55) {
        buildings.push({
          x: cx + (hash(seed++) - 0.5) * 90,
          z: cz + (hash(seed++) - 0.5) * 90,
          w: 14 + hash(seed++) * 12,
          d: 12 + hash(seed++) * 10,
          h: 8 + hash(seed++) * 10,
          kind: "residential",
          seed: seed++,
        });
      }
    }
  }
  return buildings;
}

export function TrafficFlow({ paths }: { paths: [number, number, number][][] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const count = Math.min(6, paths.length);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const path = paths[i];
      if (!path || path.length < 2) continue;
      const prog = (t * (0.06 + i * 0.01) + i * 0.2) % 1;
      const seg = prog * (path.length - 1);
      const idx = Math.floor(seg);
      const frac = seg - idx;
      const a = path[idx];
      const b = path[Math.min(idx + 1, path.length - 1)];
      mesh.position.set(
        a[0] + (b[0] - a[0]) * frac,
        3,
        a[2] + (b[2] - a[2]) * frac,
      );
    }
  });

  const colors = ["#4cc9f0", "#f4a100", "#33c17a"];

  return (
    <>
      {paths.slice(0, count).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <boxGeometry args={[5, 2, 2.5]} />
          <meshBasicMaterial color={colors[i % colors.length]} />
        </mesh>
      ))}
    </>
  );
}

export const AnimatedRiver = memo(function AnimatedRiver() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0.35]} position={[-350, 0.8, 650]}>
      <planeGeometry args={[3400, 520, 1, 1]} />
      <meshStandardMaterial
        color="#0a2a40"
        emissive="#1a5080"
        emissiveIntensity={0.45}
        transparent
        opacity={0.88}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
});
