import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const TARGET: [number, number, number] = [0, 40, 0];
const INITIAL_CAMERA: [number, number, number] = [620, 420, 620];

interface Props {
  armed: boolean;
}

/** Orbit controls with one-time camera framing on the Statue centerpiece. */
export function MapControls({ armed }: Props) {
  const ref = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const framed = useRef(false);

  useEffect(() => {
    if (framed.current) return;
    camera.position.set(...INITIAL_CAMERA);
    camera.lookAt(...TARGET);
    if (ref.current) {
      ref.current.target.set(...TARGET);
      ref.current.update();
    }
    framed.current = true;
  }, [camera]);

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enabled={!armed}
      enableRotate={!armed}
      enablePan={!armed}
      enableZoom={!armed}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.65}
      panSpeed={0.8}
      zoomSpeed={0.85}
      maxPolarAngle={Math.PI / 2.08}
      minDistance={180}
      maxDistance={5200}
      target={TARGET}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}
