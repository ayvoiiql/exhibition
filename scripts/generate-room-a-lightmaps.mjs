import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP,
  ROOM_A_RIGHT_WALL_LIGHTMAP,
} from "../src/roomARightWallLightmap.ts";

const {
  resolution,
  upperNearRange,
  upperBroadRange,
  upperNearStrength,
  upperBroadStrength,
  lowerRange,
  edgeFadeRange,
  warmColor,
} = ROOM_A_RIGHT_WALL_LIGHTMAP;
const wallOutputPath = fileURLToPath(new URL(
  `../public${ROOM_A_RIGHT_WALL_LIGHTMAP.path}`,
  import.meta.url,
));
const ceilingOutputPath = fileURLToPath(new URL(
  `../public${ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP.path}`,
  import.meta.url,
));

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smootherStep(value) {
  const x = clamp01(value);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function srgbToLinear(value) {
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value) {
  const x = clamp01(value);
  return x <= 0.0031308
    ? x * 12.92
    : 1.055 * x ** (1 / 2.4) - 0.055;
}

function parseHexColor(hex) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
}

const warmLinear = parseHexColor(warmColor).map(srgbToLinear);
const pixels = Buffer.alloc(resolution * resolution * 3);

for (let y = 0; y < resolution; y += 1) {
  const vertical = y / (resolution - 1);
  const upperNear = (1 - smootherStep(vertical / upperNearRange)) * upperNearStrength;
  const upperBroad = (1 - smootherStep(vertical / upperBroadRange)) * upperBroadStrength;
  const upper = clamp01(upperNear + upperBroad);
  const lower = (1 - smootherStep((1 - vertical) / lowerRange)) * 0.72;
  const verticalEnergy = Math.max(upper, lower);

  for (let x = 0; x < resolution; x += 1) {
    const horizontal = x / (resolution - 1);
    const leftFade = smootherStep(horizontal / edgeFadeRange);
    const rightFade = smootherStep((1 - horizontal) / edgeFadeRange);
    const horizontalShape = 0.58 + 0.42 * Math.min(leftFade, rightFade);
    const energy = verticalEnergy * horizontalShape;
    const offset = (y * resolution + x) * 3;

    for (let channel = 0; channel < 3; channel += 1) {
      pixels[offset + channel] = Math.round(
        linearToSrgb(warmLinear[channel] * energy) * 255,
      );
    }
  }
}

await mkdir(dirname(wallOutputPath), { recursive: true });
await sharp(pixels, {
  raw: { width: resolution, height: resolution, channels: 3 },
})
  .png({ compressionLevel: 9, palette: false })
  .toFile(wallOutputPath);

const ceiling = ROOM_A_RIGHT_UPPER_CEILING_LIGHTMAP;
const ceilingWarmLinear = parseHexColor(ceiling.warmColor).map(srgbToLinear);
const ceilingPixels = Buffer.alloc(ceiling.resolution * ceiling.resolution * 3);

for (let y = 0; y < ceiling.resolution; y += 1) {
  const longitudinal = y / (ceiling.resolution - 1);
  const startFade = smootherStep(longitudinal / ceiling.edgeFadeRange);
  const endFade = smootherStep((1 - longitudinal) / ceiling.edgeFadeRange);
  const longitudinalShape = 0.58 + 0.42 * Math.min(startFade, endFade);

  for (let x = 0; x < ceiling.resolution; x += 1) {
    const horizontal = x / (ceiling.resolution - 1);
    const distanceFromRightWall = 1 - horizontal;
    const near = (1 - smootherStep(distanceFromRightWall / ceiling.nearRange))
      * ceiling.nearStrength;
    const broad = (1 - smootherStep(distanceFromRightWall / ceiling.broadRange))
      * ceiling.broadStrength;
    const energy = clamp01(near + broad) * longitudinalShape;
    const offset = (y * ceiling.resolution + x) * 3;

    for (let channel = 0; channel < 3; channel += 1) {
      ceilingPixels[offset + channel] = Math.round(
        linearToSrgb(ceilingWarmLinear[channel] * energy) * 255,
      );
    }
  }
}

await sharp(ceilingPixels, {
  raw: {
    width: ceiling.resolution,
    height: ceiling.resolution,
    channels: 3,
  },
})
  .png({ compressionLevel: 9, palette: false })
  .toFile(ceilingOutputPath);

console.log(`Generated ${resolution}x${resolution} Room A right-wall lightmap.`);
console.log(
  `Generated ${ceiling.resolution}x${ceiling.resolution} Room A right-upper ceiling lightmap.`,
);
