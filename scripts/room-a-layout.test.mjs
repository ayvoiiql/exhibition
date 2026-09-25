import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sharp from "sharp";
import { BoxGeometry } from "three";
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

test("Room A corridor stays open without a portal trim frame", () => {
  assert.equal(
    layout.getRoomAPortalTrimPieces,
    undefined,
    "Room A must not expose portal trim geometry",
  );
  assert.equal(layout.roomAConnection.openingWidth, 2.4);
});

test("Room A wayfinding stays flush and centered above the Room B passage", () => {
  const sign = layout.roomAWayfindingSign;

  assert.equal(sign.label, "B");
  assert.equal(sign.position[0], layout.roomAConnection.center[0]);
  assert.ok(sign.position[1] > 3.7, "the room name must sit above the passage");
  assert.ok(
    sign.position[2] >= -4.317 && sign.position[2] <= -4.31,
    "the room name must sit within 10mm of the Room A wall face",
  );
  assert.equal(sign.linePosition[0], layout.roomAConnection.center[0]);
  assert.equal(sign.lineWidth, layout.roomAConnection.openingWidth);
  assert.ok(
    sign.linePosition[1] >= 3.52 && sign.linePosition[1] <= 3.54,
    "the light line must hug the lintel's bottom edge",
  );
  assert.ok(sign.lineFaceHeight <= 0.02, "the light line must stay visually thin");
  assert.ok(
    sign.textDepth >= 0.01 && sign.textDepth <= 0.018,
    "the room name must have shallow physical depth without floating from the wall",
  );
  assert.ok(sign.textLayerCount >= 4, "the room name sidewall must read as a solid structure");
  assert.ok(
    sign.textSideOutlineWidth >= 0.003 && sign.textSideOutlineWidth <= 0.006,
    "the room name needs a thin visible metal rim around its luminous face",
  );
  assert.notEqual(sign.frontColor, sign.sideColor, "the luminous face must separate from its metal side");
  assert.ok(
    sign.lineFaceHeight < sign.lineHousingHeight,
    "the luminous line face must sit inside a visible metal housing",
  );
  const wallFaceZ = layout.roomAConnection.center[2] + layout.WALL_THICKNESS / 2;
  const lineBackZ = sign.linePosition[2] - sign.lineHousingDepth / 2;
  assert.ok(
    lineBackZ - wallFaceZ >= 0.006,
    "the light line must clear the wall depth buffer while remaining visually flush",
  );
});

test("wayfinding type scales down for a future longer room name", () => {
  assert.equal(layout.getWayfindingFontSize("B", 1.8, 0.26), 0.26);
  assert.ok(layout.getWayfindingFontSize("ROOM OF MEMORY", 1.8, 0.26) < 0.2);
  assert.equal(
    layout.getWayfindingFontSize("A VERY LONG EXHIBITION ROOM NAME", 1.8, 0.26),
    0.12,
  );
});

test("Room A keeps the former decorative-prop corner free of collision", () => {
  assert.deepEqual(
    layout.roomACollisionBlocks,
    [],
    "removed decorative props must not leave hidden collision blocks",
  );
});

test("Room A uses the approved midnight navy material palette", () => {
  assert.deepEqual(layout.ROOM_A_MATERIALS, {
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
    frame: { color: "#3a281e", activeColor: "#503524", roughness: 0.68, metalness: 0.02 },
    frameTrim: { color: "#745035", roughness: 0.58, metalness: 0.08 },
  });

  assert.ok(layout.roomAWalls.every((wall) =>
    [layout.ROOM_A_MATERIALS.mainWall.color, layout.ROOM_A_MATERIALS.secondaryWall.color]
      .includes(wall.color),
  ));
});

