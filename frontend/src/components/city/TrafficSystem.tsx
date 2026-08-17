import { memo, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { geoToScene } from "../../lib/geo";
import { TRAFFIC_CORRIDORS } from "../../lib/dcRoads";

export interface TrafficLightDef {
  lat: number;
  lng: number;
  id: string;
}

const TRAFFIC_LIGHTS: TrafficLightDef[] = [
  { id: "tl-1", lat: 38.904, lng: -77.039 },
  { id: "tl-2", lat: 38.898, lng: -77.028 },
  { id: "tl-3", lat: 38.892, lng: -77.035 },
  { id: "tl-4", lat: 38.896, lng: -77.043 },
  { id: "tl-5", lat: 38.901, lng: -77.051 },
  { id: "tl-6", lat: 38.888, lng: -77.028 },
  { id: "tl-7", lat: 38.907, lng: -77.036 },
  { id: "tl-8", lat: 38.884, lng: -77.021 },
];

const PRIORITY_LANES: [number, number][][] = [
  [[38.904, -77.08], [38.904, -77.04], [38.898, -77.028], [38.892, -77.035]],
  [[38.896, -77.071], [38.898, -77.043], [38.898, -77.028], [38.897, -77.006]],
  [[38.852, -77.043], [38.876, -77.022], [38.896, -77.028], [38.904, -77.043]],
];

interface TrafficSystemProps {
  crisisMode?: boolean;
  congestionIndex?: number;
  emergencyCorridorsOpen?: number;
}

const TrafficLight = memo(function TrafficLight({
  lat,
  lng,
  crisisMode,
  offset,
}: {
  lat: number;
  lng: number;
  crisisMode: boolean;
  offset: number;
}) {
  const [x, , z] = geoToScene(lat, lng);
  const greenRef = useRef<THREE.Mesh>(null!);
  const yellowRef = useRef<THREE.Mesh>(null!);
  const redRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * 0.15 + offset) % 1;
    const setColor = (ref: RefObject<THREE.Mesh>, on: boolean, color: string) => {
      if (!ref.current) return;
      (ref.current.material as THREE.MeshBasicMaterial).color.set(on ? color : "#334455");
    };
    if (crisisMode) {
      setColor(greenRef, false, "#33c17a");
      setColor(yellowRef, phase > 0.5, "#f4a100");
      setColor(redRef, true, "#ff4655");
    } else if (phase < 0.33) {
      setColor(greenRef, true, "#33c17a");
      setColor(yellowRef, false, "#f4a100");
      setColor(redRef, false, "#ff4655");
    } else if (phase < 0.66) {
      setColor(greenRef, false, "#33c17a");
      setColor(yellowRef, true, "#f4a100");
      setColor(redRef, false, "#ff4655");
    } else {
      setColor(greenRef, false, "#33c17a");
      setColor(yellowRef, false, "#f4a100");
      setColor(redRef, true, "#ff4655");
    }
  });

  return (
    <group position={[x, 8, z]}>
      <mesh>
        <boxGeometry args={[1.2, 5, 1.2]} />
        <meshStandardMaterial color="#1a2233" />
      </mesh>
      <mesh ref={greenRef} position={[0, 3.5, 0.65]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color="#334455" />
      </mesh>
      <mesh ref={yellowRef} position={[0, 2.1, 0.65]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color="#334455" />
      </mesh>
      <mesh ref={redRef} position={[0, 0.7, 0.65]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color="#334455" />
      </mesh>
    </group>
  );
});

const PriorityLane = memo(function PriorityLane({
  points,
  active,
}: {
  points: THREE.Vector3[];
  active: boolean;
}) {
  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const positions: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      positions.push(a.x, 2.5, a.z, b.x, 2.5, b.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [points]);

  if (!geo) return null;

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial
        color={active ? "#33c17a" : "#334455"}
        transparent
        opacity={active ? 0.9 : 0.3}
      />
    </lineSegments>
  );
});

export const TrafficFlow = memo(function TrafficFlow({
  paths,
  crisisMode = false,
  congestionIndex = 0,
}: {
  paths: [number, number, number][][];
  crisisMode?: boolean;
  congestionIndex?: number;
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const count = Math.min(12, paths.length * 2);
  const speedMult = crisisMode ? 0.4 : Math.max(0.3, 1 - congestionIndex / 100);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const path = paths[i % paths.length];
      if (!path || path.length < 2) continue;
      const prog = (t * (0.06 + (i % 3) * 0.015) * speedMult + i * 0.17) % 1;
      const seg = prog * (path.length - 1);
      const idx = Math.floor(seg);
      const frac = seg - idx;
      const a = path[idx];
      const b = path[Math.min(idx + 1, path.length - 1)];
      mesh.position.set(
        a[0] + (b[0] - a[0]) * frac,
        3,
        a[2] + (b[2] - a[2]) * frac,
      );
      const mat = mesh.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = crisisMode ? 0.95 : 0.85;
      mesh.scale.setScalar(crisisMode && i % 4 === 0 ? 1.4 : 1);
    }
  });

  const colors = crisisMode
    ? ["#ff4655", "#f4a100", "#ff7a45", "#33c17a"]
    : ["#4cc9f0", "#f4a100", "#33c17a", "#8898a8"];

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <boxGeometry args={[i % 4 === 0 && crisisMode ? 6 : 5, 2, 2.5]} />
          <meshBasicMaterial
            color={colors[i % colors.length]}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </>
  );
});

export const TrafficSystem = memo(function TrafficSystem({
  crisisMode = false,
  congestionIndex = 0,
  emergencyCorridorsOpen = 0,
}: TrafficSystemProps) {
  const trafficPaths = useMemo(() => {
    const paths: [number, number, number][][] = [];
    for (let i = 0; i < TRAFFIC_CORRIDORS.length - 1; i++) {
      const a = TRAFFIC_CORRIDORS[i];
      const b = TRAFFIC_CORRIDORS[i + 1];
      const [x1, , z1] = geoToScene(a[0], a[1]);
      const [x2, , z2] = geoToScene(b[0], b[1]);
      paths.push([[x1, 0, z1], [x2, 0, z2]]);
    }
    for (const lane of PRIORITY_LANES) {
      const pts: [number, number, number][] = lane.map(([lat, lng]) => {
        const [x, , z] = geoToScene(lat, lng);
        return [x, 0, z];
      });
      paths.push(pts);
    }
    return paths;
  }, []);

  const priorityPaths = useMemo(
    () =>
      PRIORITY_LANES.map((lane) =>
        lane.map(([lat, lng]) => {
          const [x, , z] = geoToScene(lat, lng);
          return new THREE.Vector3(x, 0, z);
        }),
      ),
    [],
  );

  return (
    <group>
      {TRAFFIC_LIGHTS.map((tl, i) => (
        <TrafficLight
          key={tl.id}
          lat={tl.lat}
          lng={tl.lng}
          crisisMode={crisisMode}
          offset={i * 0.15}
        />
      ))}
      {priorityPaths.map((pts, i) => (
        <PriorityLane key={i} points={pts} active={emergencyCorridorsOpen > i || crisisMode} />
      ))}
      <TrafficFlow
        paths={trafficPaths}
        crisisMode={crisisMode}
        congestionIndex={congestionIndex}
      />
    </group>
  );
});
