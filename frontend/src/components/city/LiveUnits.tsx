import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vehicle } from "../../types";
import { geoToScene } from "../../lib/geo";

const COLORS: Record<string, string> = {
  ambulance: "#ff4655",
  fire_truck: "#f4a100",
  helicopter: "#4cc9f0",
  police: "#6c7ce0",
};

const UnitMesh = memo(function UnitMesh({ vehicle }: { vehicle: Vehicle }) {
  const ref = useRef<THREE.Group>(null!);
  const alt = vehicle.type === "helicopter" ? 50 : 3;
  const color = COLORS[vehicle.type] ?? "#4cc9f0";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const [x, , z] = geoToScene(vehicle.latitude, vehicle.longitude);
    ref.current.position.set(x, alt, z);
    ref.current.rotation.y = THREE.MathUtils.degToRad(vehicle.heading);
    if (vehicle.type === "helicopter") {
      ref.current.position.y = alt + Math.sin(clock.elapsedTime * 2) * 3;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[vehicle.type === "fire_truck" ? 8 : 6, 3, vehicle.type === "helicopter" ? 10 : 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
});

export const LiveUnits = memo(function LiveUnits({ vehicles }: { vehicles: Vehicle[] }) {
  if (!vehicles?.length) return null;
  return (
    <group>
      {vehicles.slice(0, 16).map((v) => (
        <UnitMesh key={v.id} vehicle={v} />
      ))}
    </group>
  );
});
