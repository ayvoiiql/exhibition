import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import artworkJson from "../../content/artworks.json";
import {
  GALLERY_SURFACE_COLORS,
  MOLDING_LAYERS,
  ROOM_A_LIGHTING,
  ROOM_A_MATERIALS,
  ROOM_A_MOLDING_PROFILE,
  ROOM_A_PORTAL_TRIM_MATERIAL,
  ROOM_A_TEXTURES,
  ROOM_B_DEPTH,
  ROOM_B_WIDTH,
  ROOM_C_DEPTH,
  ROOM_C_WIDTH,
  ROOM_HEIGHT,
  WALL_THICKNESS,
  getMoldingCenterOffset,
  getMoldingTransform,
  getRoomAPortalTrimPieces,
  roomAArtworkPlacements,
  roomAConnection,
  galleryMoldingCorners,
  roomAWalls,
  roomBArtworkPlacements,
  roomBCenter,
  roomBConnection,
  roomBWalls,
  roomCArtworkPlacements,
  roomCCenter,
  roomCWalls,
  type ArtworkPlacement,
  type WallSegment,
} from "../galleryLayout";
import type { ArtworkData, MoveInput } from "../types";
import { getRenderQuality } from "../renderQuality";
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

function useRepeatedTexture(
  path: string,
  repeatX: number,
  repeatY: number,
) {
  const source = useTexture(path);
  const texture = useMemo(() => {
    const clone = source.clone();
    clone.wrapS = THREE.RepeatWrapping;
    clone.wrapT = THREE.RepeatWrapping;
    clone.repeat.set(repeatX, repeatY);
    clone.colorSpace = THREE.SRGBColorSpace;
    clone.needsUpdate = true;
    return clone;
  }, [repeatX, repeatY, source]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Wall({
  wall,
  useRoomAMaterials = false,
  wallTexture,
}: {
  wall: WallSegment;
  useRoomAMaterials?: boolean;
  wallTexture?: THREE.Texture;
}) {
  const moldingSides = wall.moldingBothSides ? [1, -1] : [wall.interiorSign];
  const wallMaterial = useRoomAMaterials
    ? wall.color === ROOM_A_MATERIALS.secondaryWall.color
      ? ROOM_A_MATERIALS.secondaryWall
      : ROOM_A_MATERIALS.mainWall
    : undefined;

  return (
    <group position={wall.position} rotation={[0, wall.rotationY, 0]}>
      <mesh
        userData={{ blocksArtworkRay: true }}
        onClick={(event) => event.stopPropagation()}
      >
        <boxGeometry args={[wall.length, ROOM_HEIGHT, WALL_THICKNESS]} />
        {useRoomAMaterials ? (
          <meshPhysicalMaterial {...wallMaterial} color={wall.color} map={wallTexture} />
        ) : (
          <meshStandardMaterial color={wall.color} roughness={0.84} metalness={0} />
        )}
      </mesh>
      {moldingSides.map((side) =>
        MOLDING_LAYERS.map((layer, layerIndex) => {
          const molding = getMoldingTransform(wall, layer.depth);
          const profile = ROOM_A_MOLDING_PROFILE[layerIndex];
          const moldingMaterial = useRoomAMaterials
            ? ROOM_A_MATERIALS.baseboard[layerIndex]
            : { color: layer.color, roughness: 0.52, metalness: 0.05 };

          return (
            <mesh
              key={`${side}-${profile.y}`}
              position={[
                molding.center,
                -ROOM_HEIGHT / 2 + profile.y,
                side * getMoldingCenterOffset(layer.depth),
              ]}
            >
              <boxGeometry args={[molding.length, profile.height, layer.depth]} />
              <meshStandardMaterial
                color={moldingMaterial.color}
                roughness={moldingMaterial.roughness}
                metalness={moldingMaterial.metalness}
              />
            </mesh>
          );
        }),
      )}
    </group>
  );
}

function RoomAWall({ wall }: { wall: WallSegment }) {
  const wallTexture = useRepeatedTexture(
    ROOM_A_TEXTURES.wall,
    wall.length / ROOM_A_TEXTURES.wallRepeatMeters,
    ROOM_HEIGHT / ROOM_A_TEXTURES.wallRepeatMeters,
  );

  return <Wall wall={wall} useRoomAMaterials wallTexture={wallTexture} />;
}

function GalleryMoldingCorner({
  position,
  xSign,
  zSign,
  materialStyle,
}: {
  position: readonly [number, number];
  xSign: 1 | -1;
  zSign: 1 | -1;
  materialStyle: "roomA" | "default";
}) {
  return MOLDING_LAYERS.map((layer, layerIndex) => {
    const profile = ROOM_A_MOLDING_PROFILE[layerIndex];
    const material = materialStyle === "roomA"
      ? ROOM_A_MATERIALS.baseboard[layerIndex]
      : { color: layer.color, roughness: 0.52, metalness: 0.05 };
    const span = getMoldingCenterOffset(layer.depth) + layer.depth / 2;
    const overlap = 0.012;
    const jointSize = span + overlap;

    return (
      <mesh
        key={profile.y}
        position={[
          position[0] + xSign * (span - overlap) / 2,
          profile.y,
          position[1] + zSign * (span - overlap) / 2,
        ]}
      >
        <boxGeometry args={[jointSize, profile.height, jointSize]} />
        <meshStandardMaterial {...material} />
      </mesh>
    );
  });
}

function GallerySpotlight({
  placement,
  useRoomALighting = false,
}: {
  placement: ArtworkPlacement;
  useRoomALighting?: boolean;
}) {
  const target = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(...placement.position);
    return object;
  }, [placement]);
  const spotlight = useRoomALighting ? ROOM_A_LIGHTING.spotlight : undefined;
  const housingMaterial = useRoomALighting ? ROOM_A_MATERIALS.spotlightHousing : undefined;

  return (
    <>
      <primitive object={target} />
      <spotLight
        position={placement.lightPosition}
        target={target}
        intensity={placement.height > 2
          ? spotlight?.heroIntensity ?? 31
          : spotlight?.standardIntensity ?? 25}
        distance={spotlight?.distance ?? 5.8}
        angle={placement.height > 2
          ? spotlight?.heroAngle ?? 0.54
          : spotlight?.standardAngle ?? 0.45}
        penumbra={spotlight?.penumbra ?? 0.9}
        decay={spotlight?.decay ?? 1.3}
        color={spotlight?.color ?? "#fff2d7"}
      />
      <mesh position={placement.lightPosition}>
        <cylinderGeometry args={[0.09, 0.12, 0.28, 14]} />
        <meshStandardMaterial
          color={housingMaterial?.color ?? "#293843"}
          metalness={housingMaterial?.metalness ?? 0.58}
          roughness={housingMaterial?.roughness ?? 0.3}
        />
      </mesh>
    </>
  );
}

