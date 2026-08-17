import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type RobotAnim = "idle" | "listening" | "thinking" | "speaking";

type Props = {
  anim: RobotAnim;
  scale?: number;
};

export function CompanionRobot3D({ anim, scale = 1 }: Props) {
  const root = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const leftArm = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const antenna = useRef<THREE.Mesh>(null!);
  const leftEye = useRef<THREE.Mesh>(null!);
  const rightEye = useRef<THREE.Mesh>(null!);
  const mouth = useRef<THREE.Mesh>(null!);
  const ring = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = root.current;
    if (!g) return;

    const bob = Math.sin(t * 2.2) * 0.08;
    const sway = Math.sin(t * 1.1) * 0.12;
    g.position.y = bob;
    g.rotation.y = sway;

    if (head.current) {
      const nod =
        anim === "speaking"
          ? Math.sin(t * 14) * 0.04
          : anim === "listening"
            ? Math.sin(t * 3) * 0.06
            : Math.sin(t * 1.5) * 0.03;
      head.current.rotation.x = nod;
    }

    if (leftArm.current && rightArm.current) {
      const wave =
        anim === "speaking"
          ? Math.sin(t * 10) * 0.35
          : anim === "listening"
            ? Math.sin(t * 4) * 0.15
            : Math.sin(t * 2) * 0.08;
      leftArm.current.rotation.z = 0.35 + wave;
      rightArm.current.rotation.z = -0.35 - wave * 0.7;
    }

    const pulse =
      anim === "thinking"
        ? 0.5 + Math.sin(t * 8) * 0.45
        : anim === "speaking"
          ? 0.7 + Math.sin(t * 12) * 0.3
          : anim === "listening"
            ? 0.55 + Math.sin(t * 5) * 0.35
            : 0.35 + Math.sin(t * 2.5) * 0.15;

    [leftEye, rightEye].forEach((ref) => {
      if (!ref.current) return;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = pulse;
    });

    if (antenna.current) {
      const mat = antenna.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(t * 6) * 0.35;
    }

    if (mouth.current) {
      const mat = mouth.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        anim === "speaking" ? 0.6 + Math.abs(Math.sin(t * 18)) * 0.5 : 0.15;
      mouth.current.scale.x = anim === "speaking" ? 0.8 + Math.abs(Math.sin(t * 16)) * 0.35 : 1;
    }

    if (ring.current) {
      ring.current.rotation.z = t * 0.6;
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.opacity = anim === "thinking" ? 0.55 + Math.sin(t * 4) * 0.25 : 0.25;
    }
  });

  const bodyColor = "#1a2438";
  const accent = "#4cc9f0";
  const accentWarm = "#ffb347";

  return (
    <group ref={root} scale={scale}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.03, 12, 48]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.25}
          transparent
          opacity={0.25}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, -0.15, 0]}>
        <capsuleGeometry args={[0.42, 0.55, 6, 12]} />
        <meshStandardMaterial color={bodyColor} metalness={0.75} roughness={0.28} emissive="#0d2840" emissiveIntensity={0.12} />
      </mesh>

      <mesh position={[0, 0.08, 0.38]}>
        <boxGeometry args={[0.55, 0.18, 0.06]} />
        <meshStandardMaterial color="#243048" metalness={0.7} roughness={0.3} emissive={accentWarm} emissiveIntensity={0.08} />
      </mesh>

      <group ref={head} position={[0, 0.72, 0]}>
        <mesh>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial color="#222d42" metalness={0.8} roughness={0.22} />
        </mesh>

        <mesh ref={leftEye} position={[-0.13, 0.06, 0.3]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} metalness={0.5} roughness={0.1} />
        </mesh>
        <mesh ref={rightEye} position={[0.13, 0.06, 0.3]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} metalness={0.5} roughness={0.1} />
        </mesh>

        <mesh ref={mouth} position={[0, -0.1, 0.32]}>
          <boxGeometry args={[0.18, 0.04, 0.04]} />
          <meshStandardMaterial color={accentWarm} emissive={accentWarm} emissiveIntensity={0.15} />
        </mesh>

        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.22, 8]} />
          <meshStandardMaterial color="#3a4558" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh ref={antenna} position={[0, 0.56, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#ff4655" emissive="#ff4655" emissiveIntensity={0.5} metalness={0.4} roughness={0.2} />
        </mesh>
      </group>

      <group ref={leftArm} position={[-0.48, 0.15, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
          <meshStandardMaterial color="#3a4558" metalness={0.65} roughness={0.35} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.48, 0.15, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
          <meshStandardMaterial color="#3a4558" metalness={0.65} roughness={0.35} />
        </mesh>
      </group>

      <mesh position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.32, 32]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.35}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
