import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  ARTWORK_MAX_DIMENSION,
  ARTWORK_WEBP_QUALITY,
} from "../src/renderQuality.ts";

const files = Array.from({ length: 8 }, (_, index) =>
  `artwork-b-${String(index + 1).padStart(2, "0")}.jpg`,
);
const sourceDir = path.resolve("../B");
const outputDir = path.resolve("public/artworks");

await mkdir(outputDir, { recursive: true });

for (const file of files) {
  const source = path.join(sourceDir, file);
  const output = path.join(outputDir, file.replace(/\.jpg$/i, ".webp"));

  await sharp(source)
    .rotate()
    .resize({
      width: ARTWORK_MAX_DIMENSION,
      height: ARTWORK_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: ARTWORK_WEBP_QUALITY, effort: 5 })
    .toFile(output);

  const metadata = await sharp(output).metadata();
  console.log(`${path.basename(output)}: ${metadata.width}x${metadata.height}`);
}
