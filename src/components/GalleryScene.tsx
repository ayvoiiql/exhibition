import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import artworkJson from "../../content/artworks.json";
import {
  MOLDING_LAYERS,
  ROOM_HEIGHT,
  WALL_THICKNESS,
  getMoldingCenterOffset,
  roomAArtworkPlacements,
  roomAConnection,
  roomAWalls,
  type ArtworkPlacement,
  type WallSegment,
} from "../galleryLayout";
import type { ArtworkData, MoveInput } from "../types";
import { Artwork } from "./Artwork";
import { PlayerController } from "./PlayerController";

interface GallerySceneProps {
  moveInput: React.RefObject<MoveInput>;
  lookInput: React.RefObject<MoveInput>;
  isCoarsePointer: boolean;
}

const artworks = artworkJson as ArtworkData[];
const floorLinesX = [-3, 0, 3];
const floorLinesZ = [-3, 0, 3];

function Wall({ wall }: { wall: WallSegment }) {
  return (
    <group position={wall.position} rotation={[0, wall.rotationY, 0]}>
      <mesh>
        <boxGeometry args={[wall.length, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={wall.color} roughness={0.84} />
      </mesh>
      {MOLDING_LAYERS.map((layer) => (
        <mesh
          key={layer.y}
          position={[
            0,
            -ROOM_HEIGHT / 2 + layer.y,
            wall.interiorSign * getMoldingCenterOffset(layer.depth),
          ]}
        >
          <boxGeometry args={[wall.length + 0.05, layer.height, layer.depth]} />
          <meshStandardMaterial color={layer.color} roughness={0.52} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function GallerySpotlight({ placement }: { placement: ArtworkPlacement }) {
  const target = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(...placement.position);
    return object;
  }, [placement]);

  return (
    <>
      <primitive object={target} />
      <spotLight
        position={placement.lightPosition}
        target={target}
        intensity={placement.height > 2 ? 31 : 25}
        distance={5.8}
        angle={placement.height > 2 ? 0.54 : 0.45}
        penumbra={0.9}
        decay={1.3}
        color="#fff2d7"
      />
      <mesh position={placement.lightPosition}>
        <cylinderGeometry args={[0.09, 0.12, 0.28, 14]} />
        <meshStandardMaterial color="#293843" metalness={0.58} roughness={0.3} />
      </mesh>
    </>
  );
}

function RoomA() {
  return (
    <>
      <hemisphereLight args={["#c7d8e2", "#121c24", 0.78]} />
      <directionalLight position={[2, 4, 3]} intensity={0.42} color="#dce8ef" />

      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[10.8, 0.16, 8.8]} />
        <meshPhysicalMaterial
          color="#34383b"
          emissive="#0b0d0f"
          emissiveIntensity={0.3}
          roughness={0.36}
          metalness={0.18}
          clearcoat={0.2}
          clearcoatRoughness={0.5}
        />
      </mesh>
      <mesh position={[0, 4.28, 0]}>
        <boxGeometry args={[10.8, 0.16, 8.8]} />
        <meshStandardMaterial color="#0b1219" roughness={0.84} />
      </mesh>
      <mesh position={[roomAConnection.center[0], -0.08, -5.05]}>
        <boxGeometry args={[roomAConnection.openingWidth, 0.16, roomAConnection.corridorLength]} />
        <meshPhysicalMaterial
          color="#30363a"
          roughness={0.4}
          metalness={0.14}
          clearcoat={0.18}
          clearcoatRoughness={0.55}
        />
      </mesh>
      <mesh position={[roomAConnection.center[0], 4.28, -5.05]}>
        <boxGeometry args={[roomAConnection.openingWidth, 0.16, roomAConnection.corridorLength]} />
        <meshStandardMaterial color="#0b1219" roughness={0.84} />
      </mesh>
      <mesh position={[roomAConnection.center[0], 3.86, -4.4]}>
        <boxGeometry args={[roomAConnection.openingWidth, 0.68, WALL_THICKNESS]} />
        <meshStandardMaterial color="#4b5f70" roughness={0.84} />
      </mesh>

      {roomAWalls.map((wall) => (
        <Wall key={wall.id} wall={wall} />
      ))}

      <Text
        position={[roomAConnection.center[0], 2.45, -5.605]}
        fontSize={0.2}
        letterSpacing={0.14}
        color="#c7d5dd"
        anchorX="center"
        anchorY="middle"
      >
        ROOM B
      </Text>
      <Text
        position={[roomAConnection.center[0], 2.14, -5.604]}
        fontSize={0.095}
        letterSpacing={0.08}
        color="#8093a0"
        anchorX="center"
        anchorY="middle"
      >
        NEXT EXHIBITION
      </Text>

      {floorLinesX.map((x) => (
        <mesh key={`floor-x-${x}`} position={[x, 0.006, 0]}>
          <boxGeometry args={[0.014, 0.008, 8.8]} />
          <meshBasicMaterial color="#373c40" />
        </mesh>
      ))}
      {floorLinesZ.map((z) => (
        <mesh key={`floor-z-${z}`} position={[0, 0.007, z]}>
          <boxGeometry args={[10.8, 0.008, 0.014]} />
          <meshBasicMaterial color="#373c40" />
        </mesh>
      ))}

      <mesh position={[0, 4.13, -2.2]}>
        <boxGeometry args={[8.9, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[3.25, 4.13, -0.55]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6.7, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>

      {roomAArtworkPlacements.map((placement) => (
        <GallerySpotlight key={`spotlight-${placement.id}`} placement={placement} />
      ))}

      {roomAArtworkPlacements.map((placement) => {
        const artwork = artworks.find((candidate) => candidate.id === placement.id);
        if (!artwork) return null;
        return (
          <Artwork
            key={artwork.id}
            artwork={artwork}
            position={placement.position}
            rotationY={placement.rotationY}
            targetHeight={placement.height}
          />
        );
      })}
    </>
  );
}

export function GalleryScene({ moveInput, lookInput, isCoarsePointer }: GallerySceneProps) {
  return (
    <Canvas
      camera={{ fov: 64, near: 0.08, far: 45 }}
      dpr={isCoarsePointer ? [0.75, 1.25] : [1, 1.5]}
      gl={{
        antialias: !isCoarsePointer,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#081018");
        gl.toneMappingExposure = 1.04;
      }}
    >
      <Suspense fallback={null}>
        <RoomA />
        <PlayerController moveInput={moveInput} lookInput={lookInput} isCoarsePointer={isCoarsePointer} />
      </Suspense>
    </Canvas>
  );
}
