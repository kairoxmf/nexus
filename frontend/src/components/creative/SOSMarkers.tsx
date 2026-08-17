import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { geoToScene } from "../../lib/geo";
import type { CreativeModulesState } from "../../types";

export const SOSMarkers = memo(function SOSMarkers({ sos }: { sos?: CreativeModulesState["sos_sync"] }) {
  if (!sos?.reports?.length) return null;

  return (
    <group>
      {sos.reports.slice(0, 10).map((r) => (
        <SOSPin key={r.id} lat={r.latitude} lng={r.longitude} />
      ))}
    </group>
  );
});

function SOSPin({ lat, lng }: { lat: number; lng: number }) {
  const ringRef = useRef<THREE.Mesh>(null!);
  const [x, , z] = geoToScene(lat, lng);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.15);
    }
  });

  return (
    <group position={[x, 8, z]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[12, 18, 24]} />
        <meshBasicMaterial color="#ff0044" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 20, 0]}>
        <coneGeometry args={[6, 24, 4]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={0.8} />
      </mesh>
      <pointLight color="#ff0044" intensity={2} distance={80} />
    </group>
  );
}
