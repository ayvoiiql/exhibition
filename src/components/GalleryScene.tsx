import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import artworkJson from "../../content/artworks.json";
import {
  MOLDING_LAYERS,
  ROOM_A_LIGHTING,
  ROOM_A_MATERIALS,
  ROOM_A_TEXTURES,
  ROOM_B_DEPTH,
  ROOM_B_MATERIALS,
  ROOM_B_TEXTURES,
  ROOM_B_WIDTH,
  ROOM_C_BASEBOARD_PROFILE,
  ROOM_C_CEILING_Y,
  ROOM_C_DEPTH,
  ROOM_C_HEIGHT,
  ROOM_C_LIGHT_MOUNT_Y,
  ROOM_C_LIGHTING,
  ROOM_C_MATERIALS,
  ROOM_C_TRACK_Y,
  ROOM_C_TEXTURES,
  ROOM_C_WIDTH,
  ROOM_HEIGHT,
  WALL_THICKNESS,
  getMoldingCenterOffset,
  getMoldingTransform,
  getSpotlightFixtureTransform,
  roomAArtworkPlacements,
  roomAConnection,
  roomAWayfindingSign,
  galleryMoldingCorners,
  roomAWalls,
  roomBArtworkPlacements,
  roomBCenter,
  roomBConnection,
  roomBWallQuote,
  roomBWalls,
  roomCArtworkPlacements,
  roomCCenter,
  roomCWalls,
  type ArtworkPlacement,
  type WallSegment,
} from "../galleryLayout";
import type { ArtworkData, MoveInput } from "../types";
import { getRenderQuality } from "../renderQuality";
import {
  ROOM_A_COVE_BLOOM,
  ROOM_A_COVE_BLOOM_LAYER,
  ROOM_A_COVE_OCCLUDER_LAYER,
  ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP,
  ROOM_A_RIGHT_WALL_COVE_LINES,
  ROOM_A_RIGHT_WALL_LIGHTMAP,
  createSingleFaceLightmapBoxGeometry,
  getRoomARightWallSpotlightOverride,
} from "../roomARightWallLightmap";
import { Artwork } from "./Artwork";
import { PlayerController } from "./PlayerController";
import { RoomACoveBloom } from "./RoomACoveBloom";
import { RoomWallQuote } from "./RoomWallQuote";
import { WayfindingSign } from "./WayfindingSign";

interface GallerySceneProps {
  moveInput: React.RefObject<MoveInput>;
  lookInput: React.RefObject<MoveInput>;
  isCoarsePointer: boolean;
  isRenderingPaused: boolean;
  interactionBlocked: boolean;
  onReady?: () => void;
}

const artworks = artworkJson as ArtworkData[];
const disableRaycast = () => undefined;
const roomACoveOccluderColorWrite = new WeakMap<THREE.Material, boolean>();
const roomCFloorNormalScale = new THREE.Vector2(
  ROOM_C_TEXTURES.floorNormalScale,
  ROOM_C_TEXTURES.floorNormalScale,
);
const roomCWallNormalScale = new THREE.Vector2(
  ROOM_C_TEXTURES.wallNormalScale,
  ROOM_C_TEXTURES.wallNormalScale,
);

function configureRoomACoveOccluder(mesh: THREE.Mesh | null) {
  if (!mesh) return;

  mesh.layers.enable(ROOM_A_COVE_BLOOM_LAYER);
  mesh.layers.enable(ROOM_A_COVE_OCCLUDER_LAYER);
  mesh.onBeforeRender = (_renderer, _scene, camera, _geometry, material) => {
    if (!camera.layers.isEnabled(ROOM_A_COVE_BLOOM_LAYER)) return;
    roomACoveOccluderColorWrite.set(material, material.colorWrite);
    material.colorWrite = false;
  };
  mesh.onAfterRender = (_renderer, _scene, camera, _geometry, material) => {
    if (!camera.layers.isEnabled(ROOM_A_COVE_BLOOM_LAYER)) return;
    const previousColorWrite = roomACoveOccluderColorWrite.get(material);
    if (previousColorWrite === undefined) return;
    material.colorWrite = previousColorWrite;
    roomACoveOccluderColorWrite.delete(material);
  };
}