test("Room B keeps Room A's finish while Room C uses its isolated wall material", () => {
  const roomAWallColors = new Set([
    layout.ROOM_A_MATERIALS.mainWall.color,
    layout.ROOM_A_MATERIALS.secondaryWall.color,
  ]);

  assert.ok(layout.roomBWalls.every((wall) => roomAWallColors.has(wall.color)));
  assert.ok(layout.roomCWalls.every((wall) => wall.color === layout.ROOM_C_MATERIALS.wall.color));
  assert.ok(!roomAWallColors.has(layout.ROOM_C_MATERIALS.wall.color));
  assert.ok(layout.galleryMoldingCorners
    .filter((corner) => corner.id.startsWith("b-c-room-c"))
    .every((corner) => corner.materialStyle === "roomC"));
  assert.ok(layout.galleryMoldingCorners
    .filter((corner) => !corner.id.startsWith("b-c-room-c"))
    .every((corner) => corner.materialStyle === "roomA"));
});

test("Room A lighting keeps navy surfaces readable with broad artwork pools", () => {
  assert.deepEqual(layout.ROOM_A_LIGHTING, {
    hemisphere: { skyColor: "#b7cde0", groundColor: "#2b4055", intensity: 2 },
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
  });
});

test("Room A reserves static lightmaps for the right wall and adjacent ceiling only", async () => {
  let lightmapModule;

  try {
    lightmapModule = await import("../src/roomARightWallLightmap.ts");
  } catch {
    lightmapModule = undefined;
  }

  assert.equal(typeof lightmapModule?.ROOM_A_RIGHT_WALL_LIGHTMAP, "object");
  assert.deepEqual(lightmapModule.ROOM_A_RIGHT_WALL_LIGHTMAP, {
    wallId: "right",
    path: "/materials/room-a-right-wall-lightmap.png",
    resolution: 512,
    channel: 1,
    lightMapIntensity: 1.48,
    interiorFaceMaterialIndex: 5,
    neutralUv: [0.5, 0.5],
    upperNearRange: 0.24,
    upperBroadRange: 0.7,
    upperNearStrength: 0.68,
    upperBroadStrength: 0.66,
    lowerRange: 0.16,
    edgeFadeRange: 0.07,
    warmColor: "#e4bd88",
  });
  assert.deepEqual(lightmapModule.ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP, {
    path: "/materials/room-a-right-upper-ceiling-lightmap.png",
    resolution: 256,
    channel: 1,
    lightMapIntensity: 2,
    interiorFaceMaterialIndex: 3,
    neutralUv: [0, 0.5],
    nearRange: 0.24,
    broadRange: 0.72,
    nearStrength: 0.72,
    broadStrength: 0.7,
    edgeFadeRange: 0.06,
    warmColor: "#e4bd88",
  });
  assert.deepEqual(
    layout.roomAWalls
      .filter((wall) => wall.id !== lightmapModule.ROOM_A_RIGHT_WALL_LIGHTMAP.wallId)
      .map((wall) => wall.id),
    ["front", "back-feature", "back-return", "left", "connector-left", "connector-right"],
  );
});

test("Room A reference-wall cove uses exactly two thin non-light meshes", async () => {
  const lightmapModule = await import("../src/roomARightWallLightmap.ts");

  assert.deepEqual(lightmapModule.ROOM_A_RIGHT_WALL_COVE_LINES, {
    wallId: "right",
    size: [0.008, 0.018, 8.4],
    upperPosition: [5.314, 4.185, 0],
    lowerPosition: [5.314, 0.164, 0],
    color: "#c39b68",
    toneMapped: false,
  });
});

