import { memo } from "react";
import { Text } from "@react-three/drei";
import { geoToScene } from "../../lib/geo";

/** Stylized low-poly DC landmarks — instantly recognizable silhouettes. */

const WhiteHouse = memo(function WhiteHouse({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[52, 16, 32]} />
        <meshStandardMaterial color="#e8eef5" emissive="#ffffff" emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[0, 18, 0]}>
        <boxGeometry args={[38, 12, 24]} />
        <meshStandardMaterial color="#f0f4f8" emissive="#d0e8ff" emissiveIntensity={0.04} />
      </mesh>
      <mesh position={[0, 26, 0]}>
        <boxGeometry args={[22, 8, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.03} />
      </mesh>
      {[-18, 18].map((ox) => (
        <mesh key={ox} position={[ox, 6, 14]}>
          <boxGeometry args={[14, 12, 10]} />
          <meshStandardMaterial color="#dce4ec" />
        </mesh>
      ))}
      <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 50]} />
        <meshStandardMaterial color="#1a4020" emissive="#2a6030" emissiveIntensity={0.08} />
      </mesh>
      <Text position={[0, 34, 0]} fontSize={6} color="#4cc9f0" anchorX="center" anchorY="bottom">
        WHITE HOUSE
      </Text>
    </group>
  );
});

const Capitol = memo(function Capitol({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 12, 0]}>
        <boxGeometry args={[110, 24, 65]} />
        <meshStandardMaterial color="#d8dce4" emissive="#f4a100" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0, 28, 0]}>
        <boxGeometry args={[70, 16, 45]} />
        <meshStandardMaterial color="#c8ccd4" />
      </mesh>
      <mesh position={[0, 42, 0]}>
        <cylinderGeometry args={[18, 22, 20, 16]} />
        <meshStandardMaterial color="#b8bcc4" emissive="#f4a100" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 58, 0]}>
        <cylinderGeometry args={[8, 10, 16, 12]} />
        <meshStandardMaterial color="#a0a4ac" emissive="#ffffff" emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[0, 72, 0]}>
        <coneGeometry args={[6, 12, 8]} />
        <meshStandardMaterial color="#f4a100" emissive="#f4a100" emissiveIntensity={0.3} />
      </mesh>
      {[-55, 55].map((ox) => (
        <group key={ox} position={[ox, 0, 0]}>
          <mesh position={[0, 18, 0]}>
            <cylinderGeometry args={[12, 14, 36, 12]} />
            <meshStandardMaterial color="#c0c4cc" />
          </mesh>
          <mesh position={[0, 40, 0]}>
            <coneGeometry args={[8, 14, 8]} />
            <meshStandardMaterial color="#d0d4dc" />
          </mesh>
        </group>
      ))}
      <Text position={[0, 82, 0]} fontSize={7} color="#f4a100" anchorX="center" anchorY="bottom">
        U.S. CAPITOL
      </Text>
    </group>
  );
});

const WashingtonMonument = memo(function WashingtonMonument({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 85, 0]}>
        <cylinderGeometry args={[7, 11, 170, 4]} />
        <meshStandardMaterial color="#d8e4ec" emissive="#4cc9f0" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 172, 0]}>
        <coneGeometry args={[7, 12, 4]} />
        <meshStandardMaterial color="#e8f0f8" emissive="#ffffff" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14, 18, 32]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.35} />
      </mesh>
    </group>
  );
});

const LincolnMemorial = memo(function LincolnMemorial({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 14, 0]}>
        <boxGeometry args={[90, 28, 55]} />
        <meshStandardMaterial color="#788898" emissive="#6c7ce0" emissiveIntensity={0.06} />
      </mesh>
      {[-38, -19, 0, 19, 38].map((ox) => (
        <mesh key={ox} position={[ox, 22, 24]}>
          <cylinderGeometry args={[3, 3.5, 24, 8]} />
          <meshStandardMaterial color="#8898a8" emissive="#6c7ce0" emissiveIntensity={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 8, 30]}>
        <boxGeometry args={[20, 16, 8]} />
        <meshStandardMaterial color="#506070" emissive="#4cc9f0" emissiveIntensity={0.05} />
      </mesh>
      <Text position={[0, 38, 0]} fontSize={5} color="#6c7ce0" anchorX="center" anchorY="bottom">
        LINCOLN MEMORIAL
      </Text>
    </group>
  );
});

const Pentagon = memo(function Pentagon({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, -0.4, 0]}>
      <mesh position={[0, 8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[55, 55, 16, 5]} />
        <meshStandardMaterial color="#3a4858" emissive="#4a6888" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[48, 48, 12, 5]} />
        <meshStandardMaterial color="#4a5868" emissive="#6a8090" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[20, 48, 5]} />
        <meshBasicMaterial color="#4cc9f0" transparent opacity={0.15} />
      </mesh>
      <Text position={[0, 34, 0]} fontSize={5} color="#8898a8" anchorX="center" anchorY="bottom">
        PENTAGON
      </Text>
    </group>
  );
});

export const DCLandmarks = memo(function DCLandmarks() {
  const [wx, , wz] = geoToScene(38.8977, -77.0365);
  const [cx, , cz] = geoToScene(38.8899, -77.0091);
  const [mx, , mz] = geoToScene(38.8895, -77.0353);
  const [lx, , lz] = geoToScene(38.8893, -77.0502);
  const [px, , pz] = geoToScene(38.8719, -77.0563);

  return (
    <group>
      <WashingtonMonument x={mx} z={mz} />
      <Capitol x={cx} z={cz} />
      <WhiteHouse x={wx} z={wz} />
      <LincolnMemorial x={lx} z={lz} />
      <Pentagon x={px} z={pz} />
    </group>
  );
});
