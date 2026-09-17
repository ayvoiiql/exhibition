import assert from "node:assert/strict";
import test from "node:test";
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
