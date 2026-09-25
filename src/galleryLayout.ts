export type Vec3 = [number, number, number];

export interface WallSegment {
  id: string;
  position: Vec3;
  length: number;
  rotationY: number;
  color: string;
  interiorSign: 1 | -1;
  kind?: "gallery" | "connector" | "partition";
  thickness?: number;
  hideMolding?: boolean;
  moldingBothSides?: boolean;
  moldingNegativeExtension?: number;
  moldingPositiveExtension?: number;
}

export interface ArtworkPlacement {
  id: string;
  wallId: string;
  position: Vec3;
  rotationY: number;
  height: number;
  lightPosition: Vec3;
}

export const ROOM_HEIGHT = 4.2;
export const WALL_THICKNESS = 0.16;
export const ROOM_B_WIDTH = 12.4;
export const ROOM_B_DEPTH = 11.1;
export const ROOM_B_FRONT_Z = -5.7;
export const ROOM_C_WIDTH = 10.8;
export const ROOM_C_DEPTH = 10.2;
export const ROOM_C_HEIGHT = 4.8;
export const ROOM_C_CEILING_Y = ROOM_C_HEIGHT + 0.08;
export const ROOM_C_TRACK_Y = ROOM_C_HEIGHT - 0.07;
export const ROOM_C_LIGHT_MOUNT_Y = ROOM_C_HEIGHT - 0.08;
export const ROOM_C_RIGHT_X = -5.9;
export const ROOM_C_FRONT_Z = -10.2;
export const ROOM_C_BACK_Z = -20.4;
export const MOLDING_LAYERS = [
  { y: 0.025, height: 0.05, depth: 0.08, color: "#263945" },
  { y: 0.0825, height: 0.065, depth: 0.055, color: "#40596a" },
  { y: 0.1325, height: 0.035, depth: 0.09, color: "#718999" },
] as const;
export const ROOM_A_MOLDING_PROFILE = [
  { y: 0.025, height: 0.05 },
  { y: 0.0825, height: 0.065 },
  { y: 0.1325, height: 0.035 },
] as const;
export const GALLERY_SURFACE_COLORS = {
  frontWall: "#3c5d7d",
  sideWall: "#476c8c",
  backWall: "#3c5d7d",
  floor: "#454a4d",
  corridorFloor: "#3f484c",
} as const;
export const ROOM_A_MATERIALS = {
  mainWall: {
    color: "#3c5d7d",
    roughness: 0.74,
    metalness: 0,
    clearcoat: 0.04,
    clearcoatRoughness: 0.82,
  },
  secondaryWall: {
    color: "#476c8c",
    roughness: 0.74,
    metalness: 0,
    clearcoat: 0.04,
    clearcoatRoughness: 0.82,
  },
  ceiling: {
    color: "#142638",
    emissive: "#142638",
    emissiveIntensity: 0.28,
    roughness: 0.92,
    metalness: 0,
  },
  floor: {
    color: "#495663",
    roughness: 0.68,
    metalness: 0.08,
    clearcoat: 0.1,
    clearcoatRoughness: 0.74,
  },
  floorLine: { color: "#65727f", roughness: 0.84, metalness: 0 },
  baseboard: [
    { color: "#1b2b3a", roughness: 0.78, metalness: 0.02 },
    { color: "#30475c", roughness: 0.74, metalness: 0.03 },
    { color: "#52677c", roughness: 0.7, metalness: 0.04 },
  ],
  track: { color: "#0a1017", roughness: 0.68, metalness: 0.28 },
  spotlightHousing: { color: "#121a23", roughness: 0.52, metalness: 0.32 },
  frame: {
    color: "#3a281e",
    activeColor: "#503524",
    roughness: 0.68,
    metalness: 0.02,
  },
  frameTrim: { color: "#745035", roughness: 0.58, metalness: 0.08 },
} as const;
export const ROOM_A_TEXTURES = {
  wall: "/materials/room-a-smooth-wall.webp",
  floor: "/materials/room-a-slate-floor.webp",
  wallRepeatMeters: 6,
  floorRepeatMeters: 3,
} as const;

export const ROOM_B_MATERIALS = {
  floor: {
    color: "#ffffff",
    roughness: 0.74,
    metalness: 0,
  },
} as const;

export const ROOM_B_TEXTURES = {
  floor: "/materials/room-b-walnut-floor-light.webp",
  floorRepeatMeters: 4.8,
} as const;

