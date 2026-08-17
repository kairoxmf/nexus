import { forwardRef, memo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const BODY_COLORS = ["#1a2840", "#1e3048", "#243650", "#182838"];
const ACCENT = ["#4cc9f0", "#6fd6f7", "#88e0ff"];

/** Single building with lit window bands — home hero scene. */
export const RealisticBuilding = memo(function RealisticBuilding({
  x,
  z,
  w,
  d,
  h,
  seed = 0,
}: {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  seed?: number;
}) {
  const bodyColor = BODY_COLORS[Math.floor(hash(seed) * BODY_COLORS.length)];
  const accent = ACCENT[Math.floor(hash(seed * 2) * ACCENT.length)];
  const winRows = Math.min(Math.max(3, Math.floor(h / 2.2)), 14);

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={bodyColor} metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0, h + 0.15, 0]}>
        <boxGeometry args={[w * 0.92, 0.3, d * 0.92]} />
        <meshStandardMaterial color="#2a3850" metalness={0.6} roughness={0.25} />
      </mesh>
      {Array.from({ length: winRows }).map((_, row) => {
        const y = 1.2 + row * (h / winRows);
        const lit = hash(seed + row * 7) > 0.35;
        return (
          <mesh key={row} position={[0, y, d / 2 + 0.06]}>
            <boxGeometry args={[w * 0.78, 0.35, 0.08]} />
            <meshStandardMaterial
              color={lit ? accent : "#0a1420"}
              emissive={lit ? accent : "#000000"}
              emissiveIntensity={lit ? 0.55 : 0}
              metalness={0.8}
              roughness={0.15}
            />
          </mesh>
        );
      })}
      {h > 4 && (
        <mesh position={[0, h + 1.2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
          <meshStandardMaterial color="#8899aa" emissive={accent} emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
});

const PatrolRobotInner = memo(
  forwardRef<
    THREE.Group,
    { radius: number; speed: number; phase: number; y: number }
  >(function PatrolRobotInner({ radius, speed, phase, y }, ref) {
    const eyeRef = useRef<THREE.Mesh>(null!);

    useFrame(({ clock }) => {
      const g = (ref as RefObject<THREE.Group>).current;
      if (!g) return;
      const t = clock.elapsedTime * speed + phase;
      g.position.set(Math.cos(t) * radius, y + Math.sin(t * 2) * 0.15, Math.sin(t) * radius);
      g.rotation.y = -t + Math.PI / 2;
      if (eyeRef.current) {
        const m = eyeRef.current.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 6) * 0.35;
      }
    });

    return (
      <group ref={ref}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.55, 0.7, 0.4]} />
          <meshStandardMaterial color="#2a3548" metalness={0.7} roughness={0.3} emissive="#4cc9f0" emissiveIntensity={0.08} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.38, 0.32, 0.32]} />
          <meshStandardMaterial color="#1a2233" metalness={0.65} roughness={0.25} />
        </mesh>
        <mesh ref={eyeRef} position={[0, 1.08, 0.18]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#4cc9f0" emissive="#4cc9f0" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.22, 0.15, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color="#3a4558" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0.22, 0.15, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color="#3a4558" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.95, -0.22]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color="#3a4558" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
    );
  }),
);

export const PatrolRobot = memo(function PatrolRobot(props: {
  radius?: number;
  speed?: number;
  phase?: number;
  y?: number;
}) {
  const ref = useRef<THREE.Group>(null!);
  return (
    <PatrolRobotInner
      ref={ref}
      radius={props.radius ?? 11}
      speed={props.speed ?? 0.35}
      phase={props.phase ?? 0}
      y={props.y ?? 0.8}
    />
  );
});

export function generateHomeCity() {
  const defs: { x: number; z: number; w: number; d: number; h: number; seed: number }[] = [];
  let seed = 0;
  for (let gx = -4; gx <= 4; gx++) {
    for (let gz = -3; gz <= 3; gz++) {
      if (gx === 0 && gz === 0) continue;
      if (Math.hypot(gx, gz) < 1.2) continue;
      const x = gx * 3.2 + (hash(seed++) - 0.5) * 0.8;
      const z = gz * 3 + (hash(seed++) - 0.5) * 0.8;
      const h = 2.5 + hash(seed++) * 6 + (Math.abs(gx) + Math.abs(gz)) * 0.4;
      defs.push({
        x,
        z,
        w: 1.4 + hash(seed++) * 1.2,
        d: 1.2 + hash(seed++) * 1,
        h,
        seed: seed++,
      });
    }
  }
  return defs;
}
