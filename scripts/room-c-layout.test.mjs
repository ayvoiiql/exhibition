import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import * as layout from "../src/galleryLayout.ts";

function pointInPolygon(x, z, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [xi, zi] = polygon[index];
    const [xj, zj] = polygon[previous];
    const crosses = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

test("Room B corridor opens into Room C and supports a return route", () => {
  assert.equal(layout.roomBConnection.status, "connected");
  assert.equal(
    layout.roomBWalls.some((wall) => wall.id === "room-b-c-connector-end"),
    false,
  );
  assert.ok(pointInPolygon(-5.2, -15.3, layout.roomBWalkablePolygon));
  assert.ok(pointInPolygon(-5.2, -15.3, layout.roomCWalkablePolygon));
});

test("Room C is a closed final room with exactly eight artworks", () => {
  assert.deepEqual(layout.roomCCenter, [-11.3, 0, -15.3]);
  assert.equal(layout.ROOM_C_DEPTH, 10.2);
  assert.equal(layout.roomCArtworkPlacements.length, 8);
  assert.equal(new Set(layout.roomCArtworkPlacements.map((placement) => placement.id)).size, 8);
  assert.equal(layout.roomCWalls.some((wall) => wall.kind === "connector"), false);
});

test("Room C uses isolated approved oak and clean mineral materials", async () => {
  assert.deepEqual(layout.ROOM_C_MATERIALS, {
    wall: {
      color: "#ffffff",
      roughness: 1,
      metalness: 0,
    },
    floor: { color: "#ffffff", roughness: 0.81, metalness: 0 },
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
    track: { color: "#202326", roughness: 0.58, metalness: 0.34 },
    spotlightHousing: { color: "#202326", roughness: 0.5, metalness: 0.32 },
  });
  assert.deepEqual(layout.ROOM_C_TEXTURES, {
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
  });
  assert.deepEqual(layout.ROOM_C_BASEBOARD_PROFILE, [
    { y: 0.035, height: 0.07, depth: 0.03 },
  ]);
  assert.equal(layout.ROOM_C_HEIGHT, 4.8);
  assert.equal(layout.ROOM_C_CEILING_Y, 4.88);
  assert.ok(Math.abs(layout.ROOM_C_TRACK_Y - 4.73) < 0.00001);
  assert.ok(Math.abs(layout.ROOM_C_LIGHT_MOUNT_Y - 4.72) < 0.00001);
  assert.deepEqual(layout.ROOM_C_LIGHTING.spotlight, {
    color: "#f6ead8",
    heroIntensity: 7.4,
    standardIntensity: 6.3,
    distance: 7.5,
    heroAngle: 1.38,
    standardAngle: 1.32,
    penumbra: 1,
    decay: 1.2,
  });
  assert.ok(layout.roomCWalls.every((wall) => wall.color === layout.ROOM_C_MATERIALS.wall.color));
  assert.ok(layout.roomCWalls.every((wall) => wall.position[1] === layout.ROOM_C_HEIGHT / 2));
  assert.notDeepEqual(layout.ROOM_C_MATERIALS.wall, layout.ROOM_A_MATERIALS.mainWall);
  assert.notDeepEqual(layout.ROOM_C_MATERIALS.floor, layout.ROOM_B_MATERIALS.floor);

  const materialPaths = Object.values(layout.ROOM_C_TEXTURES)
    .filter((value) => typeof value === "string")
    .map((value) => path.resolve(`public${value}`));
  for (const materialPath of materialPaths) {
    const [metadata, file] = await Promise.all([sharp(materialPath).metadata(), stat(materialPath)]);
    assert.deepEqual([metadata.width, metadata.height], [1024, 1024]);
    assert.ok(file.size <= 700_000);
  }

  const [floorAlbedoStats, floorNormalStats, floorRoughnessStats, wallAlbedoStats, wallNormalStats,
    wallRoughnessStats] = await Promise.all([
    sharp(path.resolve(`public${layout.ROOM_C_TEXTURES.floorAlbedo}`)).stats(),
    sharp(path.resolve(`public${layout.ROOM_C_TEXTURES.floorNormal}`)).stats(),
    sharp(path.resolve(`public${layout.ROOM_C_TEXTURES.floorRoughness}`)).stats(),
    sharp(path.resolve(`public${layout.ROOM_C_TEXTURES.wallAlbedo}`)).stats(),
    sharp(path.resolve(`public${layout.ROOM_C_TEXTURES.wallNormal}`)).stats(),
    sharp(path.resolve(`public${layout.ROOM_C_TEXTURES.wallRoughness}`)).stats(),
  ]);
  const floorAlbedoMeans = floorAlbedoStats.channels.slice(0, 3).map(({ mean }) => mean);
  const floorNormalMeans = floorNormalStats.channels.slice(0, 3).map(({ mean }) => mean);
  const wallAlbedoMeans = wallAlbedoStats.channels.slice(0, 3).map(({ mean }) => mean);
  const wallNormalMeans = wallNormalStats.channels.slice(0, 3).map(({ mean }) => mean);
  assert.ok(floorAlbedoMeans[0] > floorAlbedoMeans[1] && floorAlbedoMeans[1] > floorAlbedoMeans[2]);
  assert.ok(floorAlbedoMeans[0] - floorAlbedoMeans[2] <= 62);
  assert.ok(Math.abs(floorNormalMeans[0] - 127.5) <= 2);
  assert.ok(Math.abs(floorNormalMeans[1] - 127.5) <= 2);
  assert.ok(floorNormalMeans[2] >= 250);
  assert.ok(floorRoughnessStats.channels[0].mean / 255 >= 0.7);
  assert.ok(floorRoughnessStats.channels[0].mean / 255 <= 0.74);
  const effectiveFloorRoughness = layout.ROOM_C_MATERIALS.floor.roughness
    * floorRoughnessStats.channels[0].mean / 255;
  assert.ok(effectiveFloorRoughness >= 0.55);
  assert.ok(effectiveFloorRoughness <= 0.6);
  assert.ok(wallAlbedoMeans[0] > wallAlbedoMeans[1] && wallAlbedoMeans[1] > wallAlbedoMeans[2]);
  assert.ok(wallAlbedoMeans[0] - wallAlbedoMeans[2] <= 30);
  assert.ok(Math.abs(wallNormalMeans[0] - 127.5) <= 2.5);
  assert.ok(Math.abs(wallNormalMeans[1] - 127.5) <= 2.5);
  assert.ok(wallNormalMeans[2] >= 250);
  assert.ok(Math.abs(wallRoughnessStats.channels[0].mean / 255 - 0.898) <= 0.01);

  const sceneSource = await readFile("src/components/GalleryScene.tsx", "utf8");
  assert.equal(sceneSource.includes("room-c-floor-x"), false);
  assert.equal(sceneSource.includes("room-c-floor-z"), false);
  assert.equal(sceneSource.includes("RoomCSlattedCeiling"), false);
  assert.match(sceneSource, /roughnessMap=\{floorRoughness\}/);
  assert.match(sceneSource, /wallRoughnessTexture=\{wallRoughness\}/);
  assert.match(sceneSource, /useRoomCLighting/);
});

test("Room C gives artworks 7 and 4 equally wide wall sections", () => {
  const frontWall = layout.roomCWalls.find((wall) => wall.id === "room-c-right-front");
  const backWall = layout.roomCWalls.find((wall) => wall.id === "room-c-right-back");
  assert.ok(frontWall);
  assert.ok(backWall);
  assert.equal(frontWall.length, backWall.length);
  assert.ok(frontWall.length >= 3.6);
});

test("Room C uses the requested front, back, and right-wall artwork order", () => {
  const frontIds = layout.roomCArtworkPlacements
    .filter((placement) => placement.wallId === "room-c-front")
    .sort((left, right) => left.position[0] - right.position[0])
    .map((placement) => placement.id);
  const backWorks = layout.roomCArtworkPlacements
    .filter((placement) => placement.wallId === "room-c-back")
    .sort((left, right) => left.position[0] - right.position[0]);
  assert.deepEqual(frontIds, ["artwork-c-05", "artwork-c-08", "artwork-c-06"]);
  assert.deepEqual(backWorks.map((placement) => placement.id), ["artwork-c-02", "artwork-c-03"]);
  assert.ok(backWorks.every((placement) => placement.height >= 1.8));
  assert.equal(
    layout.roomCArtworkPlacements.find((placement) => placement.id === "artwork-c-04")?.wallId,
    "room-c-right-back",
  );
  assert.equal(
    layout.roomCArtworkPlacements.find((placement) => placement.id === "artwork-c-07")?.wallId,
    "room-c-right-front",
  );
});

test("all A-B and B-C corridor returns use explicit continuous corner joints", () => {
  assert.equal(layout.galleryMoldingCorners.length, 8);
  assert.equal(new Set(layout.galleryMoldingCorners.map((corner) => corner.id)).size, 8);

  const ids = new Set(layout.galleryMoldingCorners.map((corner) => corner.id));
  for (const id of [
    "a-b-room-a-left",
    "a-b-room-a-right",
    "a-b-room-b-left",
    "a-b-room-b-right",
    "b-c-room-b-front",
    "b-c-room-b-back",
    "b-c-room-c-front",
    "b-c-room-c-back",
  ]) {
    assert.ok(ids.has(id), `${id} must have a molding corner joint`);
  }
});

test("corridor molding strips stop at wall returns instead of protruding across openings", () => {
  const wallEdges = [
    [layout.roomAWalls, "back-feature", "moldingPositiveExtension"],
    [layout.roomAWalls, "back-return", "moldingNegativeExtension"],
    [layout.roomBWalls, "room-b-front-left", "moldingPositiveExtension"],
    [layout.roomBWalls, "room-b-front-right", "moldingNegativeExtension"],
    [layout.roomBWalls, "room-b-left", "moldingPositiveExtension"],
    [layout.roomBWalls, "room-b-back", "moldingNegativeExtension"],
    [layout.roomCWalls, "room-c-right-front", "moldingPositiveExtension"],
    [layout.roomCWalls, "room-c-right-back", "moldingNegativeExtension"],
  ];

  for (const [walls, wallId, property] of wallEdges) {
    const wall = walls.find((candidate) => candidate.id === wallId);
    assert.ok(wall);
    assert.equal(wall[property], 0, `${wallId} must stop flush at its corridor return`);
  }
});

test("Room B back wall and its C corridor return use one continuous color", () => {
  const backWall = layout.roomBWalls.find((wall) => wall.id === "room-b-back");
  const corridorReturn = layout.roomBWalls.find(
    (wall) => wall.id === "room-b-c-connector-back",
  );
  assert.ok(backWall);
  assert.ok(corridorReturn);
  assert.equal(corridorReturn.color, backWall.color);
});

test("Room C presents one large central artwork opposite its entrance", () => {
  const feature = layout.roomCArtworkPlacements.find(
    (placement) => placement.id === "artwork-c-01",
  );
  assert.ok(feature);
  assert.equal(feature.wallId, "room-c-left");
  assert.equal(feature.position[2], layout.roomCCenter[2]);
  assert.ok(feature.height >= 2.5);
});

test("Room C walkable area matches its walls and prevents leaving the gallery", () => {
  assert.ok(pointInPolygon(-11.3, -15.3, layout.roomCWalkablePolygon));
  assert.equal(pointInPolygon(-17, -15.3, layout.roomCWalkablePolygon), false);
  assert.equal(pointInPolygon(-11.3, -20.7, layout.roomCWalkablePolygon), false);
});

test("Room UI classification changes to C only after crossing its doorway", () => {
  assert.equal(layout.getRoomIdAt(-5.5, -15.3), "B");
  assert.equal(layout.getRoomIdAt(-6.5, -15.3), "C");
  assert.equal(layout.getRoomIdAt(0, -10), "B");
  assert.equal(layout.getRoomIdAt(0, 0), "A");
});