function RoomA() {
  const portalTrimPieces = getRoomAPortalTrimPieces();
  const floorTexture = useRepeatedTexture(
    ROOM_A_TEXTURES.floor,
    10.8 / ROOM_A_TEXTURES.floorRepeatMeters,
    8.8 / ROOM_A_TEXTURES.floorRepeatMeters,
  );
  const corridorFloorTexture = useRepeatedTexture(
    ROOM_A_TEXTURES.floor,
    roomAConnection.openingWidth / ROOM_A_TEXTURES.floorRepeatMeters,
    roomAConnection.corridorLength / ROOM_A_TEXTURES.floorRepeatMeters,
  );
  const lintelTexture = useRepeatedTexture(
    ROOM_A_TEXTURES.wall,
    roomAConnection.openingWidth / ROOM_A_TEXTURES.wallRepeatMeters,
    0.68 / ROOM_A_TEXTURES.wallRepeatMeters,
  );

  return (
    <>
      <hemisphereLight args={[
        ROOM_A_LIGHTING.hemisphere.skyColor,
        ROOM_A_LIGHTING.hemisphere.groundColor,
        ROOM_A_LIGHTING.hemisphere.intensity,
      ]} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={ROOM_A_LIGHTING.directional.intensity}
        color={ROOM_A_LIGHTING.directional.color}
      />

      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[10.8, 0.16, 8.8]} />
        <meshPhysicalMaterial
          {...ROOM_A_MATERIALS.floor}
          color="#ffffff"
          map={floorTexture}
        />
      </mesh>
      <mesh position={[0, 4.28, 0]}>
        <boxGeometry args={[10.8, 0.16, 8.8]} />
        <meshStandardMaterial {...ROOM_A_MATERIALS.ceiling} />
      </mesh>
      <mesh position={[roomAConnection.center[0], -0.08, -5.05]}>
        <boxGeometry args={[roomAConnection.openingWidth, 0.16, roomAConnection.corridorLength]} />
        <meshPhysicalMaterial
          {...ROOM_A_MATERIALS.floor}
          color="#ffffff"
          map={corridorFloorTexture}
        />
      </mesh>
      <mesh position={[roomAConnection.center[0], 4.28, -5.05]}>
        <boxGeometry args={[roomAConnection.openingWidth, 0.16, roomAConnection.corridorLength]} />
        <meshStandardMaterial {...ROOM_A_MATERIALS.ceiling} />
      </mesh>
      <mesh position={[roomAConnection.center[0], 3.86, -4.4]}>
        <boxGeometry args={[roomAConnection.openingWidth, 0.68, WALL_THICKNESS]} />
        <meshPhysicalMaterial {...ROOM_A_MATERIALS.mainWall} map={lintelTexture} />
      </mesh>
      {portalTrimPieces.map((piece) => (
        <mesh
          key={`room-a-portal-${piece.id}`}
          position={piece.position}
          userData={{ blocksArtworkRay: true }}
          onClick={(event) => event.stopPropagation()}
        >
          <boxGeometry args={piece.size} />
          <meshStandardMaterial {...ROOM_A_PORTAL_TRIM_MATERIAL} />
        </mesh>
      ))}

      {roomAWalls.map((wall) => (
        <RoomAWall key={wall.id} wall={wall} />
      ))}
      {floorLinesX.map((x) => (
        <mesh key={`floor-x-${x}`} position={[x, 0.006, 0]}>
          <boxGeometry args={[0.014, 0.008, 8.8]} />
          <meshStandardMaterial {...ROOM_A_MATERIALS.floorLine} />
        </mesh>
      ))}
      {floorLinesZ.map((z) => (
        <mesh key={`floor-z-${z}`} position={[0, 0.007, z]}>
          <boxGeometry args={[10.8, 0.008, 0.014]} />
          <meshStandardMaterial {...ROOM_A_MATERIALS.floorLine} />
        </mesh>
      ))}

      <mesh position={[0, 4.13, -2.2]}>
        <boxGeometry args={[8.9, 0.05, 0.07]} />
        <meshStandardMaterial {...ROOM_A_MATERIALS.track} />
      </mesh>
      <mesh position={[3.25, 4.13, -0.55]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6.7, 0.05, 0.07]} />
        <meshStandardMaterial {...ROOM_A_MATERIALS.track} />
      </mesh>

      {roomAArtworkPlacements.map((placement) => (
        <GallerySpotlight
          key={`spotlight-${placement.id}`}
          placement={placement}
          useRoomALighting
        />
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
            materialStyle="roomA"
          />
        );
      })}
    </>
  );
}

