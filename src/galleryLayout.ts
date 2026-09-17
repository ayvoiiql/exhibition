export type Vec3 = [number, number, number];

export interface WallSegment {
  id: string;
  position: Vec3;
  length: number;
  rotationY: number;
  color: string;
  interiorSign: 1 | -1;
  kind?: "gallery" | "connector" | "partition";
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
  frontWall: "#4b6679",
  sideWall: "#536d81",
  backWall: "#5e788d",
  floor: "#454a4d",
  corridorFloor: "#3f484c",
} as const;
export const ROOM_A_MATERIALS = {
  mainWall: {
    color: "#34516d",
    roughness: 0.74,
    metalness: 0,
    clearcoat: 0.04,
    clearcoatRoughness: 0.82,
  },
  secondaryWall: {
    color: "#3e5e7a",
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
export const ROOM_A_LIGHTING = {
  hemisphere: {
    skyColor: "#b7cde0",
    groundColor: "#2b4055",
    intensity: 1.35,
  },
  directional: { color: "#c7d9e6", intensity: 0.62 },
  spotlight: {
    color: "#fff0d2",
    heroIntensity: 29,
    standardIntensity: 24,
    distance: 6.4,
    heroAngle: 0.62,
    standardAngle: 0.57,
    penumbra: 0.94,
    decay: 1.25,
  },
} as const;
export const ROOM_A_PORTAL_TRIM_MATERIAL = {
  color: "#091522",
  roughness: 0.76,
  metalness: 0.02,
} as const;

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

export function getRoomAPortalTrimPieces() {
  const trimWidth = 0.14;
  const trimDepth = 0.045;
  const openingHeight = 3.52;
  const wallFaceZ = -4.288;
  const openingLeft = roomAConnection.center[0] - roomAConnection.openingWidth / 2;
  const openingRight = roomAConnection.center[0] + roomAConnection.openingWidth / 2;
  const round = (value: number) => Number(value.toFixed(3));

  return [
    {
      id: "left",
      position: [round(openingLeft - trimWidth / 2), openingHeight / 2, wallFaceZ] as Vec3,
      size: [trimWidth, openingHeight, trimDepth] as Vec3,
    },
    {
      id: "right",
      position: [round(openingRight + trimWidth / 2), openingHeight / 2, wallFaceZ] as Vec3,
      size: [trimWidth, openingHeight, trimDepth] as Vec3,
    },
    {
      id: "top",
      position: [roomAConnection.center[0], openingHeight + trimWidth / 2, wallFaceZ] as Vec3,
      size: [round(roomAConnection.openingWidth + trimWidth * 2), trimWidth, trimDepth] as Vec3,
    },
  ];
}

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
    materialStyle: "default" as const,
  },
  {
    id: "a-b-room-b-right",
    position: [roomAConnection.center[0] + roomAConnection.openingWidth / 2, ROOM_B_FRONT_Z] as const,
    xSign: -1 as const,
    zSign: -1 as const,
    materialStyle: "default" as const,
  },
  {
    id: "b-c-room-b-front",
    position: [-4.65, -13.8] as const,
    xSign: 1 as const,
    zSign: -1 as const,
    materialStyle: "default" as const,
  },
  {
    id: "b-c-room-b-back",
    position: [-4.65, -16.8] as const,
    xSign: 1 as const,
    zSign: 1 as const,
    materialStyle: "default" as const,
  },
  {
    id: "b-c-room-c-front",
    position: [ROOM_C_RIGHT_X, -13.8] as const,
    xSign: -1 as const,
    zSign: -1 as const,
    materialStyle: "default" as const,
  },
  {
    id: "b-c-room-c-back",
    position: [ROOM_C_RIGHT_X, -16.8] as const,
    xSign: -1 as const,
    zSign: 1 as const,
    materialStyle: "default" as const,
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
    position: [1.55, 2.1, -9],
    length: 3.8,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.sideWall,
    interiorSign: 1,
    kind: "partition",
    moldingBothSides: true,
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
    position: [1.55, 1.88, -8.88],
    rotationY: 0,
    height: 2.05,
    lightPosition: [1.55, 3.94, -7.05],
  },
];

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
    minZ: -9.53,
    maxZ: -8.47,
  },
];

export const roomCCenter: Vec3 = [-11.3, 0, -15.3];

export const roomCWalls: WallSegment[] = [
  {
    id: "room-c-front",
    position: [roomCCenter[0], 2.1, ROOM_C_FRONT_Z],
    length: ROOM_C_WIDTH,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.frontWall,
    interiorSign: -1,
  },
  {
    id: "room-c-back",
    position: [roomCCenter[0], 2.1, ROOM_C_BACK_Z],
    length: ROOM_C_WIDTH,
    rotationY: 0,
    color: GALLERY_SURFACE_COLORS.backWall,
    interiorSign: 1,
  },
  {
    id: "room-c-left",
    position: [-16.7, 2.1, roomCCenter[2]],
    length: ROOM_C_DEPTH,
    rotationY: Math.PI / 2,
    color: GALLERY_SURFACE_COLORS.sideWall,
    interiorSign: 1,
  },
  {
    id: "room-c-right-front",
    position: [ROOM_C_RIGHT_X, 2.1, -12],
    length: 3.6,
    rotationY: Math.PI / 2,
    color: GALLERY_SURFACE_COLORS.sideWall,
    interiorSign: -1,
    moldingPositiveExtension: 0,
  },
  {
    id: "room-c-right-back",
    position: [ROOM_C_RIGHT_X, 2.1, -18.6],
    length: 3.6,
    rotationY: Math.PI / 2,
    color: GALLERY_SURFACE_COLORS.sideWall,
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
    lightPosition: [-14.55, 4.02, -15.3],
  },
  {
    id: "artwork-c-02",
    wallId: "room-c-back",
    position: [-13.4, 1.78, -20.28],
    rotationY: 0,
    height: 1.8,
    lightPosition: [-13.4, 3.82, -18.25],
  },
  {
    id: "artwork-c-03",
    wallId: "room-c-back",
    position: [-9.2, 1.78, -20.28],
    rotationY: 0,
    height: 1.8,
    lightPosition: [-9.2, 3.82, -18.25],
  },
  {
    id: "artwork-c-04",
    wallId: "room-c-right-back",
    position: [-6.02, 1.7, -18.6],
    rotationY: -Math.PI / 2,
    height: 1.35,
    lightPosition: [-8, 3.72, -18.6],
  },
  {
    id: "artwork-c-05",
    wallId: "room-c-front",
    position: [-14.4, 1.75, -10.32],
    rotationY: Math.PI,
    height: 1.5,
    lightPosition: [-14.4, 3.82, -12.2],
  },
  {
    id: "artwork-c-08",
    wallId: "room-c-front",
    position: [-11.3, 1.75, -10.32],
    rotationY: Math.PI,
    height: 1.5,
    lightPosition: [-11.3, 3.82, -12.2],
  },
  {
    id: "artwork-c-06",
    wallId: "room-c-front",
    position: [-8.2, 1.75, -10.32],
    rotationY: Math.PI,
    height: 1.5,
    lightPosition: [-8.2, 3.82, -12.2],
  },
  {
    id: "artwork-c-07",
    wallId: "room-c-right-front",
    position: [-6.02, 1.7, -12],
    rotationY: -Math.PI / 2,
    height: 1.35,
    lightPosition: [-8, 3.72, -12],
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
