import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import path from "node:path";
import sharp from "sharp";

async function loadRenderQuality() {
  try {
    return await import("../src/renderQuality.ts");
  } catch {
    return {};
  }
}

test("mobile rendering keeps high-density edges antialiased", async () => {
  const quality = await loadRenderQuality();

  assert.equal(
    typeof quality.getRenderQuality,
    "function",
    "getRenderQuality must define the mobile rendering profile",
  );

  assert.deepEqual(quality.getRenderQuality(true), {
    dpr: [1, 1.5],
    antialias: true,
  });
});

test("artwork texture filtering uses available anisotropy up to eight", async () => {
  const quality = await loadRenderQuality();

  assert.equal(
    typeof quality.getTextureAnisotropy,
    "function",
    "getTextureAnisotropy must define the texture filtering profile",
  );

  assert.equal(quality.getTextureAnisotropy(16), 8);
  assert.equal(quality.getTextureAnisotropy(4), 4);
  assert.equal(quality.getTextureAnisotropy(0), 1);
});

test("the high-resolution Room A derivative is generated at 1536px", async () => {
  const imagePath = path.resolve("public/artworks/artwork-a-02.webp");
  await access(imagePath);
  const metadata = await sharp(imagePath).metadata();

  assert.equal(Math.max(metadata.width ?? 0, metadata.height ?? 0), 1536);
});
