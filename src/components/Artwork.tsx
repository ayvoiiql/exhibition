import { Text, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ArtworkData } from "../types";
import { useGalleryStore } from "../store";

interface ArtworkProps {
  artwork: ArtworkData;
  position: [number, number, number];
  rotationY?: number;
  targetHeight?: number;
}

export function Artwork({ artwork, position, rotationY = 0, targetHeight = 1.82 }: ArtworkProps) {
  const texture = useTexture(artwork.image);
  const selectArtwork = useGalleryStore((state) => state.selectArtwork);
  const focusedArtwork = useGalleryStore((state) => state.focusedArtwork);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }, [texture]);

  const [width, height] = useMemo(() => {
    const image = texture.image as { width?: number; height?: number };
    const aspect = (image.width ?? 1) / (image.height ?? 1);
    return [targetHeight * aspect, targetHeight];
  }, [targetHeight, texture]);

  const frame = 0.09;
  const innerTrim = 0.022;
  const active = focusedArtwork?.id === artwork.id;
  const frameColor = active ? "#d5b66f" : "#705936";

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
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "default";
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta <= 5) selectArtwork(artwork);
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      <mesh position={[0, height / 2 + 0.08 + frame / 2, 0.065]}>
        <boxGeometry args={[width + 0.16 + frame * 2, frame, 0.14]} />
        <meshStandardMaterial color={frameColor} metalness={active ? 0.5 : 0.12} roughness={0.4} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.08 - frame / 2, 0.065]}>
        <boxGeometry args={[width + 0.16 + frame * 2, frame, 0.14]} />
        <meshStandardMaterial color={frameColor} metalness={active ? 0.5 : 0.12} roughness={0.4} />
      </mesh>
      <mesh position={[-width / 2 - 0.08 - frame / 2, 0, 0.065]}>
        <boxGeometry args={[frame, height + 0.16, 0.14]} />
        <meshStandardMaterial color={frameColor} metalness={active ? 0.5 : 0.12} roughness={0.4} />
      </mesh>
      <mesh position={[width / 2 + 0.08 + frame / 2, 0, 0.065]}>
        <boxGeometry args={[frame, height + 0.16, 0.14]} />
        <meshStandardMaterial color={frameColor} metalness={active ? 0.5 : 0.12} roughness={0.4} />
      </mesh>

      <mesh position={[0, height / 2 + innerTrim / 2, 0.155]}>
        <boxGeometry args={[width + innerTrim * 2, innerTrim, 0.025]} />
        <meshStandardMaterial color="#d0ad68" metalness={0.76} roughness={0.25} />
      </mesh>
      <mesh position={[0, -height / 2 - innerTrim / 2, 0.155]}>
        <boxGeometry args={[width + innerTrim * 2, innerTrim, 0.025]} />
        <meshStandardMaterial color="#d0ad68" metalness={0.76} roughness={0.25} />
      </mesh>
      <mesh position={[-width / 2 - innerTrim / 2, 0, 0.155]}>
        <boxGeometry args={[innerTrim, height, 0.025]} />
        <meshStandardMaterial color="#d0ad68" metalness={0.76} roughness={0.25} />
      </mesh>
      <mesh position={[width / 2 + innerTrim / 2, 0, 0.155]}>
        <boxGeometry args={[innerTrim, height, 0.025]} />
        <meshStandardMaterial color="#d0ad68" metalness={0.76} roughness={0.25} />
      </mesh>

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
    </group>
  );
}
