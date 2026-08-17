import { Component, useRef, useMemo, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Stars } from "@react-three/drei";
import * as THREE from "three";

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Particles({ count = 600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.08} color="#4cc9f0" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function RotatingCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.elapsedTime * 0.15;
      ref.current.rotation.y = clock.elapsedTime * 0.22;
    }
  });
  return (
    <mesh ref={ref} position={[0, 8, -12]}>
      <icosahedronGeometry args={[4, 1]} />
      <meshStandardMaterial color="#4cc9f0" wireframe transparent opacity={0.3} emissive="#4cc9f0" emissiveIntensity={0.35} />
    </mesh>
  );
}

function VoidSceneInner() {
  return (
    <Canvas
      camera={{ position: [0, 12, 28], fov: 55 }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <fog attach="fog" args={["#030508", 20, 90]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 20, 10]} intensity={1.1} color="#4cc9f0" />
      <Stars radius={60} depth={40} count={1500} factor={3} saturation={0} fade speed={0.4} />
      <Grid
        position={[0, -2, 0]}
        args={[80, 80]}
        cellSize={1.5}
        cellThickness={0.4}
        cellColor="#1a3a4a"
        sectionSize={6}
        sectionThickness={1}
        sectionColor="#4cc9f0"
        fadeDistance={50}
        infiniteGrid
      />
      <Particles />
      <RotatingCore />
    </Canvas>
  );
}

export function VoidBackground({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="nx-scene-overlay" style={{ opacity: intensity }} aria-hidden="true">
      <SceneBoundary>
        <VoidSceneInner />
      </SceneBoundary>
    </div>
  );
}