export const ROOM_C_MATERIALS = {
  wall: {
    color: "#ffffff",
    roughness: 1,
    metalness: 0,
  },
  floor: {
    color: "#ffffff",
    roughness: 0.81,
    metalness: 0,
  },
  ceiling: {
    color: "#ece2d3",
    emissive: "#ece2d3",
    emissiveIntensity: 0.5,
    roughness: 0.9,
    metalness: 0,
  },
  baseboard: [
    { color: "#5e5650", roughness: 0.86, metalness: 0 },
  ],
  track: {
    color: "#202326",
    roughness: 0.58,
    metalness: 0.34,
  },
  spotlightHousing: {
    color: "#202326",
    roughness: 0.5,
    metalness: 0.32,
  },
} as const;

export const ROOM_C_TEXTURES = {
  floorAlbedo: "/materials/room-c-muted-oak-albedo-1k.jpg",
  floorNormal: "/materials/room-c-muted-oak-normal-gl-1k.jpg",
  floorRoughness: "/materials/room-c-muted-oak-roughness-1k.jpg",
  floorRepeatMeters: 2.7,
  floorNormalScale: 0.12,
  wallAlbedo: "/materials/room-c-clean-mineral-wall-albedo-1k.jpg",
  wallNormal: "/materials/room-c-clean-mineral-wall-normal-gl-1k.jpg",
  wallRoughness: "/materials/room-c-clean-mineral-wall-roughness-1k.jpg",
  wallRepeatMeters: 1,
  wallNormalScale: 0.05,
} as const;

export const ROOM_C_BASEBOARD_PROFILE = [
  { y: 0.035, height: 0.07, depth: 0.03 },
] as const;

export const ROOM_C_LIGHTING = {
  spotlight: {
    color: "#f6ead8",
    heroIntensity: 7.4,
    standardIntensity: 6.3,
    distance: 7.5,
    heroAngle: 1.38,
    standardAngle: 1.32,
    penumbra: 1,
    decay: 1.2,
  },
} as const;

export const ROOM_A_LIGHTING = {
  hemisphere: {
    skyColor: "#b7cde0",
    groundColor: "#2b4055",
    intensity: 2,
  },
  directional: { color: "#c7d9e6", intensity: 0.75 },
  spotlight: {
    color: "#fff0d2",
    heroIntensity: 22,
    standardIntensity: 18,
    distance: 6.4,
    heroAngle: 0.76,
    standardAngle: 0.72,
    penumbra: 0.94,
    decay: 1.25,
  },
} as const;

export function getSpotlightFixtureTransform(
  lightPosition: Vec3,
  targetPosition: Vec3,
  mountHeight = ROOM_HEIGHT - 0.08,
) {
  const [lightX, lightY, lightZ] = lightPosition;
  const deltaX = targetPosition[0] - lightX;
  const deltaY = targetPosition[1] - lightY;
  const deltaZ = targetPosition[2] - lightZ;
  const distance = Math.hypot(deltaX, deltaY, deltaZ) || 1;
  const direction: Vec3 = [deltaX / distance, deltaY / distance, deltaZ / distance];
  const lensOffset = 0.31;

  return {
    pivotPosition: [...lightPosition] as Vec3,
    direction,
    lensPosition: [
      lightX + direction[0] * lensOffset,
      lightY + direction[1] * lensOffset,
      lightZ + direction[2] * lensOffset,
    ] as Vec3,
    stemHeight: Math.max(0.08, mountHeight - lightY),
  };
}

export function getMoldingCenterOffset(depth: number) {
  return WALL_THICKNESS / 2 + depth / 2 - 0.012;
}

export function getMoldingTransform(wall: WallSegment, depth: number) {
  const negativeExtension = wall.moldingNegativeExtension ?? depth;
  const positiveExtension = wall.moldingPositiveExtension ?? depth;
  const length = wall.length + negativeExtension + positiveExtension;
  const center = (positiveExtension - negativeExtension) / 2;

  return {
    center,
    length,
    negativeEdge: -wall.length / 2 - negativeExtension,
    positiveEdge: wall.length / 2 + positiveExtension,
  };
}

export const roomAConnection = {
  id: "to-room-b",
  roomId: "B",
  center: [1.55, 1.65, -4.4] as Vec3,
  openingWidth: 2.4,
  corridorLength: 1.3,
  status: "connected" as const,
};

