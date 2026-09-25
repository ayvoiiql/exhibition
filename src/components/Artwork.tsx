import { RoundedBox, Text, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { FRAME_INNER_TRIM, getTextureAnisotropy } from "../renderQuality";
import { ROOM_A_MATERIALS } from "../galleryLayout";
import type { ArtworkData } from "../types";
import { useGalleryStore } from "../store";

interface ArtworkProps {
  artwork: ArtworkData;
  position: [number, number, number];
  rotationY?: number;
  targetHeight?: number;
  materialStyle?: "default" | "roomA";
}

const PLAQUE_WIDTH = 0.48;
const PLAQUE_HEIGHT = 0.2;
const ROOM_A_PLAQUE_CENTER_Y = 1.45;
function createBrushedMetalTexture() {
  const textureWidth = 256;
  const textureHeight = 64;
  const data = new Uint8Array(textureWidth * textureHeight);

  for (let y = 0; y < textureHeight; y += 1) {
    const band = Math.sin(y * 1.7) * 11 + Math.sin(y * 0.37) * 7;
    for (let x = 0; x < textureWidth; x += 1) {
      const grain = Math.sin(x * 0.91 + y * 0.13) * 3;
      data[y * textureWidth + x] = THREE.MathUtils.clamp(148 + band + grain, 0, 255);
    }
  }

  const texture = new THREE.DataTexture(
    data,
    textureWidth,
    textureHeight,
    THREE.RedFormat,
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.8, 1);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function ArtworkPlaque({
  artwork,
  artworkWidth,
  offsetY,
}: {
  artwork: ArtworkData;
  artworkWidth: number;
  offsetY: number;
}) {
  const brushedMetal = useMemo(() => createBrushedMetalTexture(), []);

  useEffect(() => () => brushedMetal.dispose(), [brushedMetal]);

  return (
    <group position={[artworkWidth / 2 + 0.56, offsetY, 0]}>
      <mesh position={[0.003, -0.004, 0.001]}>
        <boxGeometry args={[PLAQUE_WIDTH + 0.008, PLAQUE_HEIGHT + 0.008, 0.002]} />
        <meshStandardMaterial color="#02060b" roughness={1} transparent opacity={0.2} />
      </mesh>

      <RoundedBox
        args={[PLAQUE_WIDTH, PLAQUE_HEIGHT, 0.004]}
        radius={0.002}
        smoothness={4}
        position={[0, 0, 0.004]}
      >
        <meshPhysicalMaterial
          color="#c2b083"
          metalness={0.68}
          roughness={0.72}
          roughnessMap={brushedMetal}
          bumpMap={brushedMetal}
          bumpScale={0.0008}
          anisotropy={0.34}
          anisotropyRotation={Math.PI / 2}
          clearcoat={0}
        />
      </RoundedBox>

      <Text
        position={[-0.175, 0.032, 0.0065]}
        fontSize={0.047}
        color="#2e2a22"
        anchorX="left"
        anchorY="middle"
        maxWidth={0.33}
      >
        {artwork.title}
      </Text>
      <Text
        position={[-0.175, -0.043, 0.0065]}
        fontSize={0.022}
        letterSpacing={0.08}
        color="#554c3c"
        anchorX="left"
        anchorY="middle"
      >
        {`ROOM ${artwork.roomId}  ·  ${String(artwork.order).padStart(2, "0")}`}
      </Text>

      {[
        [-0.21, 0.07],
        [0.21, 0.07],
        [-0.21, -0.07],
        [0.21, -0.07],
      ].map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.007]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.001, 16]} />
          <meshStandardMaterial color="#9a885f" metalness={0.7} roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

export function Artwork({
  artwork,
  position,
  rotationY = 0,
  targetHeight = 1.82,
  materialStyle = "default",
}: ArtworkProps) {
  const texture = useTexture(artwork.image);
  const { gl } = useThree();
  const started = useGalleryStore((state) => state.started);
  const selectArtwork = useGalleryStore((state) => state.selectArtwork);
  const focusedArtwork = useGalleryStore((state) => state.focusedArtwork);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = getTextureAnisotropy(gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
  }, [gl, texture]);

  const [width, height] = useMemo(() => {
    const image = texture.image as { width?: number; height?: number };
    const aspect = (image.width ?? 1) / (image.height ?? 1);
    return [targetHeight * aspect, targetHeight];
  }, [targetHeight, texture]);

  const frame = 0.09;
  const innerTrim = FRAME_INNER_TRIM;
  const active = focusedArtwork?.id === artwork.id;
  const usesRoomAMaterials = materialStyle === "roomA";
  const frameColor = usesRoomAMaterials
    ? active ? ROOM_A_MATERIALS.frame.activeColor : ROOM_A_MATERIALS.frame.color
    : active ? "#d5b66f" : "#705936";
  const frameMetalness = usesRoomAMaterials
    ? ROOM_A_MATERIALS.frame.metalness
    : active ? 0.5 : 0.12;
  const frameRoughness = usesRoomAMaterials ? ROOM_A_MATERIALS.frame.roughness : 0.4;
  const trimMaterial = usesRoomAMaterials
    ? ROOM_A_MATERIALS.frameTrim
    : { color: "#d0ad68", metalness: 0.76, roughness: 0.25 };
  const usesMetalPlaque = usesRoomAMaterials && artwork.roomId === "A";

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, -0.025, 0.005]}>
        <boxGeometry args={[width + 0.3, height + 0.3, 0.07]} />
        <meshStandardMaterial color="#131313" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[width + 0.16, height + 0.16]} />
        <meshStandardMaterial color="#e4dfd5" roughness={0.82} />
      </mesh>
      <mesh
        position={[0, 0, 0.075]}
        userData={{ artworkId: artwork.id, artwork }}
        onPointerEnter={(event) => {
          if (!started) return;
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "default";
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (started && event.delta <= 5) selectArtwork(artwork);
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      <>
        <mesh position={[0, height / 2 + 0.08 + frame / 2, 0.065]}>
          <boxGeometry args={[width + 0.16 + frame * 2, frame, 0.14]} />
          <meshStandardMaterial
            color={frameColor}
            metalness={frameMetalness}
            roughness={frameRoughness}
          />
        </mesh>
        <mesh position={[0, -height / 2 - 0.08 - frame / 2, 0.065]}>
          <boxGeometry args={[width + 0.16 + frame * 2, frame, 0.14]} />
          <meshStandardMaterial
            color={frameColor}
            metalness={frameMetalness}
            roughness={frameRoughness}
          />
        </mesh>
        <mesh position={[-width / 2 - 0.08 - frame / 2, 0, 0.065]}>
          <boxGeometry args={[frame, height + 0.16, 0.14]} />
          <meshStandardMaterial
            color={frameColor}
            metalness={frameMetalness}
            roughness={frameRoughness}
          />
        </mesh>
        <mesh position={[width / 2 + 0.08 + frame / 2, 0, 0.065]}>
          <boxGeometry args={[frame, height + 0.16, 0.14]} />
          <meshStandardMaterial
            color={frameColor}
            metalness={frameMetalness}
            roughness={frameRoughness}
          />
        </mesh>
      </>

      <>
        <mesh position={[0, height / 2 + innerTrim / 2, 0.155]}>
          <boxGeometry args={[width + innerTrim * 2, innerTrim, 0.025]} />
          <meshStandardMaterial {...trimMaterial} />
        </mesh>
        <mesh position={[0, -height / 2 - innerTrim / 2, 0.155]}>
          <boxGeometry args={[width + innerTrim * 2, innerTrim, 0.025]} />
          <meshStandardMaterial {...trimMaterial} />
        </mesh>
        <mesh position={[-width / 2 - innerTrim / 2, 0, 0.155]}>
          <boxGeometry args={[innerTrim, height, 0.025]} />
          <meshStandardMaterial {...trimMaterial} />
        </mesh>
        <mesh position={[width / 2 + innerTrim / 2, 0, 0.155]}>
          <boxGeometry args={[innerTrim, height, 0.025]} />
          <meshStandardMaterial {...trimMaterial} />
        </mesh>
      </>

      {usesMetalPlaque ? (
        <ArtworkPlaque
          artwork={artwork}
          artworkWidth={width}
          offsetY={ROOM_A_PLAQUE_CENTER_Y - position[1]}
        />
      ) : (
        <Text
          position={[0, -height / 2 - 0.34, 0.075]}
          fontSize={0.13}
          color="#ddd8cc"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.2}
        >
          {artwork.title}
        </Text>
      )}
    </group>
  );
}
