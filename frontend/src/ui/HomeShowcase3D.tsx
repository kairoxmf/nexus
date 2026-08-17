import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";
import { StatueOfLiberty } from "../components/city/StatueOfLiberty";
import { generateHomeCity, PatrolRobot, RealisticBuilding } from "../components/city/HomeCityAssets";

const HOME_BUILDINGS = generateHomeCity();

function HomeCityScene({ scrollY }: { scrollY: number }) {
  const city = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!city.current) return;
    city.current.rotation.y = clock.elapsedTime * 0.04 + scrollY * 0.0004;
  });

  return (
    <>
      <color attach="background" args={["#030508"]} />
      <fog attach="fog" args={["#030508", 28, 75]} />
      <PerspectiveCamera makeDefault position={[0, 9, 24]} fov={48} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.35}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
        target={[0, 4, 0]}
      />
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 18, 8]} intensity={1.1} color="#b8d4ff" />
      <pointLight position={[0, 12, 0]} intensity={0.8} color="#ffb347" distance={30} />
      <Stars radius={50} depth={40} count={900} factor={2} saturation={0} fade speed={0.2} />

      <group ref={city}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <circleGeometry args={[22, 64]} />
          <meshStandardMaterial color="#061018" emissive="#0a2840" emissiveIntensity={0.25} />
        </mesh>

        <StatueOfLiberty scale={0.055} />

        {HOME_BUILDINGS.map((b) => (
          <RealisticBuilding key={`${b.x}-${b.z}`} {...b} />
        ))}

        <PatrolRobot radius={10} speed={0.4} phase={0} y={0.6} />
        <PatrolRobot radius={13} speed={-0.28} phase={2.1} y={0.5} />
        <PatrolRobot radius={8} speed={0.55} phase={4.2} y={0.7} />
      </group>
    </>
  );
}

export function HomeShowcase3D() {
  const [scrollY, setScrollY] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const id = requestAnimationFrame(() => setReady(true));
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(id);
    };
  }, []);

  if (!ready) return <div className="nx-nike-canvas-wrap" aria-hidden />;

  return (
    <div className="nx-nike-canvas-wrap" aria-hidden>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }} style={{ width: "100%", height: "100%" }}>
        <HomeCityScene scrollY={scrollY} />
      </Canvas>
      <div className="nx-nike-vignette" />
    </div>
  );
}