export function getWayfindingFontSize(
  label: string,
  maxWidth: number,
  preferredFontSize: number,
) {
  const estimatedWidth = label.length * preferredFontSize * 0.72;

  if (estimatedWidth <= maxWidth) return preferredFontSize;
  return Math.max(0.12, maxWidth / (label.length * 0.72));
}

export const roomAWayfindingSign = {
  label: "B",
  position: [roomAConnection.center[0], 3.85, -4.316] as Vec3,
  rotationY: 0,
  preferredFontSize: 0.26,
  maxWidth: 1.8,
  textDepth: 0.014,
  textLayerCount: 5,
  textSideOutlineWidth: 0.004,
  frontColor: "#ffe3a6",
  sideColor: "#705832",
  linePosition: [roomAConnection.center[0], 3.529, -4.307] as Vec3,
  lineWidth: roomAConnection.openingWidth,
  lineHousingHeight: 0.032,
  lineHousingDepth: 0.012,
  lineFaceHeight: 0.012,
  lineFaceDepth: 0.002,
};

// 룸 A는 한 작품용 피처 벽과 다음 방으로 이어질 개구부만 변주한 절제된 직사각형 평면입니다.
export const roomAWalls: WallSegment[] = [
  {
    id: "front",
    position: [0, 2.1, 4.4],
    length: 10.8,
    rotationY: 0,
    color: ROOM_A_MATERIALS.mainWall.color,
    interiorSign: -1,
  },
  {
    id: "right",
    position: [5.4, 2.1, 0],
    length: 8.8,
    rotationY: Math.PI / 2,
    color: ROOM_A_MATERIALS.secondaryWall.color,
    interiorSign: -1,
  },
  {
    id: "back-feature",
    position: [-2.525, 2.1, -4.4],
    length: 5.75,
    rotationY: 0,
    color: ROOM_A_MATERIALS.mainWall.color,
    interiorSign: 1,
    moldingPositiveExtension: 0,
  },
  {
    id: "back-return",
    position: [4.075, 2.1, -4.4],
    length: 2.65,
    rotationY: 0,
    color: ROOM_A_MATERIALS.mainWall.color,
    interiorSign: 1,
    moldingNegativeExtension: 0,
  },
  {
    id: "left",
    position: [-5.4, 2.1, 0],
    length: 8.8,
    rotationY: Math.PI / 2,
    color: ROOM_A_MATERIALS.secondaryWall.color,
    interiorSign: 1,
  },
  {
    id: "connector-left",
    position: [0.35, 2.1, -5.05],
    length: 1.3,
    rotationY: Math.PI / 2,
    color: ROOM_A_MATERIALS.mainWall.color,
    interiorSign: 1,
    kind: "connector",
    moldingNegativeExtension: 0,
    moldingPositiveExtension: 0,
  },
  {
    id: "connector-right",
    position: [2.75, 2.1, -5.05],
    length: 1.3,
    rotationY: Math.PI / 2,
    color: ROOM_A_MATERIALS.mainWall.color,
    interiorSign: -1,
    kind: "connector",
    moldingNegativeExtension: 0,
    moldingPositiveExtension: 0,
  },
];

export const galleryMoldingCorners = [
  {
    id: "a-b-room-a-left",
    position: [roomAConnection.center[0] - roomAConnection.openingWidth / 2, -4.4] as const,
    xSign: 1 as const,
    zSign: 1 as const,
    materialStyle: "roomA" as const,
  },
  {
    id: "a-b-room-a-right",
    position: [roomAConnection.center[0] + roomAConnection.openingWidth / 2, -4.4] as const,
    xSign: -1 as const,
    zSign: 1 as const,
    materialStyle: "roomA" as const,
  },
  {
    id: "a-b-room-b-left",
    position: [roomAConnection.center[0] - roomAConnection.openingWidth / 2, ROOM_B_FRONT_Z] as const,
    xSign: 1 as const,
    zSign: -1 as const,
    materialStyle: "roomA" as const,
  },
  {
    id: "a-b-room-b-right",
    position: [roomAConnection.center[0] + roomAConnection.openingWidth / 2, ROOM_B_FRONT_Z] as const,
    xSign: -1 as const,
    zSign: -1 as const,
    materialStyle: "roomA" as const,
  },
  {
    id: "b-c-room-b-front",
    position: [-4.65, -13.8] as const,
    xSign: 1 as const,
    zSign: -1 as const,
    materialStyle: "roomA" as const,
  },
  {
    id: "b-c-room-b-back",
    position: [-4.65, -16.8] as const,
    xSign: 1 as const,
    zSign: 1 as const,
    materialStyle: "roomA" as const,
  },
  {
    id: "b-c-room-c-front",
    position: [ROOM_C_RIGHT_X, -13.8] as const,
    xSign: -1 as const,
    zSign: -1 as const,
    materialStyle: "roomC" as const,
  },
  {
    id: "b-c-room-c-back",
    position: [ROOM_C_RIGHT_X, -16.8] as const,
    xSign: -1 as const,
    zSign: 1 as const,
    materialStyle: "roomC" as const,
  },
] as const;

