import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { geoToScene } from "../../lib/geo";
import { METRO_LINES, METRO_STATIONS, type MetroLineId } from "../../lib/dcMetro";

interface MetroProps {
  crisisMode?: boolean;
  powerOutage?: boolean;
  /** 0–100 operational capacity */
  operationalPct?: number;
}

function toSceneLine(points: [number, number][], y: number): THREE.Vector3[] {
  return points.map(([lat, lng]) => {
    const [x, , z] = geoToScene(lat, lng);
    return new THREE.Vector3(x, y, z);
  });
}

const MetroTrain = memo(function MetroTrain({
  path,
  color,
  speed,
  offset,
  running,
}: {
  path: THREE.Vector3[];
  color: string;
  speed: number;
  offset: number;
  running: boolean;
}) {
  const ref = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!ref.current || path.length < 2 || !running) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
    const seg = t * (path.length - 1);
    const idx = Math.floor(seg);
    const frac = seg - idx;
    const a = path[idx];
    const b = path[Math.min(idx + 1, path.length - 1)];
    ref.current.position.set(
      a.x + (b.x - a.x) * frac,
      a.y,
      a.z + (b.z - a.z) * frac,
    );
    ref.current.lookAt(b.x, b.y, b.z);
  });

  if (path.length < 2) return null;

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[3.5, 2.8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={running ? 0.5 : 0.05} />
      </mesh>
      <mesh position={[0, 0, -4.5]}>
        <boxGeometry args={[3.2, 2.5, 3]} />
        <meshStandardMaterial color="#1a2233" emissive={color} emissiveIntensity={running ? 0.3 : 0.02} />
      </mesh>
    </group>
  );
});

const MetroStationNode = memo(function MetroStationNode({
  lat,
  lng,
  name,
  lines,
  depth,
  operational,
}: {
  lat: number;
  lng: number;
  name: string;
  lines: MetroLineId[];
  depth: number;
  operational: boolean;
}) {
  const [x, , z] = geoToScene(lat, lng);
  const y = -depth * 0.8;
  const lineColors: Record<MetroLineId, string> = {
    red: "#E4142C", blue: "#009CDE", orange: "#F7941D",
    green: "#00B04F", yellow: "#FFD100", silver: "#A0A0A0",
  };

  return (
    <group position={[x, y, z]}>
      <mesh>
        <cylinderGeometry args={[6, 7, 4, 8]} />
        <meshStandardMaterial
          color="#2a3848"
          emissive={operational ? "#4cc9f0" : "#ff4655"}
          emissiveIntensity={operational ? 0.25 : 0.4}
        />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[10, 0.8, 10]} />
        <meshStandardMaterial color="#1a2838" transparent opacity={0.7} />
      </mesh>
      {lines.map((line, i) => (
        <mesh key={line} position={[-4 + i * 2.5, 4.5, 0]}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshBasicMaterial color={lineColors[line]} />
        </mesh>
      ))}
      <Text position={[0, 8, 0]} fontSize={3} color={operational ? "#4cc9f0" : "#ff4655"} anchorX="center">
        {name}
      </Text>
    </group>
  );
});

const MetroLineSegment = memo(function MetroLineSegment({
  lineId,
  color,
  points,
  running,
}: {
  lineId: string;
  color: string;
  points: THREE.Vector3[];
  running: boolean;
}) {
  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const positions: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [points]);

  if (!geo) return null;

  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={running ? 0.85 : 0.25}
          linewidth={2}
        />
      </lineSegments>
      <MetroTrain
        path={points}
        color={color}
        speed={0.04 + lineId.charCodeAt(0) * 0.0001}
        offset={lineId.charCodeAt(0) * 0.1}
        running={running}
      />
    </group>
  );
});

export const MetroNetwork = memo(function MetroNetwork({
  crisisMode = false,
  powerOutage = false,
  operationalPct = 100,
}: MetroProps) {
  const undergroundY = -18;
  const running = !powerOutage && operationalPct > 20;

  const linePaths = useMemo(
    () => METRO_LINES.map((line) => ({
      id: line.id,
      color: line.color,
      points: toSceneLine(line.points, undergroundY),
    })),
    [undergroundY],
  );

  return (
    <group>
      {/* Underground tunnel shell hint */}
      <mesh position={[0, undergroundY - 6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial
          color="#0a1018"
          emissive={crisisMode ? "#401010" : "#0a1828"}
          emissiveIntensity={crisisMode ? 0.15 : 0.05}
          transparent
          opacity={0.35}
        />
      </mesh>

      {linePaths.map((line) => (
        <MetroLineSegment
          key={line.id}
          lineId={line.id}
          color={line.color}
          points={line.points}
          running={running}
        />
      ))}

      {METRO_STATIONS.map((st) => (
        <MetroStationNode
          key={st.id}
          lat={st.lat}
          lng={st.lng}
          name={st.name}
          lines={st.lines}
          depth={st.depth_m}
          operational={running && operationalPct > 30}
        />
      ))}

      {crisisMode && powerOutage && (
        <Text position={[0, undergroundY + 20, 0]} fontSize={8} color="#ff4655" anchorX="center">
          METRO — EMERGENCY POWER ONLY
        </Text>
      )}
    </group>
  );
});
