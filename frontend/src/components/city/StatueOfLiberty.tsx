import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Stylized Statue of Liberty — centerpiece of the DC twin with holographic effects. */
export const StatueOfLiberty = memo(function StatueOfLiberty({ scale = 1 }: { scale?: number }) {
  const root = useRef<THREE.Group>(null!);
  const torch = useRef<THREE.Group>(null!);
  const flame = useRef<THREE.Mesh>(null!);
  const beam = useRef<THREE.Mesh>(null!);
  const rings = useRef<THREE.Group>(null!);
  const pulse = useRef<THREE.Mesh>(null!);
  const torchLight = useRef<THREE.PointLight>(null!);
  const ringA = useRef<THREE.Mesh>(null!);
  const ringB = useRef<THREE.Mesh>(null!);

  const copper = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#3d8b7a",
      metalness: 0.55,
      roughness: 0.38,
      emissive: "#1a5048",
      emissiveIntensity: 0.12,
    }),
    [],
  );

  const flameMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#ffd166",
      emissive: "#ff9500",
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.95,
    }),
    [],
  );

  const stone = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#8a9098",
      metalness: 0.15,
      roughness: 0.82,
    }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (torch.current) {
      torch.current.rotation.z = Math.sin(t * 0.6) * 0.015;
    }
    if (flame.current) {
      const s = 1 + Math.sin(t * 9) * 0.12 + Math.sin(t * 14) * 0.06;
      flame.current.scale.set(s, s * (1.1 + Math.sin(t * 11) * 0.15), s);
      const mat = flame.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.2 + Math.sin(t * 8) * 0.45;
    }
    if (beam.current) {
      beam.current.scale.y = 1 + Math.sin(t * 2.5) * 0.08;
      const mat = beam.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.07 + Math.sin(t * 3) * 0.03;
    }
    if (rings.current) {
      rings.current.rotation.y = t * 0.35;
    }
    if (ringA.current) ringA.current.rotation.x = t * 0.5;
    if (ringB.current) ringB.current.rotation.z = -t * 0.4;
    if (pulse.current) {
      const s = 1 + (t % 3) * 0.55;
      pulse.current.scale.set(s, s, s);
      const mat = pulse.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.35 - (t % 3) * 0.12);
    }
    if (torchLight.current) {
      torchLight.current.intensity = 2.2 + Math.sin(t * 7) * 0.8;
    }
    if (root.current) {
      root.current.position.y = Math.sin(t * 0.9) * 0.6;
    }
  });

  return (
    <group scale={scale} ref={root} position={[0, 0, 0]}>
      {/* Pedestal & fort base */}
      <mesh position={[0, 8, 0]} material={stone}>
        <boxGeometry args={[72, 16, 72]} />
      </mesh>
      <mesh position={[0, 22, 0]} material={stone}>
        <cylinderGeometry args={[28, 34, 20, 8]} />
      </mesh>
      <mesh position={[0, 38, 0]} material={stone}>
        <cylinderGeometry args={[22, 26, 14, 12]} />
      </mesh>

      {/* Robe / body */}
      <mesh position={[0, 72, 0]} material={copper}>
        <cylinderGeometry args={[11, 18, 52, 14]} />
      </mesh>
      <mesh position={[0, 108, 0]} material={copper}>
        <cylinderGeometry args={[9, 11, 28, 12]} />
      </mesh>

      {/* Head & crown */}
      <mesh position={[0, 128, 0]} material={copper}>
        <sphereGeometry args={[7.5, 16, 16]} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 8, 136, Math.sin(a) * 8]} rotation={[0.4, a, 0]} material={copper}>
            <coneGeometry args={[1.2, 5, 4]} />
          </mesh>
        );
      })}

      {/* Raised arm + torch */}
      <group ref={torch} position={[14, 98, 0]} rotation={[0, 0, -0.85]}>
        <mesh position={[0, 14, 0]} material={copper}>
          <cylinderGeometry args={[2.2, 2.8, 28, 8]} />
        </mesh>
        <mesh position={[0, 30, 0]} material={copper}>
          <cylinderGeometry args={[2.8, 2.2, 6, 8]} />
        </mesh>
        <group position={[0, 36, 0]}>
          <mesh ref={flame} material={flameMat}>
            <sphereGeometry args={[4.5, 12, 12]} />
          </mesh>
          <pointLight ref={torchLight} color="#ffb347" intensity={2.5} distance={220} decay={2} />
        </group>
      </group>

      {/* Tablet arm */}
      <mesh position={[-12, 88, 4]} rotation={[0.2, 0.3, 0.55]} material={copper}>
        <boxGeometry args={[4, 22, 14]} />
      </mesh>

      {/* Light beam from torch */}
      <mesh ref={beam} position={[14, 150, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[2, 18, 120, 16, 1, true]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Holographic rings */}
      <group ref={rings} position={[0, 55, 0]}>
        <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[48, 0.6, 8, 64]} />
          <meshBasicMaterial color="#4cc9f0" transparent opacity={0.45} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 3, 0.5, 0]}>
          <torusGeometry args={[62, 0.45, 8, 64]} />
          <meshBasicMaterial color="#33c17a" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Ground pulse */}
      <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.5, 0]}>
        <ringGeometry args={[40, 44, 48]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Plaza glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
        <circleGeometry args={[55, 48]} />
        <meshStandardMaterial
          color="#0a1828"
          emissive="#4cc9f0"
          emissiveIntensity={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
});
