export type Vec3 = [number, number, number];

export interface WallSegment {
  id: string;
  position: Vec3;
  length: number;
  rotationY: number;
  color: string;
  interiorSign: 1 | -1;
  kind?: "gallery" | "connector";
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
export const MOLDING_LAYERS = [
  { y: 0.035, height: 0.07, depth: 0.16, color: "#263945" },
  { y: 0.12, height: 0.1, depth: 0.12, color: "#40596a" },
  { y: 0.205, height: 0.07, depth: 0.19, color: "#718999" },
] as const;

export function getMoldingCenterOffset(depth: number) {
  return WALL_THICKNESS / 2 + depth / 2 - 0.012;
}

export const roomAConnection = {
  id: "to-room-b",
  roomId: "B",
  center: [1.55, 1.65, -4.4] as Vec3,
  openingWidth: 2.4,
  corridorLength: 1.3,
  status: "reserved" as const,
};

// 룸 A는 한 작품용 피처 벽과 다음 방으로 이어질 개구부만 변주한 절제된 직사각형 평면입니다.
export const roomAWalls: WallSegment[] = [
  {
    id: "front",
    position: [0, 2.1, 4.4],
    length: 10.8,
    rotationY: 0,
    color: "#3c5060",
    interiorSign: -1,
  },
  {
    id: "right",
    position: [5.4, 2.1, 0],
    length: 8.8,
    rotationY: Math.PI / 2,
    color: "#425767",
    interiorSign: -1,
  },
  {
    id: "back-feature",
    position: [-2.525, 2.1, -4.4],
    length: 5.75,
    rotationY: 0,
    color: "#4b5f70",
    interiorSign: 1,
  },
  {
    id: "back-return",
    position: [4.075, 2.1, -4.4],
    length: 2.65,
    rotationY: 0,
    color: "#4b5f70",
    interiorSign: 1,
  },
  {
    id: "left",
    position: [-5.4, 2.1, 0],
    length: 8.8,
    rotationY: Math.PI / 2,
    color: "#425767",
    interiorSign: 1,
  },
  {
    id: "connector-left",
    position: [0.35, 2.1, -5.05],
    length: 1.3,
    rotationY: Math.PI / 2,
    color: "#3c5060",
    interiorSign: 1,
    kind: "connector",
  },
  {
    id: "connector-right",
    position: [2.75, 2.1, -5.05],
    length: 1.3,
    rotationY: Math.PI / 2,
    color: "#3c5060",
    interiorSign: -1,
    kind: "connector",
  },
  {
    id: "connector-end",
    position: [1.55, 2.1, -5.7],
    length: 2.4,
    rotationY: 0,
    color: "#263945",
    interiorSign: 1,
    kind: "connector",
  },
];

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
