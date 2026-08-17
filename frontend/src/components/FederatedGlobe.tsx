import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Line } from "@react-three/drei";
import * as THREE from "three";
import type { FederatedCity, SupplyRoute } from "../types";

function latLngToVec3(lat: number, lng: number, radius = 2.2): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function CityMarker({ city, highlighted }: { city: FederatedCity; highlighted: boolean }) {
  const pos = useMemo(() => latLngToVec3(city.lat, city.lng), [city.lat, city.lng]);
  const color = city.status === "crisis" ? "#ff4655" : highlighted ? "#4cc9f0" : "#33c17a";
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <pointLight color={color} intensity={0.8} distance={0.5} />
    </group>
  );
}

function SupplyArc({ route, cities }: { route: SupplyRoute; cities: FederatedCity[] }) {
  const from = cities.find((c) => c.id === route.from_city);
  const to = cities.find((c) => c.id === route.to_city);
  const progress = useRef(route.progress_pct / 100);

  const { curve, points } = useMemo(() => {
    if (!from || !to) return { curve: null, points: [] as THREE.Vector3[] };
    const start = latLngToVec3(from.lat, from.lng);
    const end = latLngToVec3(to.lat, to.lng);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(2.8);
    const c = new THREE.QuadraticBezierCurve3(start, mid, end);
    return { curve: c, points: c.getPoints(32) };
  }, [from, to]);

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * 0.08) % 1;
  });

  if (!curve || points.length === 0) return null;

  const colors: Record<string, string> = {
    aircraft: "#4cc9f0",
    ship: "#6c7ce0",
    convoy: "#f4a100",
  };
  const color = colors[route.vehicle_type] ?? "#4cc9f0";
  const vehiclePos = curve.getPoint(progress.current);

  return (
    <group>
      <Line points={points} color={color} lineWidth={1} transparent opacity={0.5} />
      <mesh position={vehiclePos}>
        <boxGeometry args={[0.03, 0.03, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function GlobeScene({ cities, routes }: { cities: FederatedCity[]; routes: SupplyRoute[] }) {
  const globeRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.05;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <Stars radius={80} depth={40} count={2000} factor={3} fade speed={0.5} />
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#0a1628"
          emissive="#1a3050"
          emissiveIntensity={0.15}
          wireframe={false}
          roughness={0.8}
        />
      </Sphere>
      <mesh>
        <sphereGeometry args={[2.01, 64, 64]} />
        <meshBasicMaterial color="#4cc9f0" wireframe transparent opacity={0.06} />
      </mesh>
      {cities.map((c) => (
        <CityMarker key={c.id} city={c} highlighted={c.id === "dc"} />
      ))}
      {routes.map((r) => (
        <SupplyArc key={r.id} route={r} cities={cities} />
      ))}
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

export function FederatedGlobe({ cities, routes }: { cities: FederatedCity[]; routes: SupplyRoute[] }) {
  return (
    <div className="mega-globe-wrap">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} style={{ height: 280, borderRadius: 12 }}>
        <GlobeScene cities={cities} routes={routes} />
      </Canvas>
    </div>
  );
}
