import { memo, useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { geoToScene } from "../../lib/geo";
import { DC_BRIDGES, DC_ROADS, roadStyle, type RoadKind } from "../../lib/dcRoads";
import { TrafficSystem } from "./TrafficSystem";

function toSceneLine(points: [number, number][], y: number): THREE.Vector3[] {
  return points.map(([lat, lng]) => {
    const [x, , z] = geoToScene(lat, lng);
    return new THREE.Vector3(x, y, z);
  });
}

const RoadLines = memo(function RoadLines({ kind, segments }: { kind: RoadKind; segments: typeof DC_ROADS }) {
  const style = roadStyle(kind);
  const filtered = segments.filter((s) => s.kind === kind);

  return (
    <>
      {filtered.map((road) => {
        const pts = toSceneLine(road.points, style.y);
        if (pts.length < 2) return null;
        return (
          <Line
            key={road.id}
            points={pts}
            color={style.color}
            lineWidth={style.width}
            transparent
            opacity={style.opacity}
          />
        );
      })}
    </>
  );
});

const AvenueSurfaces = memo(function AvenueSurfaces() {
  const surfaces = useMemo(() => {
    const meshes: { key: string; position: [number, number, number]; length: number; rotation: number }[] = [];

    for (const road of DC_ROADS) {
      if (road.kind !== "avenue" && road.kind !== "highway") continue;
      for (let i = 0; i < road.points.length - 1; i++) {
        const [lat1, lng1] = road.points[i];
        const [lat2, lng2] = road.points[i + 1];
        const [x1, , z1] = geoToScene(lat1, lng1);
        const [x2, , z2] = geoToScene(lat2, lng2);
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.hypot(dx, dz);
        if (len < 20) continue;
        meshes.push({
          key: `${road.id}-${i}`,
          position: [(x1 + x2) / 2, 1.2, (z1 + z2) / 2],
          length: len,
          rotation: Math.atan2(dx, dz),
        });
      }
    }
    return meshes;
  }, []);

  return (
    <>
      {surfaces.map((s) => (
        <mesh key={s.key} position={s.position} rotation={[-Math.PI / 2, s.rotation, 0]}>
          <planeGeometry args={[14, s.length]} />
          <meshStandardMaterial
            color="#1a3050"
            emissive="#3a6090"
            emissiveIntensity={0.18}
            transparent
            opacity={0.55}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>
      ))}
    </>
  );
});

const Bridge3D = memo(function Bridge3D({
  lat,
  lng,
  length,
  rotation,
  width,
}: {
  lat: number;
  lng: number;
  length: number;
  rotation: number;
  width: number;
}) {
  const [x, , z] = geoToScene(lat, lng);

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Deck */}
      <mesh position={[0, 14, 0]}>
        <boxGeometry args={[width, 2.5, length]} />
        <meshStandardMaterial
          color="#3a5068"
          emissive="#6a90b0"
          emissiveIntensity={0.25}
          metalness={0.5}
          roughness={0.45}
        />
      </mesh>
      {/* Railings */}
      <mesh position={[width / 2 - 0.8, 18, 0]}>
        <boxGeometry args={[1.2, 6, length]} />
        <meshStandardMaterial color="#4cc9f0" emissive="#4cc9f0" emissiveIntensity={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-width / 2 + 0.8, 18, 0]}>
        <boxGeometry args={[1.2, 6, length]} />
        <meshStandardMaterial color="#4cc9f0" emissive="#4cc9f0" emissiveIntensity={0.3} transparent opacity={0.7} />
      </mesh>
      {/* Pillars */}
      {[-0.35, -0.12, 0.12, 0.35].map((t, i) => (
        <mesh key={i} position={[0, 7, t * length]}>
          <cylinderGeometry args={[2.5, 3, 14, 8]} />
          <meshStandardMaterial color="#2a3848" emissive="#4a6888" emissiveIntensity={0.15} />
        </mesh>
      ))}
      {/* Arch glow under deck */}
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[width - 4, 1, length - 20]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.12} />
      </mesh>
      {/* Approach ramps */}
      <mesh position={[0, 6, length / 2 + 18]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[width - 2, 1.5, 36]} />
        <meshStandardMaterial color="#2a4058" emissive="#3a5880" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 6, -length / 2 - 18]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[width - 2, 1.5, 36]} />
        <meshStandardMaterial color="#2a4058" emissive="#3a5880" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
});

const Bridges = memo(function Bridges() {
  return (
    <>
      {DC_BRIDGES.map((b) => (
        <Bridge3D
          key={b.id}
          lat={b.lat}
          lng={b.lng}
          length={b.length}
          rotation={b.rotation}
          width={b.width}
        />
      ))}
    </>
  );
});

interface RoadNetworkProps {
  crisisMode?: boolean;
  congestionIndex?: number;
  emergencyCorridorsOpen?: number;
}

export const RoadNetwork = memo(function RoadNetwork({
  crisisMode = false,
  congestionIndex = 0,
  emergencyCorridorsOpen = 0,
}: RoadNetworkProps) {
  return (
    <>
      <AvenueSurfaces />
      <RoadLines kind="alley" segments={DC_ROADS} />
      <RoadLines kind="street" segments={DC_ROADS} />
      <RoadLines kind="avenue" segments={DC_ROADS} />
      <RoadLines kind="highway" segments={DC_ROADS} />
      <Bridges />
      <TrafficSystem
        crisisMode={crisisMode}
        congestionIndex={congestionIndex}
        emergencyCorridorsOpen={emergencyCorridorsOpen}
      />
    </>
  );
});
