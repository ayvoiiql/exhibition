import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import sharp from "sharp";
import * as layout from "../src/galleryLayout.ts";

const FRAME_EXTRA_WIDTH = 0.34;

async function framedArtworkSpan(placement) {
  const imageNumber = placement.id.slice(-2);
  const metadata = await sharp(
    path.resolve(`public/artworks/artwork-b-${imageNumber}.webp`),
  ).metadata();
  return placement.height * (metadata.width / metadata.height) + FRAME_EXTRA_WIDTH;
}

async function wallClearances(wallId, axis) {
  const wall = layout.roomBWalls.find((candidate) => candidate.id === wallId);
  assert.ok(wall);

  const placements = layout.roomBArtworkPlacements
    .filter((placement) => placement.wallId === wallId)
    .sort((left, right) => left.position[axis] - right.position[axis]);
  const spans = await Promise.all(placements.map(framedArtworkSpan));
  const wallMin = wall.position[axis] - wall.length / 2;
  const wallMax = wall.position[axis] + wall.length / 2;
  const gaps = placements.slice(1).map((placement, index) => {
    const previous = placements[index];
    return (
      placement.position[axis] - spans[index + 1] / 2 -
      (previous.position[axis] + spans[index] / 2)
    );
  });

  return {
    start: placements[0].position[axis] - spans[0] / 2 - wallMin,
    gaps,
    end: wallMax - (placements.at(-1).position[axis] + spans.at(-1) / 2),
  };
}

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

test("Room A connector opens into Room B and supports a return route", () => {
  assert.equal(layout.roomAConnection.status, "connected");
  assert.equal(layout.roomAWalls.some((wall) => wall.id === "connector-end"), false);
  assert.ok(pointInPolygon(1.55, -5.2, layout.roomAWalkablePolygon));
  assert.ok(pointInPolygon(1.55, -5.2, layout.roomBWalkablePolygon));
});

test("Room B uses a similar scale and exactly eight artwork placements", () => {
  assert.deepEqual(layout.roomBCenter, [1.55, 0, -11.25]);
  assert.equal(layout.ROOM_B_DEPTH, 11.1);
  assert.equal(layout.roomBArtworkPlacements.length, 8);
  assert.equal(new Set(layout.roomBArtworkPlacements.map((placement) => placement.id)).size, 8);
});

test("Room B keeps the back-wall trio clear of each other and both corners", async () => {
  const clearances = await wallClearances("room-b-back", 0);
  assert.ok(clearances.start >= 1.1, "left corner clearance must be at least 1.1m");
  assert.ok(clearances.end >= 1.1, "right corner clearance must be at least 1.1m");
  assert.ok(
    clearances.gaps.every((gap) => gap >= 1.1),
    "back-wall artwork gaps must be at least 1.1m",
  );
});

test("Room B keeps side-wall pairs clear while reserving space behind artwork 5", async () => {
  const leftClearances = await wallClearances("room-b-left", 2);
  assert.ok(leftClearances.start >= 0.75, "artwork 5 needs clearance from the C opening");
  assert.ok(leftClearances.end >= 1.45, "artwork 4 needs front corner clearance");
  assert.ok(leftClearances.gaps[0] >= 0.95, "left-wall artworks need breathing room");

  const rightClearances = await wallClearances("room-b-right", 2);
  assert.ok(rightClearances.start >= 1.9, "right pair needs rear clearance");
  assert.ok(rightClearances.end >= 1.9, "right pair needs front clearance");
  assert.ok(rightClearances.gaps[0] >= 1.35, "right-wall artworks need a wider gap");
  assert.ok(
    Math.abs(rightClearances.start - rightClearances.end) <= 0.12,
    "right-wall pair must remain visually centered",
  );
  const rightPlacements = layout.roomBArtworkPlacements.filter(
    (placement) => placement.wallId === "room-b-right",
  );
  assert.ok(
    rightPlacements.every((placement) => placement.height >= 1.8),
    "right-wall artworks must be large enough for the long wall",
  );
});

test("Room B moves its Room C corridor behind artwork 5 and removes the old front opening", () => {
  const connection = layout.roomBConnection;
  assert.ok(connection, "Room B must expose a Room C connection");
  assert.equal(connection.status, "connected");
  assert.equal(connection.side, "left");
  assert.equal(connection.openingWidth, 3);

  const frontRight = layout.roomBWalls.find((wall) => wall.id === "room-b-front-right");
  assert.ok(frontRight);
  assert.equal(frontRight.position[0] - frontRight.length / 2, 2.75);
  assert.equal(frontRight.position[0] + frontRight.length / 2, 7.75);
  assert.equal(
    layout.roomBWalls.some((wall) => wall.id === "room-b-c-connector-right"),
    false,
  );
  assert.equal(
    layout.roomBWalls.some((wall) => wall.id === "room-b-c-connector-end"),
    false,
  );
  assert.ok(pointInPolygon(-5.1, -15.3, layout.roomBWalkablePolygon));
  assert.equal(pointInPolygon(-6, -15.3, layout.roomBWalkablePolygon), false);

  assert.deepEqual(
    layout.roomBArtworkPlacements.map((placement) => placement.position),
    [
      [1.55, 1.9, -16.68],
      [-2.45, 1.68, -16.68],
      [5.55, 1.68, -16.68],
      [-4.53, 1.76, -8.4],
      [-4.53, 1.76, -11.8],
      [7.63, 1.72, -9.25],
      [7.63, 1.72, -13.25],
      [1.55, 1.88, -8.88],
    ],
  );
});

test("Room B remains the active room inside its reserved Room C corridor", () => {
  assert.equal(layout.getRoomIdAt(-5.1, -15.3), "B");
  assert.equal(layout.getRoomIdAt(0, 0), "A");
});

test("Room B partition creates a gentle reveal with safe passages", () => {
  const partition = layout.roomBWalls.find((wall) => wall.id === "room-b-partition");
  const partitionWork = layout.roomBArtworkPlacements.find(
    (placement) => placement.wallId === "room-b-partition",
  );

  assert.ok(partition);
  assert.equal(partition.kind, "partition");
  assert.ok(partition.length <= 3.8);
  assert.equal(partition.moldingBothSides, true);
  assert.equal(partitionWork?.id, "artwork-b-08");
  assert.equal(partitionWork?.position[0], 1.55);

  const collision = layout.roomBCollisionBlocks[0];
  assert.ok(collision.minX - -3.4 >= 2.59, "left passage must remain about 2.6m wide");
  assert.ok(6.5 - collision.maxX >= 2.59, "right passage must remain about 2.6m wide");
});
