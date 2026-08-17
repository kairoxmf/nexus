import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BuildingDef, BuildingKind } from "./Buildings";

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type WindowSlot = {
  matrix: THREE.Matrix4;
  color: THREE.Color;
  phase: number;
  flicker: boolean;
};

const KIND_STYLE: Record<
  BuildingKind,
  { colStep: number; rowStep: number; winW: number; winH: number; litChance: number; margin: number }
> = {
  tower: { colStep: 7.5, rowStep: 6.5, winW: 4.2, winH: 5.2, litChance: 0.78, margin: 0.12 },
  office: { colStep: 9, rowStep: 7.5, winW: 5, winH: 5.5, litChance: 0.68, margin: 0.14 },
  residential: { colStep: 10, rowStep: 6, winW: 4.5, winH: 4.8, litChance: 0.52, margin: 0.16 },
  industrial: { colStep: 14, rowStep: 9, winW: 6, winH: 5, litChance: 0.28, margin: 0.2 },
};

function windowColor(kind: BuildingKind, seed: number, lit: boolean): THREE.Color {
  if (!lit) return new THREE.Color("#0a1420");
  const h = hash(seed);
  if (kind === "residential") {
    return new THREE.Color().setHSL(0.09 + h * 0.06, 0.85, 0.55 + h * 0.15);
  }
  if (kind === "industrial") {
    return new THREE.Color().setHSL(0.12, 0.7, 0.45 + h * 0.12);
  }
  if (kind === "tower") {
    return h > 0.55
      ? new THREE.Color("#a8e8ff")
      : new THREE.Color().lerpColors(new THREE.Color("#4cc9f0"), new THREE.Color("#e8f4ff"), h);
  }
  return new THREE.Color().lerpColors(new THREE.Color("#6eb8ff"), new THREE.Color("#d0e8ff"), h);
}

function addFaceWindows(
  out: WindowSlot[],
  b: BuildingDef,
  face: "px" | "nx" | "pz" | "nz",
  seedBase: number,
) {
  const style = KIND_STYLE[b.kind];
  const faceW = face === "px" || face === "nx" ? b.d : b.w;
  const cols = Math.max(1, Math.floor((faceW * (1 - style.margin * 2)) / style.colStep));
  const rows = Math.max(1, Math.floor((b.h * (1 - style.margin * 2)) / style.rowStep));
  const insetX = (faceW - cols * style.colStep) * 0.5;
  const baseY = b.h * style.margin;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const s = seedBase + row * 17 + col * 31 + face.charCodeAt(0) * 13;
      const lit = hash(s) < style.litChance;
      const wx = -faceW / 2 + insetX + col * style.colStep + style.colStep * 0.5;
      const wy = baseY + row * style.rowStep + style.rowStep * 0.5;

      const m = new THREE.Matrix4();
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scl = new THREE.Vector3(style.winW, style.winH, 1);

      if (face === "pz") {
        pos.set(b.x + wx, wy, b.z + b.d / 2 + 0.35);
        quat.setFromEuler(new THREE.Euler(0, 0, 0));
      } else if (face === "nz") {
        pos.set(b.x + wx, wy, b.z - b.d / 2 - 0.35);
        quat.setFromEuler(new THREE.Euler(0, Math.PI, 0));
      } else if (face === "px") {
        pos.set(b.x + b.w / 2 + 0.35, wy, b.z + wx);
        quat.setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
      } else {
        pos.set(b.x - b.w / 2 - 0.35, wy, b.z + wx);
        quat.setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0));
      }

      m.compose(pos, quat, scl);
      out.push({
        matrix: m,
        color: windowColor(b.kind, s, lit),
        phase: hash(s + 99) * Math.PI * 2,
        flicker: lit && hash(s + 7) > 0.88,
      });
    }
  }
}