function useRepeatedTexture(
  path: string,
  repeatX: number,
  repeatY: number,
  colorSpace: THREE.ColorSpace = THREE.SRGBColorSpace,
) {
  const source = useTexture(path);
  const texture = useMemo(() => {
    const clone = source.clone();
    clone.wrapS = THREE.RepeatWrapping;
    clone.wrapT = THREE.RepeatWrapping;
    clone.repeat.set(repeatX, repeatY);
    clone.colorSpace = colorSpace;
    clone.needsUpdate = true;
    return clone;
  }, [colorSpace, repeatX, repeatY, source]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function useLightMapTexture(path: string, channel: number) {
  const source = useTexture(path);
  const texture = useMemo(() => {
    const clone = source.clone();
    clone.channel = channel;
    clone.colorSpace = THREE.SRGBColorSpace;
    clone.wrapS = THREE.ClampToEdgeWrapping;
    clone.wrapT = THREE.ClampToEdgeWrapping;
    clone.minFilter = THREE.LinearMipmapLinearFilter;
    clone.magFilter = THREE.LinearFilter;
    clone.generateMipmaps = true;
    clone.needsUpdate = true;
    return clone;
  }, [channel, source]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Wall({
  wall,
  useRoomAMaterials = false,
  wallMaterial,
  moldingMaterials,
  moldingProfile,
  wallTexture,
  wallNormalTexture,
  wallRoughnessTexture,
  wallNormalScale,
  lightMap,
  lightMapIntensity,
  height = ROOM_HEIGHT,
}: {
  wall: WallSegment;
  useRoomAMaterials?: boolean;
  wallMaterial?: {
    color: string;
    emissive?: string;
    emissiveIntensity?: number;
    roughness: number;
    metalness: number;
  };
  moldingMaterials?: readonly {
    color: string;
    roughness: number;
    metalness: number;
  }[];
  moldingProfile?: readonly {
    y: number;
    height: number;
    depth: number;
  }[];
  wallTexture?: THREE.Texture;
  wallNormalTexture?: THREE.Texture;
  wallRoughnessTexture?: THREE.Texture;
  wallNormalScale?: THREE.Vector2;
  lightMap?: THREE.Texture;
  lightMapIntensity?: number;
  height?: number;
}) {
  const wallThickness = wall.thickness ?? WALL_THICKNESS;
  const moldingSides = wall.hideMolding
    ? []
    : wall.moldingBothSides ? [1, -1] : [wall.interiorSign];
  const roomAWallMaterial = useRoomAMaterials
    ? wall.color === ROOM_A_MATERIALS.secondaryWall.color
      ? ROOM_A_MATERIALS.secondaryWall
      : ROOM_A_MATERIALS.mainWall
    : undefined;
  const lightmapGeometry = useMemo(
    () => lightMap
      ? createSingleFaceLightmapBoxGeometry(
        wall.length,
        height,
        wallThickness,
        ROOM_A_RIGHT_WALL_LIGHTMAP.interiorFaceMaterialIndex,
        ROOM_A_RIGHT_WALL_LIGHTMAP.neutralUv,
      )
      : null,
    [height, lightMap, wall.length, wallThickness],
  );

  useEffect(() => () => lightmapGeometry?.dispose(), [lightmapGeometry]);

  return (
    <group position={wall.position} rotation={[0, wall.rotationY, 0]}>
      <mesh
        userData={{ blocksArtworkRay: true }}
        onClick={(event) => event.stopPropagation()}
      >
        {lightmapGeometry ? (
          <primitive object={lightmapGeometry} attach="geometry" />
        ) : (
          <boxGeometry args={[wall.length, height, wallThickness]} />
        )}
        {wallMaterial ? (
          <meshStandardMaterial
            {...wallMaterial}
            color={wall.color}
            map={wallTexture}
            normalMap={wallNormalTexture}
            roughnessMap={wallRoughnessTexture}
            normalScale={wallNormalScale}
          />
        ) : useRoomAMaterials ? (
          <meshPhysicalMaterial
            {...roomAWallMaterial}
            color={wall.color}
            map={wallTexture}
            lightMap={lightMap}
            lightMapIntensity={lightMapIntensity}
          />
        ) : (
          <meshStandardMaterial color={wall.color} roughness={0.84} metalness={0} />
        )}
      </mesh>
      {moldingSides.map((side) =>
        (moldingProfile ?? MOLDING_LAYERS).map((layer, layerIndex) => {
          const molding = getMoldingTransform(wall, layer.depth);
          const moldingMaterial = moldingMaterials?.[layerIndex] ?? (useRoomAMaterials
            ? ROOM_A_MATERIALS.baseboard[layerIndex]
            : {
              color: "color" in layer ? layer.color : MOLDING_LAYERS[0].color,
              roughness: 0.52,
              metalness: 0.05,
            });

          return (
            <mesh
              key={`${side}-${layer.y}`}
              position={[
                molding.center,
                -height / 2 + layer.y,
                side * getMoldingCenterOffset(layer.depth),
              ]}
            >
              <boxGeometry args={[molding.length, layer.height, layer.depth]} />
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

function FinishedWall({
  wall,
  lightMap,
  lightMapIntensity,
}: {
  wall: WallSegment;
  lightMap?: THREE.Texture;
  lightMapIntensity?: number;
}) {
  const wallTexture = useRepeatedTexture(
    ROOM_A_TEXTURES.wall,
    wall.length / ROOM_A_TEXTURES.wallRepeatMeters,
    ROOM_HEIGHT / ROOM_A_TEXTURES.wallRepeatMeters,
  );

  return (
    <Wall
      wall={wall}
      useRoomAMaterials
      wallTexture={wallTexture}
      lightMap={lightMap}
      lightMapIntensity={lightMapIntensity}
    />
  );
}

function RoomCWall({ wall }: { wall: WallSegment }) {
  const repeatX = wall.length / ROOM_C_TEXTURES.wallRepeatMeters;
  const repeatY = ROOM_C_HEIGHT / ROOM_C_TEXTURES.wallRepeatMeters;
  const wallAlbedo = useRepeatedTexture(
    ROOM_C_TEXTURES.wallAlbedo,
    repeatX,
    repeatY,
  );
  const wallNormal = useRepeatedTexture(
    ROOM_C_TEXTURES.wallNormal,
    repeatX,
    repeatY,
    THREE.NoColorSpace,
  );
  const wallRoughness = useRepeatedTexture(
    ROOM_C_TEXTURES.wallRoughness,
    repeatX,
    repeatY,
    THREE.NoColorSpace,
  );

  return (
    <Wall
      wall={wall}
      useRoomAMaterials
      wallMaterial={ROOM_C_MATERIALS.wall}
      moldingMaterials={ROOM_C_MATERIALS.baseboard}
      moldingProfile={ROOM_C_BASEBOARD_PROFILE}
      wallTexture={wallAlbedo}
      wallNormalTexture={wallNormal}
      wallRoughnessTexture={wallRoughness}
      wallNormalScale={roomCWallNormalScale}
      height={ROOM_C_HEIGHT}
    />
  );
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
  materialStyle: "roomA" | "roomC" | "default";
}) {
  const profile: readonly {
    y: number;
    height: number;
    depth: number;
    color?: string;
  }[] = materialStyle === "roomC"
    ? ROOM_C_BASEBOARD_PROFILE
    : MOLDING_LAYERS;

  return profile.map((layer, layerIndex) => {
    const material = materialStyle === "roomA"
      ? ROOM_A_MATERIALS.baseboard[layerIndex]
      : materialStyle === "roomC"
        ? ROOM_C_MATERIALS.baseboard[layerIndex]
        : {
          color: layer.color ?? MOLDING_LAYERS[0].color,
          roughness: 0.52,
          metalness: 0.05,
        };
    const span = getMoldingCenterOffset(layer.depth) + layer.depth / 2;
    const overlap = 0.012;
    const jointSize = span + overlap;

    return (
      <mesh
        key={layer.y}
        position={[
          position[0] + xSign * (span - overlap) / 2,
          layer.y,
          position[1] + zSign * (span - overlap) / 2,
        ]}
      >
        <boxGeometry args={[jointSize, layer.height, jointSize]} />
        <meshStandardMaterial {...material} />
      </mesh>
    );
  });
}

function GallerySpotlight({
  placement,
  useRoomALighting = false,
  useRoomCLighting = false,
}: {
  placement: ArtworkPlacement;
  useRoomALighting?: boolean;
  useRoomCLighting?: boolean;
}) {
  const mountHeight = useRoomCLighting ? ROOM_C_LIGHT_MOUNT_Y : ROOM_HEIGHT - 0.08;
  const fixture = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(...placement.position);
    const transform = getSpotlightFixtureTransform(
      placement.lightPosition,
      placement.position,
      mountHeight,
    );
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(...transform.direction),
    );

    return { target, quaternion, ...transform };
  }, [mountHeight, placement]);
  const spotlight = useRoomALighting
    ? ROOM_A_LIGHTING.spotlight
    : useRoomCLighting ? ROOM_C_LIGHTING.spotlight : undefined;
  const prototypeSpotlight = useRoomALighting
    ? getRoomARightWallSpotlightOverride(placement.id)
    : undefined;
  const housingMaterial = useRoomALighting
    ? ROOM_A_MATERIALS.spotlightHousing
    : useRoomCLighting ? ROOM_C_MATERIALS.spotlightHousing : undefined;

  return (
    <>
      <primitive object={fixture.target} />
      <spotLight
        position={fixture.lensPosition}
        target={fixture.target}
        intensity={prototypeSpotlight?.intensity ?? (placement.height > 2
          ? spotlight?.heroIntensity ?? 31
          : spotlight?.standardIntensity ?? 25)}
        distance={spotlight?.distance ?? 5.8}
        angle={prototypeSpotlight?.angle ?? (placement.height > 2
          ? spotlight?.heroAngle ?? 0.54
          : spotlight?.standardAngle ?? 0.45)}
        penumbra={spotlight?.penumbra ?? 0.9}
        decay={spotlight?.decay ?? 1.3}
        color={spotlight?.color ?? "#fff2d7"}
      />

      <mesh
        ref={useRoomALighting ? configureRoomACoveOccluder : undefined}
        position={[
          placement.lightPosition[0],
          mountHeight,
          placement.lightPosition[2],
        ]}
      >
        <cylinderGeometry args={[0.075, 0.075, 0.035, 16]} />
        <meshStandardMaterial
          color={housingMaterial?.color ?? "#293843"}
          metalness={housingMaterial?.metalness ?? 0.58}
          roughness={housingMaterial?.roughness ?? 0.3}
        />
      </mesh>
      <mesh
        ref={useRoomALighting ? configureRoomACoveOccluder : undefined}
        position={[
          placement.lightPosition[0],
          mountHeight - fixture.stemHeight / 2,
          placement.lightPosition[2],
        ]}
      >
        <cylinderGeometry args={[0.022, 0.022, fixture.stemHeight, 10]} />
        <meshStandardMaterial
          color={housingMaterial?.color ?? "#293843"}
          metalness={housingMaterial?.metalness ?? 0.58}
          roughness={housingMaterial?.roughness ?? 0.3}
        />
      </mesh>

      <group position={fixture.pivotPosition} quaternion={fixture.quaternion}>
        <mesh ref={useRoomALighting ? configureRoomACoveOccluder : undefined}>
          <sphereGeometry args={[0.065, 14, 10]} />
          <meshStandardMaterial
            color={housingMaterial?.color ?? "#293843"}
            metalness={housingMaterial?.metalness ?? 0.58}
            roughness={housingMaterial?.roughness ?? 0.3}
          />
        </mesh>
        <mesh
          ref={useRoomALighting ? configureRoomACoveOccluder : undefined}
          position={[0, -0.15, 0]}
        >
          <cylinderGeometry args={[0.075, 0.11, 0.3, 18]} />
          <meshStandardMaterial
            color={housingMaterial?.color ?? "#293843"}
            metalness={housingMaterial?.metalness ?? 0.58}
            roughness={housingMaterial?.roughness ?? 0.3}
          />
        </mesh>
        <mesh
          ref={useRoomALighting ? configureRoomACoveOccluder : undefined}
          position={[0, -0.304, 0]}
        >
          <cylinderGeometry args={[0.086, 0.086, 0.012, 20]} />
          <meshBasicMaterial color="#fff0c9" toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.313, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.006, 20]} />
          <meshBasicMaterial
            color="#ffd89c"
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}

function RoomARightWallCoveLines() {
  const materials = useMemo(
    () => ([0, 1].map(() => new THREE.MeshBasicMaterial({
      color: ROOM_A_RIGHT_WALL_COVE_LINES.color,
      toneMapped: ROOM_A_RIGHT_WALL_COVE_LINES.toneMapped,
      transparent: false,
      depthTest: true,
      depthWrite: true,
    })) as [THREE.MeshBasicMaterial, THREE.MeshBasicMaterial]),
    [],
  );

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

  return (
    <>
      {[
        ROOM_A_RIGHT_WALL_COVE_LINES.upperPosition,
        ROOM_A_RIGHT_WALL_COVE_LINES.lowerPosition,
      ].map((position, index) => (
        <mesh
          key={ROOM_A_COVE_BLOOM.targetMeshKeys[index]}
          ref={(mesh) => mesh?.layers.enable(ROOM_A_COVE_BLOOM_LAYER)}
          position={[...position]}
          raycast={disableRaycast}
        >
          <boxGeometry args={[...ROOM_A_RIGHT_WALL_COVE_LINES.size]} />
          <primitive object={materials[index]} attach="material" />
        </mesh>
      ))}
      <RoomACoveBloom sourceMaterials={materials} />
    </>
  );
}

function RoomA() {
  const rightWallLightMap = useLightMapTexture(
    ROOM_A_RIGHT_WALL_LIGHTMAP.path,
    ROOM_A_RIGHT_WALL_LIGHTMAP.channel,
  );
  const rightUpperCeilingLightMap = useLightMapTexture(
    ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.path,
    ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.channel,
  );
  const ceilingLightMapGeometry = useMemo(
    () => createSingleFaceLightmapBoxGeometry(
      10.8,
      0.16,
      8.8,
      ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.interiorFaceMaterialIndex,
      ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.neutralUv,
    ),
    [],
  );
  useEffect(() => () => ceilingLightMapGeometry.dispose(), [ceilingLightMapGeometry]);
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
        <primitive object={ceilingLightMapGeometry} attach="geometry" />
        <meshStandardMaterial
          {...ROOM_A_MATERIALS.ceiling}
          lightMap={rightUpperCeilingLightMap}
          lightMapIntensity={ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.lightMapIntensity}
        />
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
      {roomAWalls.map((wall) => (
        <FinishedWall
          key={wall.id}
          wall={wall}
          lightMap={wall.id === ROOM_A_RIGHT_WALL_LIGHTMAP.wallId
            ? rightWallLightMap
            : undefined}
          lightMapIntensity={wall.id === ROOM_A_RIGHT_WALL_LIGHTMAP.wallId
            ? ROOM_A_RIGHT_WALL_LIGHTMAP.lightMapIntensity
            : undefined}
        />
      ))}
      <RoomARightWallCoveLines />

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
      <WayfindingSign {...roomAWayfindingSign} />
    </>
  );
}

function RoomB() {
  const floorTexture = useRepeatedTexture(
    ROOM_B_TEXTURES.floor,
    ROOM_B_WIDTH / ROOM_B_TEXTURES.floorRepeatMeters,
    ROOM_B_DEPTH / ROOM_B_TEXTURES.floorRepeatMeters,
  );
  const corridorFloorTexture = useRepeatedTexture(
    ROOM_A_TEXTURES.floor,
    roomBConnection.corridorLength / ROOM_A_TEXTURES.floorRepeatMeters,
    roomBConnection.openingWidth / ROOM_A_TEXTURES.floorRepeatMeters,
  );

  return (
    <>
      <mesh position={[roomBCenter[0], -0.08, roomBCenter[2]]}>
        <boxGeometry args={[ROOM_B_WIDTH, 0.16, ROOM_B_DEPTH]} />
        <meshStandardMaterial {...ROOM_B_MATERIALS.floor} map={floorTexture} />
      </mesh>
      <mesh position={[roomBCenter[0], 4.28, roomBCenter[2]]}>
        <boxGeometry args={[ROOM_B_WIDTH, 0.16, ROOM_B_DEPTH]} />
        <meshStandardMaterial {...ROOM_A_MATERIALS.ceiling} />
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
          {...ROOM_A_MATERIALS.floor}
          color="#ffffff"
          map={corridorFloorTexture}
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
        <meshStandardMaterial {...ROOM_A_MATERIALS.ceiling} />
      </mesh>

      {roomBWalls.map((wall) => (
        <FinishedWall key={wall.id} wall={wall} />
      ))}

      <mesh position={[roomBCenter[0], 4.13, -14.55]}>
        <boxGeometry args={[9, 0.05, 0.07]} />
        <meshStandardMaterial color="#34414b" metalness={0.62} roughness={0.32} />
      </mesh>
      <mesh position={[roomBCenter[0], 4.13, -8.25]}>
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
      <RoomWallQuote {...roomBWallQuote} />
    </>
  );
}

function RoomC() {
  const floorAlbedo = useRepeatedTexture(
    ROOM_C_TEXTURES.floorAlbedo,
    ROOM_C_WIDTH / ROOM_C_TEXTURES.floorRepeatMeters,
    ROOM_C_DEPTH / ROOM_C_TEXTURES.floorRepeatMeters,
  );
  const floorNormal = useRepeatedTexture(
    ROOM_C_TEXTURES.floorNormal,
    ROOM_C_WIDTH / ROOM_C_TEXTURES.floorRepeatMeters,
    ROOM_C_DEPTH / ROOM_C_TEXTURES.floorRepeatMeters,
    THREE.NoColorSpace,
  );
  const floorRoughness = useRepeatedTexture(
    ROOM_C_TEXTURES.floorRoughness,
    ROOM_C_WIDTH / ROOM_C_TEXTURES.floorRepeatMeters,
    ROOM_C_DEPTH / ROOM_C_TEXTURES.floorRepeatMeters,
    THREE.NoColorSpace,
  );

  return (
    <>
      <mesh position={[roomCCenter[0], -0.08, roomCCenter[2]]}>
        <boxGeometry args={[ROOM_C_WIDTH, 0.16, ROOM_C_DEPTH]} />
        <meshStandardMaterial
          {...ROOM_C_MATERIALS.floor}
          map={floorAlbedo}
          normalMap={floorNormal}
          roughnessMap={floorRoughness}
          normalScale={roomCFloorNormalScale}
        />
      </mesh>
      <mesh position={[roomCCenter[0], ROOM_C_CEILING_Y, roomCCenter[2]]}>
        <boxGeometry args={[ROOM_C_WIDTH, 0.16, ROOM_C_DEPTH]} />
        <meshStandardMaterial {...ROOM_C_MATERIALS.ceiling} />
      </mesh>

      {roomCWalls.map((wall) => (
        <RoomCWall key={wall.id} wall={wall} />
      ))}

      <mesh position={[roomCCenter[0], ROOM_C_TRACK_Y, -18.25]}>
        <boxGeometry args={[8.2, 0.05, 0.07]} />
        <meshStandardMaterial {...ROOM_C_MATERIALS.track} />
      </mesh>
      <mesh position={[roomCCenter[0], ROOM_C_TRACK_Y, -12.2]}>
        <boxGeometry args={[7.2, 0.05, 0.07]} />
        <meshStandardMaterial {...ROOM_C_MATERIALS.track} />
      </mesh>
      <mesh position={[-14.55, ROOM_C_TRACK_Y, roomCCenter[2]]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5.6, 0.05, 0.07]} />
        <meshStandardMaterial {...ROOM_C_MATERIALS.track} />
      </mesh>
      <mesh position={[-8, ROOM_C_TRACK_Y, roomCCenter[2]]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[7.2, 0.05, 0.07]} />
        <meshStandardMaterial {...ROOM_C_MATERIALS.track} />
      </mesh>

      {roomCArtworkPlacements.map((placement) => (
        <GallerySpotlight
          key={`spotlight-${placement.id}`}
          placement={placement}
          useRoomCLighting
        />
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

function GalleryReady({ onReady }: { onReady?: () => void }) {
  const invalidate = useThree((state) => state.invalidate);
  const renderedFrames = useRef(0);
  const readyFrame = useRef<number | null>(null);
  const readyReported = useRef(false);

  useFrame(() => {
    if (readyReported.current) return;
    renderedFrames.current += 1;

    if (renderedFrames.current === 1) {
      invalidate();
      return;
    }

    if (readyFrame.current !== null) return;
    readyFrame.current = requestAnimationFrame(() => {
      readyFrame.current = null;
      readyReported.current = true;
      onReady?.();
    });
  });

  useEffect(() => {
    return () => {
      if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
    };
  }, []);

  return null;
}

export function GalleryScene({
  moveInput,
  lookInput,
  isCoarsePointer,
  isRenderingPaused,
  interactionBlocked,
  onReady,
}: GallerySceneProps) {
  const renderQuality = getRenderQuality(isCoarsePointer);

  return (
    <Canvas
      frameloop={isRenderingPaused ? "demand" : "always"}
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
        gl.toneMappingExposure = 1.352;
      }}
    >
      <Suspense fallback={null}>
        <RoomA />
        <RoomB />
        <RoomC />
        {galleryMoldingCorners.map((corner) => (
          <GalleryMoldingCorner key={corner.id} {...corner} />
        ))}
        <PlayerController
          moveInput={moveInput}
          lookInput={lookInput}
          isCoarsePointer={isCoarsePointer}
          interactionBlocked={interactionBlocked}
        />
        <GalleryReady onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