test("Room A selective bloom targets only the two right-wall cove meshes", async () => {
  const lightmapModule = await import("../src/roomARightWallLightmap.ts");
  const gallerySceneSource = readFileSync(
    fileURLToPath(new URL("../src/components/GalleryScene.tsx", import.meta.url)),
    "utf8",
  );
  const artworkSource = readFileSync(
    fileURLToPath(new URL("../src/components/Artwork.tsx", import.meta.url)),
    "utf8",
  );
  const coveBloomSource = readFileSync(
    fileURLToPath(new URL("../src/components/RoomACoveBloom.tsx", import.meta.url)),
    "utf8",
  );
  const packageJson = JSON.parse(readFileSync(
    fileURLToPath(new URL("../package.json", import.meta.url)),
    "utf8",
  ));

  assert.equal(lightmapModule.ROOM_A_COVE_BLOOM_LAYER, 1);
  assert.equal(lightmapModule.ROOM_A_COVE_OCCLUDER_LAYER, 2);
  assert.deepEqual(lightmapModule.ROOM_A_COVE_BLOOM, {
    enabled: true,
    targetMeshKeys: ["right-wall-upper-cove", "right-wall-lower-cove"],
    maxPixelRatio: 1,
    sourceStrength: {
      upper: 1.25,
      lower: 0.9,
    },
    strength: 0.27,
    radius: 0.64,
    threshold: 0.1,
  });
  assert.match(
    gallerySceneSource,
    /mesh\?\.layers\.enable\(ROOM_A_COVE_BLOOM_LAYER\)/,
  );
  assert.match(
    gallerySceneSource,
    /mesh\.layers\.enable\(ROOM_A_COVE_OCCLUDER_LAYER\)/,
  );
  assert.match(
    gallerySceneSource,
    /ref=\{useRoomALighting \? configureRoomACoveOccluder : undefined\}/,
  );
  assert.match(gallerySceneSource, /material\.colorWrite = false/);
  assert.match(gallerySceneSource, /material\.colorWrite = previousColorWrite/);
  assert.match(gallerySceneSource, /roomACoveOccluderColorWrite\.delete\(material\)/);
  assert.doesNotMatch(
    gallerySceneSource,
    /createRoomACoveMaterial|onBeforeCompile|vCoveEdgeCoord|customProgramCacheKey/,
  );
  assert.match(gallerySceneSource, /transparent: false/);
  assert.match(gallerySceneSource, /depthTest: true/);
  assert.match(gallerySceneSource, /depthWrite: true/);
  assert.match(gallerySceneSource, /<RoomACoveBloom sourceMaterials=\{materials\} \/>/);
  assert.doesNotMatch(artworkSource, /ROOM_A_COVE_BLOOM_LAYER|RoomACoveBloom/);
  assert.match(coveBloomSource, /currentRoom !== "A"/);
  assert.match(coveBloomSource, /camera\.layers\.set\(ROOM_A_COVE_BLOOM_LAYER\)/);
  assert.match(coveBloomSource, /camera\.layers\.set\(ROOM_A_COVE_OCCLUDER_LAYER\)/);
  assert.match(coveBloomSource, /scene\.overrideMaterial = pipeline\.occlusionMaskMaterial/);
  assert.match(coveBloomSource, /gl\.setRenderTarget\(pipeline\.composer\.readBuffer\)/);
  assert.match(coveBloomSource, /scene\.overrideMaterial = previousOverrideMaterial/);
  assert.match(coveBloomSource, /gl\.setRenderTarget\(previousRenderTarget\)/);
  assert.match(coveBloomSource, /camera\.layers\.mask = previousCameraLayerMask/);
  assert.doesNotMatch(coveBloomSource, /scene\.traverse|occlusionMaterial|originalMaterials/);
  assert.match(coveBloomSource, /gl\.autoClear = false/);
  assert.match(coveBloomSource, /gl\.autoClear = previousAutoClear/);
  assert.equal((coveBloomSource.match(/composer\.addPass\(/g) ?? []).length, 2);
  assert.equal(packageJson.dependencies["@react-three/postprocessing"], undefined);
  assert.equal(packageJson.dependencies.postprocessing, undefined);
});

test("only right-wall artworks receive the narrower prototype spotlight", async () => {
  const lightmapModule = await import("../src/roomARightWallLightmap.ts");

  assert.equal(typeof lightmapModule.getRoomARightWallSpotlightOverride, "function");

  for (const id of ["artwork-a-04", "artwork-a-05", "artwork-a-06"]) {
    assert.deepEqual(lightmapModule.getRoomARightWallSpotlightOverride(id), {
      intensity: 16,
      angle: 0.5,
    });
  }

  for (const id of ["artwork-a-01", "artwork-a-02", "artwork-a-03", "artwork-a-07", "artwork-a-08"]) {
    assert.equal(lightmapModule.getRoomARightWallSpotlightOverride(id), undefined);
  }
});

test("single-face lightmap geometry preserves uv and isolates uv1 to the interior face", async () => {
  let lightmapModule;

  try {
    lightmapModule = await import("../src/roomARightWallLightmap.ts");
  } catch {
    lightmapModule = undefined;
  }

  assert.equal(typeof lightmapModule?.createSingleFaceLightmapBoxGeometry, "function");

  const baseline = new BoxGeometry(8.8, 4.2, 0.16);
  const geometry = lightmapModule.createSingleFaceLightmapBoxGeometry(
    8.8,
    4.2,
    0.16,
    5,
    [0.5, 0.5],
  );
  const uv = geometry.getAttribute("uv");
  const uv1 = geometry.getAttribute("uv1");
  const index = geometry.getIndex();
  const interiorGroup = geometry.groups.find((group) => group.materialIndex === 5);

  assert.ok(uv1, "custom uv1 must exist");
  assert.equal(geometry.getAttribute("uv2"), undefined);
  assert.deepEqual(Array.from(uv.array), Array.from(baseline.getAttribute("uv").array));
  assert.ok(index);
  assert.ok(interiorGroup);

  const interiorVertices = new Set(
    Array.from(index.array.slice(
      interiorGroup.start,
      interiorGroup.start + interiorGroup.count,
    )),
  );

  for (let vertexIndex = 0; vertexIndex < uv.count; vertexIndex += 1) {
    if (interiorVertices.has(vertexIndex)) {
      assert.equal(uv1.getX(vertexIndex), uv.getX(vertexIndex));
      assert.equal(uv1.getY(vertexIndex), uv.getY(vertexIndex));
    } else {
      assert.equal(uv1.getX(vertexIndex), 0.5);
      assert.equal(uv1.getY(vertexIndex), 0.5);
    }
  }

  baseline.dispose();
  geometry.dispose();
});

test("Room A ceiling lightmap uses uv1 on the underside with the right-wall edge at U=1", async () => {
  const lightmapModule = await import("../src/roomARightWallLightmap.ts");
  const gallerySceneSource = readFileSync(
    fileURLToPath(new URL("../src/components/GalleryScene.tsx", import.meta.url)),
    "utf8",
  );
  const baseline = new BoxGeometry(10.8, 0.16, 8.8);
  const geometry = lightmapModule.createSingleFaceLightmapBoxGeometry(
    10.8,
    0.16,
    8.8,
    lightmapModule.ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.interiorFaceMaterialIndex,
    lightmapModule.ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.neutralUv,
  );
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  const uv1 = geometry.getAttribute("uv1");
  const index = geometry.getIndex();
  const underside = geometry.groups.find((group) => group.materialIndex === 3);

  assert.ok(index);
  assert.ok(underside);
  assert.deepEqual(Array.from(uv.array), Array.from(baseline.getAttribute("uv").array));

  const undersideVertices = new Set(Array.from(index.array.slice(
    underside.start,
    underside.start + underside.count,
  )));
  const rightEdgeVertices = [...undersideVertices].filter(
    (vertexIndex) => position.getX(vertexIndex) > 5,
  );
  const interiorEdgeVertices = [...undersideVertices].filter(
    (vertexIndex) => position.getX(vertexIndex) < -5,
  );

  assert.ok(rightEdgeVertices.length > 0);
  assert.ok(interiorEdgeVertices.length > 0);
  rightEdgeVertices.forEach((vertexIndex) => assert.equal(uv1.getX(vertexIndex), 1));
  interiorEdgeVertices.forEach((vertexIndex) => assert.equal(uv1.getX(vertexIndex), 0));
  assert.match(gallerySceneSource, /lightMap=\{rightUpperCeilingLightMap\}/);
  assert.match(
    gallerySceneSource,
    /lightMapIntensity=\{ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP\.lightMapIntensity\}/,
  );

  baseline.dispose();
  geometry.dispose();
});

test("right-wall lightmap asset is a restrained 512px warm cove profile", async () => {
  const assetPath = fileURLToPath(new URL(
    "../public/materials/room-a-right-wall-lightmap.png",
    import.meta.url,
  ));

  assert.equal(existsSync(assetPath), true, "right-wall lightmap asset must exist");

  const image = sharp(assetPath);
  const metadata = await image.metadata();
  const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixel = (x, y) => {
    const offset = (y * info.width + x) * info.channels;
    return [data[offset], data[offset + 1], data[offset + 2]];
  };
  const luminance = (rgb) => rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;

  assert.equal(metadata.width, 512);
  assert.equal(metadata.height, 512);

  const topCenter = pixel(256, 4);
  const upperTail = pixel(256, 92);
  const upperMid = pixel(256, 170);
  const center = pixel(256, 256);
  const darkGap = pixel(256, 368);
  const lowerTail = pixel(256, 438);
  const bottomCenter = pixel(256, 507);
  const topEdge = pixel(0, 4);

  assert.ok(topCenter[0] > topCenter[1] && topCenter[1] > topCenter[2]);
  assert.ok(luminance(topCenter) > luminance(upperTail));
  assert.ok(luminance(upperTail) > luminance(upperMid) + 20);
  assert.ok(luminance(upperMid) > luminance(center) + 20);
  assert.ok(luminance(bottomCenter) > luminance(lowerTail));
  assert.ok(luminance(center) > luminance(darkGap) + 40);
  assert.ok(luminance(lowerTail) > luminance(darkGap) + 10);
  assert.ok(luminance(topCenter) > luminance(topEdge));
  assert.ok(luminance(darkGap) < 3, "the upper and lower cove fields must retain a dark gap");
});

test("right-upper ceiling lightmap is a broad low-frequency spill from the right wall", async () => {
  const assetPath = fileURLToPath(new URL(
    "../public/materials/room-a-right-upper-ceiling-lightmap.png",
    import.meta.url,
  ));

  assert.equal(existsSync(assetPath), true, "ceiling lightmap asset must exist");

  const image = sharp(assetPath);
  const metadata = await image.metadata();
  const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixel = (x, y) => {
    const offset = (y * info.width + x) * info.channels;
    return [data[offset], data[offset + 1], data[offset + 2]];
  };
  const luminance = (rgb) => rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;

  assert.equal(metadata.width, 256);
  assert.equal(metadata.height, 256);

  const boundary = pixel(252, 128);
  const near = pixel(225, 128);
  const middle = pixel(174, 128);
  const halfInterior = pixel(128, 128);
  const farInterior = pixel(4, 128);
  const longitudinalEdge = pixel(252, 0);

  assert.ok(boundary[0] > boundary[1] && boundary[1] > boundary[2]);
  assert.ok(luminance(boundary) >= luminance(near));
  assert.ok(luminance(near) > luminance(middle) + 40);
  assert.ok(luminance(middle) > luminance(halfInterior) + 40);
  assert.ok(luminance(halfInterior) > luminance(farInterior) + 40);
  assert.ok(luminance(farInterior) < 3);
  assert.ok(luminance(boundary) > luminance(longitudinalEdge));
});

test("spotlight fixture aims its lens from the rail head toward the artwork", () => {
  const transform = layout.getSpotlightFixtureTransform(
    [3.32, 3.68, 2.55],
    [5.28, 1.7, 2.55],
  );

  assert.deepEqual(transform.pivotPosition, [3.32, 3.68, 2.55]);
  assert.ok(Math.abs(transform.direction[0] - 0.703507) < 0.00001);
  assert.ok(Math.abs(transform.direction[1] + 0.710688) < 0.00001);
  assert.ok(Math.abs(transform.direction[2]) < 0.00001);
  assert.ok(Math.abs(transform.lensPosition[0] - 3.538087) < 0.00001);
  assert.ok(Math.abs(transform.lensPosition[1] - 3.459687) < 0.00001);
  assert.equal(transform.lensPosition[2], 2.55);
  assert.ok(Math.abs(transform.stemHeight - 0.44) < 0.00001);
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