function RoomB() {
  return (
    <>
      <mesh position={[roomBCenter[0], -0.08, roomBCenter[2]]}>
        <boxGeometry args={[ROOM_B_WIDTH, 0.16, ROOM_B_DEPTH]} />
        <meshPhysicalMaterial
          color={GALLERY_SURFACE_COLORS.floor}
          emissive="#0b0d0f"
          emissiveIntensity={0.3}
          roughness={0.36}
          metalness={0.18}
          clearcoat={0.2}
          clearcoatRoughness={0.5}
        />
      </mesh>
      <mesh position={[roomBCenter[0], 4.28, roomBCenter[2]]}>
        <boxGeometry args={[ROOM_B_WIDTH, 0.16, ROOM_B_DEPTH]} />
        <meshStandardMaterial color="#0b1219" roughness={0.84} />
      </mesh>
      <mesh
        position={[
          roomBConnection.center[0] - roomBConnection.corridorLength / 2,
          -0.08,
          roomBConnection.center[2],
        ]}
      >
        <boxGeometry
          args={[roomBConnection.corridorLength, 0.16, roomBConnection.openingWidth]}
        />
        <meshPhysicalMaterial
          color={GALLERY_SURFACE_COLORS.floor}
          emissive="#0b0d0f"
          emissiveIntensity={0.3}
          roughness={0.36}
          metalness={0.18}
          clearcoat={0.2}
          clearcoatRoughness={0.5}
        />
      </mesh>
      <mesh
        position={[
          roomBConnection.center[0] - roomBConnection.corridorLength / 2,
          4.28,
          roomBConnection.center[2],
        ]}
      >
        <boxGeometry
          args={[roomBConnection.corridorLength, 0.16, roomBConnection.openingWidth]}
        />
        <meshStandardMaterial color="#0b1219" roughness={0.84} />
      </mesh>

      {roomBWalls.map((wall) => (
        <Wall key={wall.id} wall={wall} />
      ))}

      {floorLinesX.map((x) => (
        <mesh
          key={`room-b-floor-x-${x}`}
          position={[roomBCenter[0] + x, 0.006, roomBCenter[2]]}
        >
          <boxGeometry args={[0.014, 0.008, ROOM_B_DEPTH]} />
          <meshBasicMaterial color="#373c40" />
        </mesh>
      ))}
      {floorLinesZ.map((z) => (
        <mesh
          key={`room-b-floor-z-${z}`}
          position={[roomBCenter[0], 0.007, roomBCenter[2] + z]}
        >
          <boxGeometry args={[ROOM_B_WIDTH, 0.008, 0.014]} />
          <meshBasicMaterial color="#373c40" />
        </mesh>
      ))}

      <mesh position={[roomBCenter[0], 4.13, -14.55]}>
        <boxGeometry args={[9, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[roomBCenter[0], 4.13, -7.05]}>
        <boxGeometry args={[3.8, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[5.65, 4.13, roomBCenter[2]]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[6.7, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>

      {roomBArtworkPlacements.map((placement) => (
        <GallerySpotlight key={`spotlight-${placement.id}`} placement={placement} />
      ))}

      {roomBArtworkPlacements.map((placement) => {
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

function RoomC() {
  return (
    <>
      <mesh position={[roomCCenter[0], -0.08, roomCCenter[2]]}>
        <boxGeometry args={[ROOM_C_WIDTH, 0.16, ROOM_C_DEPTH]} />
        <meshPhysicalMaterial
          color={GALLERY_SURFACE_COLORS.floor}
          emissive="#0b0d0f"
          emissiveIntensity={0.3}
          roughness={0.36}
          metalness={0.18}
          clearcoat={0.2}
          clearcoatRoughness={0.5}
        />
      </mesh>
      <mesh position={[roomCCenter[0], 4.28, roomCCenter[2]]}>
        <boxGeometry args={[ROOM_C_WIDTH, 0.16, ROOM_C_DEPTH]} />
        <meshStandardMaterial color="#0b1219" roughness={0.84} />
      </mesh>

      {roomCWalls.map((wall) => (
        <Wall key={wall.id} wall={wall} />
      ))}

      {floorLinesX.map((x) => (
        <mesh
          key={`room-c-floor-x-${x}`}
          position={[roomCCenter[0] + x, 0.006, roomCCenter[2]]}
        >
          <boxGeometry args={[0.014, 0.008, ROOM_C_DEPTH]} />
          <meshBasicMaterial color="#373c40" />
        </mesh>
      ))}
      {floorLinesZ.map((z) => (
        <mesh
          key={`room-c-floor-z-${z}`}
          position={[roomCCenter[0], 0.007, roomCCenter[2] + z]}
        >
          <boxGeometry args={[ROOM_C_WIDTH, 0.008, 0.014]} />
          <meshBasicMaterial color="#373c40" />
        </mesh>
      ))}

      <mesh position={[roomCCenter[0], 4.13, -18.25]}>
        <boxGeometry args={[8.2, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[roomCCenter[0], 4.13, -12.2]}>
        <boxGeometry args={[7.2, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[-14.55, 4.13, roomCCenter[2]]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5.6, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[-8, 4.13, roomCCenter[2]]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[7.2, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>

      {roomCArtworkPlacements.map((placement) => (
        <GallerySpotlight key={`spotlight-${placement.id}`} placement={placement} />
      ))}

      {roomCArtworkPlacements.map((placement) => {
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
  const renderQuality = getRenderQuality(isCoarsePointer);

  return (
    <Canvas
      camera={{ fov: 64, near: 0.08, far: 45 }}
      dpr={renderQuality.dpr}
      gl={{
        antialias: renderQuality.antialias,
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
        <RoomB />
        <RoomC />
        {galleryMoldingCorners.map((corner) => (
          <GalleryMoldingCorner key={corner.id} {...corner} />
        ))}
        <PlayerController moveInput={moveInput} lookInput={lookInput} isCoarsePointer={isCoarsePointer} />
      </Suspense>
    </Canvas>
  );
}