export const roomAArtworkPlacements: ArtworkPlacement[] = [
  {
    id: "artwork-a-01",
    wallId: "back-feature",
    position: [-2.525, 1.96, -4.28],
    rotationY: 0,
    height: 2.65,
    lightPosition: [-2.525, 4.02, -2.15],
  },
  {
    id: "artwork-a-02",
    wallId: "left",
    position: [-5.28, 1.76, 2.05],
    rotationY: Math.PI / 2,
    height: 1.55,
    lightPosition: [-3.25, 3.82, 2.05],
  },
  {
    id: "artwork-a-03",
    wallId: "left",
    position: [-5.28, 1.76, -1.7],
    rotationY: Math.PI / 2,
    height: 1.55,
    lightPosition: [-3.25, 3.82, -1.7],
  },
  {
    id: "artwork-a-04",
    wallId: "right",
    position: [5.28, 1.7, 2.55],
    rotationY: -Math.PI / 2,
    height: 1.3,
    lightPosition: [3.32, 3.68, 2.55],
  },
  {
    id: "artwork-a-05",
    wallId: "right",
    position: [5.28, 1.7, 0],
    rotationY: -Math.PI / 2,
    height: 1.3,
    lightPosition: [3.32, 3.68, 0],
  },
  {
    id: "artwork-a-06",
    wallId: "right",
    position: [5.28, 1.7, -2.55],
    rotationY: -Math.PI / 2,
    height: 1.3,
    lightPosition: [3.32, 3.68, -2.55],
  },
  {
    id: "artwork-a-07",
    wallId: "front",
    position: [2.3, 1.9, 4.28],
    rotationY: Math.PI,
    height: 2.05,
    lightPosition: [2.3, 3.94, 2.2],
  },
  {
    id: "artwork-a-08",
    wallId: "front",
    position: [-2.2, 1.76, 4.28],
    rotationY: Math.PI,
    height: 1.6,
    lightPosition: [-2.2, 3.82, 2.25],
  },
];

// 벽 두께와 관람자 반경을 반영한 실제 보행 가능 영역입니다.
export const roomAWalkablePolygon: [number, number][] = [
  [-4.95, 3.95],
  [4.95, 3.95],
  [4.95, -3.95],
  [2.35, -3.95],
  [2.35, -5.25],
  [0.75, -5.25],
  [0.75, -3.95],
  [-4.95, -3.95],
];

export const roomACollisionBlocks: Array<{
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}> = [];

export const roomBCenter: Vec3 = [1.55, 0, -11.25];

export const roomBConnection = {
  id: "to-room-c",
  roomId: "C",
  center: [-4.65, 1.65, -15.3] as Vec3,
  openingWidth: 3,
  corridorLength: 1.25,
  side: "left" as const,
  status: "connected" as const,
};

export function getRoomIdAt(x: number, z: number): "A" | "B" | "C" {
  if (x < ROOM_C_RIGHT_X && z < ROOM_C_FRONT_Z && z > ROOM_C_BACK_Z) return "C";
  return z < ROOM_B_FRONT_Z ? "B" : "A";
}

