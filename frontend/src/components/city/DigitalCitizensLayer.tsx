import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AdvancedModulesState } from "../../types";
import { geoToScene } from "../../lib/geo";

const BEHAVIOR_COLORS: Record<string, string> = {
  Evacuating: "#4cc9f0",
  Sheltering: "#33c17a",
  "Helping Others": "#f4a100",
  "Ignoring Warnings": "#6b7688",
  Trapped: "#ff4655",
  Panicking: "#ff4655",
};

type Citizen = NonNullable<AdvancedModulesState["digital_citizens"]>[number];

const CitizenAgent = memo(function CitizenAgent({ citizen }: { citizen: Citizen }) {
  const ref = useRef<THREE.Mesh>(null!);
  const color = BEHAVIOR_COLORS[citizen.behavior] ?? "#4cc9f0";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const [x, , z] = geoToScene(citizen.latitude, citizen.longitude);
    const bob = Math.sin(clock.elapsedTime * 2.5 + citizen.longitude * 800) * 0.8;
    ref.current.position.set(x, 5 + bob + citizen.panic_level * 3, z);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.2 + citizen.panic_level * 2.5, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.88} />
      <pointLight color={color} intensity={0.35} distance={18} decay={2} />
    </mesh>
  );
});

export const DigitalCitizensLayer = memo(function DigitalCitizensLayer({
  citizens,
}: {
  citizens?: AdvancedModulesState["digital_citizens"];
}) {
  if (!citizens?.length) return null;
  return (
    <group>
      {citizens.slice(0, 48).map((c) => (
        <CitizenAgent key={c.id} citizen={c} />
      ))}
    </group>
  );
});
