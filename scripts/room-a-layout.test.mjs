import assert from "node:assert/strict";
import test from "node:test";
import * as layout from "../src/galleryLayout.ts";

test("Room A reserves a Room B connector without the old protruding step", () => {
  assert.equal(
    layout.roomAWalls.some((wall) => wall.id.includes("step")),
    false,
    "the right-side protruding step should be removed",
  );
  assert.equal(
    typeof layout.roomAConnection,
    "object",
    "roomAConnection must be defined",
  );
  assert.ok(
    layout.roomAConnection.openingWidth >= 2.4,
    "the future Room B opening should be at least 2.4m wide",
  );
});

test("Room A wall lengths suit their artwork counts", () => {
  const wallsById = new Map(layout.roomAWalls.map((wall) => [wall.id, wall]));
  const placementsByWall = Map.groupBy(
    layout.roomAArtworkPlacements,
    (placement) => placement.wallId,
  );

  const heroWall = wallsById.get("back-feature");
  assert.ok(heroWall, "a dedicated back-feature wall must exist");
  assert.equal(
    placementsByWall.get("back-feature")?.length,
    1,
    "the feature wall should carry one hero artwork",
  );
  assert.ok(
    heroWall.length <= 5.8,
    "the one-artwork feature wall should not have excessive empty width",
  );

  const triptychWall = wallsById.get("right");
  assert.ok(triptychWall, "the continuous right wall must exist");
  assert.equal(
    placementsByWall.get("right")?.length,
    3,
    "the right wall should carry three artworks",
  );
  assert.ok(
    triptychWall.length >= 8.5,
    "three artworks need the full-length right wall",
  );
});

test("base molding visibly projects into the room", () => {
  assert.ok(Array.isArray(layout.MOLDING_LAYERS), "molding layers must be shared");
  assert.equal(
    typeof layout.getMoldingCenterOffset,
    "function",
    "molding offset helper must exist",
  );

  for (const layer of layout.MOLDING_LAYERS) {
    const centerOffset = layout.getMoldingCenterOffset(layer.depth);
    const visibleEdge = centerOffset + layer.depth / 2;

    assert.ok(
      visibleEdge > layout.WALL_THICKNESS / 2,
      `molding layer ${layer.depth} must extend past the wall face`,
    );
  }
});