// 룸 B는 ROOM A와 연결되고 작품 5 뒤쪽에 ROOM C용 임시 통로를 둔 직사각형 초안입니다.
export const roomBWalls: WallSegment[] = [
  {
    id: "room-b-front-left",
    position: [-2.15, 2.1, -5.7],
    length: 5,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.frontWall,
    interiorSign: -1,
    moldingPositiveExtension: 0,
  },
  {
    id: "room-b-front-right",
    position: [5.25, 2.1, -5.7],
    length: 5,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.frontWall,
    interiorSign: -1,
    moldingNegativeExtension: 0,
  },
  {
    id: "room-b-right",
    position: [7.75, 2.1, -11.25],
    length: ROOM_B_DEPTH,
    rotationY: Math.PI / 2,
    color: GALLERY_SURFACE_COLORS.sideWall,
    interiorSign: -1,
  },
  {
    id: "room-b-back",
    position: [1.55, 2.1, -16.8],
    length: ROOM_B_WIDTH,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.backWall,
    interiorSign: 1,
    moldingNegativeExtension: 0,
  },
  {
    id: "room-b-left",
    position: [-4.65, 2.1, -9.75],
    length: 8.1,
    rotationY: Math.PI / 2,
    color: GALLERY_SURFACE_COLORS.sideWall,
    interiorSign: 1,
    moldingPositiveExtension: 0,
  },
  {
    id: "room-b-c-connector-front",
    position: [-5.275, 2.1, -13.8],
    length: roomBConnection.corridorLength + 0.1,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.frontWall,
    interiorSign: -1,
    kind: "connector",
    moldingNegativeExtension: 0,
    moldingPositiveExtension: 0,
  },
  {
    id: "room-b-c-connector-back",
    position: [-5.275, 2.1, -16.8],
    length: roomBConnection.corridorLength + 0.1,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.backWall,
    interiorSign: 1,
    kind: "connector",
    moldingNegativeExtension: 0,
    moldingPositiveExtension: 0,
  },
  {
    id: "room-b-partition",
    position: [1.55, 2.1, -10.2],
    length: 3.8,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.sideWall,
    interiorSign: 1,
    kind: "partition",
    thickness: 0.32,
    hideMolding: true,
  },
];

export const roomBArtworkPlacements: ArtworkPlacement[] = [
  {
    id: "artwork-b-01",
    wallId: "room-b-back",
    position: [1.55, 1.9, -16.68],
    rotationY: 0,
    height: 2.45,
    lightPosition: [1.55, 4.02, -14.55],
  },
  {
    id: "artwork-b-02",
    wallId: "room-b-back",
    position: [-2.45, 1.68, -16.68],
    rotationY: 0,
    height: 1.35,
    lightPosition: [-2.45, 3.72, -14.6],
  },
  {
    id: "artwork-b-03",
    wallId: "room-b-back",
    position: [5.55, 1.68, -16.68],
    rotationY: 0,
    height: 1.35,
    lightPosition: [5.55, 3.72, -14.6],
  },
  {
    id: "artwork-b-04",
    wallId: "room-b-left",
    position: [-4.53, 1.76, -8.4],
    rotationY: Math.PI / 2,
    height: 1.55,
    lightPosition: [-2.5, 3.82, -8.4],
  },
  {
    id: "artwork-b-05",
    wallId: "room-b-left",
    position: [-4.53, 1.76, -11.8],
    rotationY: Math.PI / 2,
    height: 1.55,
    lightPosition: [-2.5, 3.82, -11.8],
  },
  {
    id: "artwork-b-06",
    wallId: "room-b-right",
    position: [7.63, 1.72, -9.25],
    rotationY: -Math.PI / 2,
    height: 1.8,
    lightPosition: [5.65, 3.76, -9.25],
  },
  {
    id: "artwork-b-07",
    wallId: "room-b-right",
    position: [7.63, 1.72, -13.25],
    rotationY: -Math.PI / 2,
    height: 1.8,
    lightPosition: [5.65, 3.76, -13.25],
  },
  {
    id: "artwork-b-08",
    wallId: "room-b-partition",
    position: [1.55, 1.88, -10],
    rotationY: 0,
    height: 2.05,
    lightPosition: [1.55, 3.94, -8.25],
  },
];

export const roomBWallQuote = {
  wallId: "room-b-front-left",
  lines: ["THE IMAGE LINGERS", "AFTER THE EYES", "HAVE MOVED ON."],
  position: [-2.15, 2.02, -5.784] as Vec3,
  rotationY: Math.PI,
  width: 2.4,
  fontSize: 0.15,
  lineHeight: 1.46,
  letterSpacing: 0.075,
  insetColor: "#637a8c",
  bevelColor: "#b4c0c8",
};

export const roomBWalkablePolygon: [number, number][] = [
  [-4.2, -6.15],
  [0.75, -6.15],
  [0.75, -5.1],
  [2.35, -5.1],
  [2.35, -6.15],
  [7.3, -6.15],
  [7.3, -16.35],
  [-5.45, -16.35],
  [-5.45, -14.25],
  [-4.2, -14.25],
];

export const roomBCollisionBlocks: Array<{
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}> = [
  {
    minX: -0.8,
    maxX: 3.9,
    minZ: -10.73,
    maxZ: -9.67,
  },
];