function computeWindows(buildings: BuildingDef[]): WindowSlot[] {
  const slots: WindowSlot[] = [];
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    const base = b.seed * 1000 + i;
    if (b.kind === "tower" || hash(base) > 0.15) addFaceWindows(slots, b, "pz", base);
    if (b.kind === "tower" || hash(base + 1) > 0.2) addFaceWindows(slots, b, "px", base + 100);
    if (hash(base + 2) > 0.25) addFaceWindows(slots, b, "nz", base + 200);
    if (hash(base + 3) > 0.3) addFaceWindows(slots, b, "nx", base + 300);
  }
  return slots;
}

function computeRoofLights(buildings: BuildingDef[]): WindowSlot[] {
  const slots: WindowSlot[] = [];
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    if (b.kind !== "tower" && hash(b.seed + i) > 0.35) continue;
    const s = b.seed + i * 47;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3(b.x, b.h + 1.2, b.z);
    const quat = new THREE.Quaternion();
    quat.setFromEuler(new THREE.Euler(0, hash(s) * Math.PI * 2, 0));
    const size = b.kind === "tower" ? 3.5 : 2;
    m.compose(pos, quat, new THREE.Vector3(size, size * 0.4, size));
    const c = b.kind === "tower"
      ? new THREE.Color("#4cc9f0")
      : new THREE.Color().setHSL(0.08, 0.9, 0.5);
    slots.push({ matrix: m, color: c, phase: hash(s) * 6.28, flicker: true });
  }
  return slots;
}

export const BuildingWindows = memo(function BuildingWindows({
  buildings,
}: {
  buildings: BuildingDef[];
}) {
  const windows = useMemo(() => computeWindows(buildings), [buildings]);
  const roofs = useMemo(() => computeRoofLights(buildings), [buildings]);
  const winRef = useRef<THREE.InstancedMesh>(null!);
  const roofRef = useRef<THREE.InstancedMesh>(null!);
  const baseColors = useRef<THREE.Color[]>([]);

  useLayoutEffect(() => {
    const mesh = winRef.current;
    if (!mesh || windows.length === 0) return;
    baseColors.current = windows.map((w) => w.color.clone());
    for (let i = 0; i < windows.length; i++) {
      mesh.setMatrixAt(i, windows[i].matrix);
      mesh.setColorAt(i, windows[i].color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [windows]);

  useLayoutEffect(() => {
    const mesh = roofRef.current;
    if (!mesh || roofs.length === 0) return;
    for (let i = 0; i < roofs.length; i++) {
      mesh.setMatrixAt(i, roofs[i].matrix);
      mesh.setColorAt(i, roofs[i].color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [roofs]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const winMesh = winRef.current;
    if (winMesh?.instanceColor && windows.length > 0) {
      const tmp = new THREE.Color();
      for (let i = 0; i < windows.length; i++) {
        const w = windows[i];
        const base = baseColors.current[i];
        if (!base || base.getHex() === 0x0a1420) continue;
        if (w.flicker) {
          const pulse = 0.72 + Math.sin(t * 4 + w.phase) * 0.18 + Math.sin(t * 11 + w.phase * 2) * 0.08;
          tmp.copy(base).multiplyScalar(pulse);
          winMesh.setColorAt(i, tmp);
        }
      }
      winMesh.instanceColor.needsUpdate = true;
    }

    const roofMesh = roofRef.current;
    if (roofMesh?.material) {
      const mat = roofMesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.9 + Math.sin(t * 2.5) * 0.25;
    }
  });

  if (windows.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={winRef} args={[undefined, undefined, windows.length]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          vertexColors
          emissive="#ffffff"
          emissiveIntensity={1.8}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped
        />
      </instancedMesh>
      {roofs.length > 0 && (
        <instancedMesh ref={roofRef} args={[undefined, undefined, roofs.length]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            vertexColors
            emissive="#4cc9f0"
            emissiveIntensity={1.2}
            transparent
            opacity={0.85}
            toneMapped
          />
        </instancedMesh>
      )}
    </group>
  );
});
