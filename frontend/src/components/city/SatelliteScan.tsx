import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SatelliteScanState } from "../../types";

export const SatelliteScan = memo(function SatelliteScan({ scan }: { scan?: SatelliteScanState }) {
  const beamRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!scan?.active || !beamRef.current) return;
    beamRef.current.rotation.z = (scan.sweep_angle_deg * Math.PI) / 180;
  });

  if (!scan?.active) return null;

  return (
    <group position={[0, 4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[700, 720, 32]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.08} />
      </mesh>
      <mesh ref={beamRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[400, 2000, 32, 1, 0, 0.1]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.05} />
      </mesh>
    </group>
  );
});