export const roomCCenter: Vec3 = [-11.3, 0, -15.3];

export const roomCWalls: WallSegment[] = [
  {
    id: "room-c-front",
    position: [roomCCenter[0], ROOM_C_HEIGHT / 2, ROOM_C_FRONT_Z],
    length: ROOM_C_WIDTH,
    rotationY: 0,
    color: ROOM_C_MATERIALS.wall.color,
    interiorSign: -1,
  },
  {
    id: "room-c-back",
    position: [roomCCenter[0], ROOM_C_HEIGHT / 2, ROOM_C_BACK_Z],
    length: ROOM_C_WIDTH,
    rotationY: 0,
    color: ROOM_C_MATERIALS.wall.color,
    interiorSign: 1,
  },
  {
    id: "room-c-left",
    position: [-16.7, ROOM_C_HEIGHT / 2, roomCCenter[2]],
    length: ROOM_C_DEPTH,
    rotationY: Math.PI / 2,
    color: ROOM_C_MATERIALS.wall.color,
    interiorSign: 1,
  },
  {
    id: "room-c-right-front",
    position: [ROOM_C_RIGHT_X, ROOM_C_HEIGHT / 2, -12],
    length: 3.6,
    rotationY: Math.PI / 2,
    color: ROOM_C_MATERIALS.wall.color,
    interiorSign: -1,
    moldingPositiveExtension: 0,
  },
  {
    id: "room-c-right-back",
    position: [ROOM_C_RIGHT_X, ROOM_C_HEIGHT / 2, -18.6],
    length: 3.6,
    rotationY: Math.PI / 2,
    color: ROOM_C_MATERIALS.wall.color,
    interiorSign: -1,
    moldingNegativeExtension: 0,
  },
];

export const roomCArtworkPlacements: ArtworkPlacement[] = [
  {
    id: "artwork-c-01",
    wallId: "room-c-left",
    position: [-16.58, 1.95, -15.3],
    rotationY: Math.PI / 2,
    height: 2.65,
    lightPosition: [-14.55, 4.62, -15.3],
  },
  {
    id: "artwork-c-02",
    wallId: "room-c-back",
    position: [-13.4, 1.78, -20.28],
    rotationY: 0,
    height: 1.8,
    lightPosition: [-13.4, 4.42, -18.25],
  },
  {
    id: "artwork-c-03",
    wallId: "room-c-back",
    position: [-9.2, 1.78, -20.28],
    rotationY: 0,
    height: 1.8,
    lightPosition: [-9.2, 4.42, -18.25],
  },
  {
    id: "artwork-c-04",
    wallId: "room-c-right-back",
    position: [-6.02, 1.7, -18.6],
    rotationY: -Math.PI / 2,
    height: 1.35,
    lightPosition: [-8, 4.32, -18.6],
  },
  {
    id: "artwork-c-05",
    wallId: "room-c-front",
    position: [-14.4, 1.75, -10.32],
    rotationY: Math.PI,
    height: 1.5,
    lightPosition: [-14.4, 4.42, -12.2],
  },
  {
    id: "artwork-c-08",
    wallId: "room-c-front",
    position: [-11.3, 1.75, -10.32],
    rotationY: Math.PI,
    height: 1.5,
    lightPosition: [-11.3, 4.42, -12.2],
  },
  {
    id: "artwork-c-06",
    wallId: "room-c-front",
    position: [-8.2, 1.75, -10.32],
    rotationY: Math.PI,
    height: 1.5,
    lightPosition: [-8.2, 4.42, -12.2],
  },
  {
    id: "artwork-c-07",
    wallId: "room-c-right-front",
    position: [-6.02, 1.7, -12],
    rotationY: -Math.PI / 2,
    height: 1.35,
    lightPosition: [-8, 4.32, -12],
  },
];

export const roomCWalkablePolygon: [number, number][] = [
  [-16.25, -10.65],
  [-6.35, -10.65],
  [-6.35, -14.25],
  [-5, -14.25],
  [-5, -16.35],
  [-6.35, -16.35],
  [-6.35, -19.95],
  [-16.25, -19.95],
];

export const roomCCollisionBlocks: Array<{
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}> = [];

export const galleryWalkablePolygons = [
  roomAWalkablePolygon,
  roomBWalkablePolygon,
  roomCWalkablePolygon,
];
export const galleryCollisionBlocks = [
  ...roomACollisionBlocks,
  ...roomBCollisionBlocks,
  ...roomCCollisionBlocks,
];
