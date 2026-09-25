import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

function Box({ position, size, color, metalness = 0, roughness = 0.75 }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

function Portal() {
  const surface = useMemo(() => {
    const data = new Uint8Array(128 * 128 * 4);
    let seed = 731;
    for (let i = 0; i < 128 * 128; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const value = 120 + (seed % 17);
      data.set([value, value, value, 255], i * 4);
    }
    const texture = new THREE.DataTexture(data, 128, 128);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 12);
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => () => surface.dispose(), [surface]);

  return (
    <>
      <color attach="background" args={["#09121b"]} />
      <fog attach="fog" args={["#09121b", 11, 23]} />
      <hemisphereLight args={["#b0c4db", "#20232b", 1.25]} />
      <directionalLight position={[-3, 7, 5]} intensity={2.5} color="#dbe6f2" castShadow shadow-mapSize={[1024, 1024]} />
      <rectAreaLight position={[-2.3, 2.8, 2]} rotation={[0, -0.65, 0]} width={2} height={4} intensity={4} color="#b6c9e0" />
      <rectAreaLight position={[2.8, 2.6, 2]} rotation={[0, 0.6, 0]} width={1} height={3.8} intensity={6} color="#e5d3ae" />

      <Box position={[-4.05, 2.4, -0.35]} size={[4.8, 4.8, 0.5]} color="#152332" />
      <Box position={[4.05, 2.4, -0.35]} size={[4.8, 4.8, 0.5]} color="#152332" />
      <Box position={[0, 4.55, -0.35]} size={[3.3, 1.3, 0.5]} color="#152332" />
      <Box position={[0, 1.94, -0.25]} size={[3.3, 3.88, 0.15]} color="#03080d" />

      {[-1, 1].map((side) => (
        <group key={side}>
          <Box position={[side * 1.62, 1.95, 0]} size={[0.08, 3.94, 0.26]} color="#9f8c65" metalness={0.65} roughness={0.5} />
          <Box position={[side * 1.72, 1.99, -0.07]} size={[0.085, 4.05, 0.1]} color="#263747" metalness={0.4} />
          <mesh position={[side * 0.794, 1.925, -0.02]} castShadow receiveShadow>
            <boxGeometry args={[1.565, 3.81, 0.14]} />
            <meshStandardMaterial color="#203242" metalness={0.32} roughness={0.78} bumpMap={surface} bumpScale={0.012} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <Box key={i} position={[side * (0.25 + i * 0.22), 1.925, 0.053]} size={[0.005, 3.63, 0.003]} color="#2d3d4b" metalness={0.3} />
          ))}
          <Box position={[side * 0.125, 1.64, 0.105]} size={[0.045, 0.64, 0.065]} color="#b9a273" metalness={0.7} roughness={0.38} />
          <Box position={[side * 3.8, 0.08, -0.05]} size={[4.15, 0.12, 0.05]} color="#344350" metalness={0.35} />
        </group>
      ))}
      <Box position={[0, 3.91, 0]} size={[3.32, 0.065, 0.26]} color="#b3a079" metalness={0.7} roughness={0.5} />
      <Box position={[0, 0.015, 0.045]} size={[3.3, 0.025, 0.5]} color="#8d805f" metalness={0.65} roughness={0.55} />
      <mesh position={[0, 1.93, -0.09]}>
        <planeGeometry args={[0.012, 3.8]} />
        <meshBasicMaterial color="#f7dfb1" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 3]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#18242e" metalness={0.25} roughness={0.62} bumpMap={surface} bumpScale={0.008} />
      </mesh>
      {[-2, 0, 2].map((x) => <Box key={x} position={[x, 0, 3.5]} size={[0.009, 0.003, 7]} color="#2d3943" />)}
      {[1.4, 3.5, 5.6].map((z) => <Box key={z} position={[0, 0, z]} size={[14, 0.003, 0.009]} color="#2d3943" />)}
    </>
  );
}

export function IntroScene() {
  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0.65, 2.35, 7.5], fov: 40, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 1.9, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <Portal />
    </Canvas>
  );
}
