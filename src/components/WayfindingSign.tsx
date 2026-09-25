import { RoundedBox, Text } from "@react-three/drei";
import { getWayfindingFontSize, type Vec3 } from "../galleryLayout";

interface WayfindingSignProps {
  label: string;
  position: Vec3;
  rotationY: number;
  preferredFontSize: number;
  maxWidth: number;
  textDepth: number;
  textLayerCount: number;
  textSideOutlineWidth: number;
  frontColor: string;
  sideColor: string;
  linePosition: Vec3;
  lineWidth: number;
  lineHousingHeight: number;
  lineHousingDepth: number;
  lineFaceHeight: number;
  lineFaceDepth: number;
}

export function WayfindingSign({
  label,
  position,
  rotationY,
  preferredFontSize,
  maxWidth,
  textDepth,
  textLayerCount,
  textSideOutlineWidth,
  frontColor,
  sideColor,
  linePosition,
  lineWidth,
  lineHousingHeight,
  lineHousingDepth,
  lineFaceHeight,
  lineFaceDepth,
}: WayfindingSignProps) {
  const fontSize = getWayfindingFontSize(label, maxWidth, preferredFontSize);
  const sideLayers = Array.from(
    { length: textLayerCount },
    (_, index) => textDepth * index / textLayerCount,
  );

  const textProps = {
    fontSize,
    maxWidth,
    whiteSpace: "nowrap" as const,
    overflowWrap: "normal" as const,
    letterSpacing: 0.045,
    anchorX: "center" as const,
    anchorY: "middle" as const,
  };

  return (
    <>
      <group position={position} rotation={[0, rotationY, 0]}>
        {sideLayers.map((depth, index) => (
          <Text
            key={depth}
            {...textProps}
            position={[0, 0, depth]}
            color={sideColor}
            outlineColor={sideColor}
            outlineWidth={textSideOutlineWidth}
            outlineBlur={0}
            material-toneMapped
            renderOrder={index}
          >
            {label}
          </Text>
        ))}
        <Text
          {...textProps}
          position={[0, 0, textDepth]}
          color={frontColor}
          outlineColor={frontColor}
          outlineWidth={0.0012}
          outlineBlur={0}
          material-toneMapped={false}
          renderOrder={textLayerCount + 1}
        >
          {label}
        </Text>
      </group>

      <group position={linePosition} rotation={[0, rotationY, 0]}>
        <RoundedBox
          args={[lineWidth, lineHousingHeight, lineHousingDepth]}
          radius={0.004}
          smoothness={4}
        >
          <meshStandardMaterial color={sideColor} metalness={0.58} roughness={0.5} />
        </RoundedBox>
        <RoundedBox
          args={[lineWidth - 0.012, lineFaceHeight, lineFaceDepth]}
          position={[0, 0, lineHousingDepth / 2 + lineFaceDepth / 2]}
          radius={0.003}
          smoothness={4}
          renderOrder={1}
        >
          <meshBasicMaterial color={frontColor} toneMapped={false} />
        </RoundedBox>
      </group>
    </>
  );
}
