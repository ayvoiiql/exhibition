import { BoxGeometry, Float32BufferAttribute } from "three";

export const ROOM_A_RIGHT_WALL_LIGHTMAP = {
  wallId: "right",
  path: "/materials/room-a-right-wall-lightmap.png",
  resolution: 512,
  channel: 1,
  lightMapIntensity: 1.48,
  interiorFaceMaterialIndex: 5,
  neutralUv: [0.5, 0.5] as const,
  upperNearRange: 0.24,
  upperBroadRange: 0.7,
  upperNearStrength: 0.68,
  upperBroadStrength: 0.66,
  lowerRange: 0.16,
  edgeFadeRange: 0.07,
  warmColor: "#e4bd88",
} as const;

export const ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP = {
  path: "/materials/room-a-right-upper-ceiling-lightmap.png",
  resolution: 256,
  channel: 1,
  lightMapIntensity: 2,
  interiorFaceMaterialIndex: 3,
  neutralUv: [0, 0.5] as const,
  nearRange: 0.24,
  broadRange: 0.72,
  nearStrength: 0.72,
  broadStrength: 0.7,
  edgeFadeRange: 0.06,
  warmColor: "#e4bd88",
} as const;

export const ROOM_A_RIGHT_WALL_COVE_LINES = {
  wallId: "right",
  size: [0.008, 0.018, 8.4] as const,
  upperPosition: [5.314, 4.185, 0] as const,
  lowerPosition: [5.314, 0.164, 0] as const,
  color: "#c39b68",
  toneMapped: false,
} as const;

export const ROOM_A_COVE_BLOOM_LAYER = 1;
export const ROOM_A_COVE_OCCLUDER_LAYER = 2;

export const ROOM_A_COVE_BLOOM = {
  enabled: true,
  targetMeshKeys: ["right-wall-upper-cove", "right-wall-lower-cove"] as const,
  maxPixelRatio: 1,
  sourceStrength: {
    upper: 1.25,
    lower: 0.9,
  },
  strength: 0.27,
  radius: 0.64,
  threshold: 0.1,
} as const;

const RIGHT_WALL_SPOTLIGHT_ARTWORK_IDS = new Set([
  "artwork-a-04",
  "artwork-a-05",
  "artwork-a-06",
]);

const RIGHT_WALL_SPOTLIGHT_OVERRIDE = {
  intensity: 16,
  angle: 0.5,
} as const;

export function getRoomARightWallSpotlightOverride(artworkId: string) {
  return RIGHT_WALL_SPOTLIGHT_ARTWORK_IDS.has(artworkId)
    ? RIGHT_WALL_SPOTLIGHT_OVERRIDE
    : undefined;
}

export function createSingleFaceLightmapBoxGeometry(
  width: number,
  height: number,
  depth: number,
  lightmappedMaterialIndex: number,
  neutralUv: readonly [number, number],
) {
  const geometry = new BoxGeometry(width, height, depth);
  const uv = geometry.getAttribute("uv");
  const index = geometry.getIndex();
  const lightmappedGroup = geometry.groups.find(
    (group) => group.materialIndex === lightmappedMaterialIndex,
  );

  if (!index || !lightmappedGroup) {
    geometry.dispose();
    throw new Error("BoxGeometry is missing the requested lightmap face");
  }

  const uv1 = new Float32BufferAttribute(new Float32Array(uv.count * 2), 2);

  for (let vertexIndex = 0; vertexIndex < uv.count; vertexIndex += 1) {
    uv1.setXY(vertexIndex, neutralUv[0], neutralUv[1]);
  }

  for (
    let indexOffset = lightmappedGroup.start;
    indexOffset < lightmappedGroup.start + lightmappedGroup.count;
    indexOffset += 1
  ) {
    const vertexIndex = index.getX(indexOffset);
    uv1.setXY(vertexIndex, uv.getX(vertexIndex), uv.getY(vertexIndex));
  }

  geometry.setAttribute("uv1", uv1);
  return geometry;
}
