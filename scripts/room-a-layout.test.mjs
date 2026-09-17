import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sharp from "sharp";
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

test("Room A molding stops flush around the corridor opening", () => {
  const walls = new Map(layout.roomAWalls.map((wall) => [wall.id, wall]));
  const depth = layout.MOLDING_LAYERS.at(-1).depth;

  const feature = walls.get("back-feature");
  const backReturn = walls.get("back-return");
  const connectorLeft = walls.get("connector-left");
  const connectorRight = walls.get("connector-right");
  assert.ok(feature && backReturn && connectorLeft && connectorRight);

  assert.equal(layout.getMoldingTransform(feature, depth).positiveEdge, feature.length / 2);
  assert.equal(layout.getMoldingTransform(backReturn, depth).negativeEdge, -backReturn.length / 2);

  for (const connector of [connectorLeft, connectorRight]) {
    const transform = layout.getMoldingTransform(connector, depth);
    assert.equal(transform.negativeEdge, -connector.length / 2);
    assert.equal(transform.positiveEdge, connector.length / 2);
  }
});

test("Room A molding has continuous corner joints at both corridor returns", () => {
  const [left, right] = layout.galleryMoldingCorners.filter(
    (corner) => corner.id.startsWith("a-b-room-a"),
  );

  assert.equal(left.id, "a-b-room-a-left");
  assert.ok(Math.abs(left.position[0] - 0.35) < 1e-9);
  assert.equal(left.position[1], -4.4);
  assert.equal(left.xSign, 1);

  assert.equal(right.id, "a-b-room-a-right");
  assert.ok(Math.abs(right.position[0] - 2.75) < 1e-9);
  assert.equal(right.position[1], -4.4);
  assert.equal(right.xSign, -1);
});

test("gallery molding uses a restrained projection from the wall face", () => {
  assert.deepEqual(layout.MOLDING_LAYERS.map((layer) => layer.depth), [0.08, 0.055, 0.09]);
  assert.ok(
    layout.MOLDING_LAYERS.every((layer) => layer.depth - 0.012 <= 0.08),
    "molding must project no more than 8cm beyond the wall face",
  );
});

test("Room A portal trim frames one corridor face without narrowing the opening", () => {
  assert.equal(
    typeof layout.getRoomAPortalTrimPieces,
    "function",
    "Room A must expose portal trim geometry",
  );

  const pieces = layout.getRoomAPortalTrimPieces();
  assert.deepEqual(pieces, [
    {
      id: "left",
      position: [0.28, 1.76, -4.288],
      size: [0.14, 3.52, 0.045],
    },
    {
      id: "right",
      position: [2.82, 1.76, -4.288],
      size: [0.14, 3.52, 0.045],
    },
    {
      id: "top",
      position: [1.55, 3.59, -4.288],
      size: [2.68, 0.14, 0.045],
    },
  ]);

  const innerLeft = pieces[0].position[0] + pieces[0].size[0] / 2;
  const innerRight = pieces[1].position[0] - pieces[1].size[0] / 2;
  assert.ok(Math.abs(innerLeft - 0.35) < 1e-9);
  assert.ok(Math.abs(innerRight - 2.75) < 1e-9);
});

test("Room A uses the approved midnight navy material palette", () => {
  assert.deepEqual(layout.ROOM_A_MATERIALS, {
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
    frame: { color: "#3a281e", activeColor: "#503524", roughness: 0.68, metalness: 0.02 },
    frameTrim: { color: "#745035", roughness: 0.58, metalness: 0.08 },
  });

  assert.ok(layout.roomAWalls.every((wall) =>
    [layout.ROOM_A_MATERIALS.mainWall.color, layout.ROOM_A_MATERIALS.secondaryWall.color]
      .includes(wall.color),
  ));
});

test("Room A lighting keeps navy surfaces readable with broad artwork pools", () => {
  assert.deepEqual(layout.ROOM_A_LIGHTING, {
    hemisphere: { skyColor: "#b7cde0", groundColor: "#2b4055", intensity: 1.35 },
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
  });
});

test("Room A uses a restrained three-step baseboard profile", () => {
  assert.deepEqual(layout.ROOM_A_MOLDING_PROFILE, [
    { y: 0.025, height: 0.05 },
    { y: 0.0825, height: 0.065 },
    { y: 0.1325, height: 0.035 },
  ]);
});

test("Room A uses a subtle eggshell wall finish and a dedicated slate floor texture", () => {
  assert.deepEqual(layout.ROOM_A_TEXTURES, {
    wall: "/materials/room-a-smooth-wall.webp",
    floor: "/materials/room-a-slate-floor.webp",
    wallRepeatMeters: 6,
    floorRepeatMeters: 3,
  });
});

test("Room A texture assets stay lightweight enough for mobile WebGL", async () => {
  for (const relativePath of [
    "../public/materials/room-a-smooth-wall.webp",
    "../public/materials/room-a-slate-floor.webp",
  ]) {
    const assetPath = fileURLToPath(new URL(relativePath, import.meta.url));
    const { width, height } = await sharp(assetPath).metadata();

    assert.ok(width && width <= 512, `${relativePath} width must not exceed 512px`);
    assert.ok(height && height <= 512, `${relativePath} height must not exceed 512px`);
  }
});

test("Room A wall texture stays bright and nearly uniform so it cannot read as paper", async () => {
  const assetPath = fileURLToPath(new URL(
    "../public/materials/room-a-smooth-wall.webp",
    import.meta.url,
  ));
  const { channels } = await sharp(assetPath).stats();
  const colorChannels = channels.slice(0, 3);
  const averageLuminance = colorChannels.reduce((sum, { mean }) => sum + mean, 0) / 3;
  const highestColorDeviation = Math.max(...colorChannels.map(({ stdev }) => stdev));

  assert.ok(averageLuminance >= 215, "wall map must preserve the configured navy color");
  assert.ok(
    highestColorDeviation >= 4 && highestColorDeviation <= 6,
    "wall map must show a restrained finish without paper-like grain",
  );
});

test("Room A slate floor keeps mineral variation restrained", async () => {
  const assetPath = fileURLToPath(new URL(
    "../public/materials/room-a-slate-floor.webp",
    import.meta.url,
  ));
  const { channels } = await sharp(assetPath).stats();
  const highestColorDeviation = Math.max(...channels.slice(0, 3).map(({ stdev }) => stdev));
  const averageLuminance = channels.slice(0, 3).reduce((sum, { mean }) => sum + mean, 0) / 3;

  assert.ok(
    highestColorDeviation <= 5,
    `floor color deviation ${highestColorDeviation.toFixed(2)} must stay at or below 5`,
  );
  assert.ok(
    averageLuminance >= 91.5 && averageLuminance <= 93.5,
    `floor average luminance ${averageLuminance.toFixed(2)} must stay between 91.5 and 93.5`,
  );
});
