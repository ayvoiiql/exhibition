import { Text } from "@react-three/drei";
import type { Vec3 } from "../galleryLayout";

interface RoomWallQuoteProps {
  lines: string[];
  position: Vec3;
  rotationY: number;
  width: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  insetColor: string;
  bevelColor: string;
}

export function RoomWallQuote({
  lines,
  position,
  rotationY,
  width,
  fontSize,
  lineHeight,
  letterSpacing,
  insetColor,
  bevelColor,
}: RoomWallQuoteProps) {
  const text = lines.join("\n");
  const textProps = {
    fontSize,
    lineHeight,
    letterSpacing,
    maxWidth: width,
    textAlign: "center" as const,
    anchorX: "center" as const,
    anchorY: "middle" as const,
  };

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Text
        {...textProps}
        position={[-0.003, 0.003, 0.001]}
        color={bevelColor}
        material-toneMapped={false}
        renderOrder={0}
      >
        {text}
      </Text>
      <Text
        {...textProps}
        position={[0, 0, 0.003]}
        color={insetColor}
        outlineColor={insetColor}
        outlineWidth={0.0008}
        outlineBlur={0}
        material-toneMapped={false}
        renderOrder={1}
      >
        {text}
      </Text>
    </group>
  );
}
