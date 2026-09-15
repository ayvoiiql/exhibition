import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const files = Array.from({ length: 8 }, (_, index) =>
  `artwork-a-${String(index + 1).padStart(2, "0")}.jpg`,
);
const sourceDir = path.resolve("../A");
const outputDir = path.resolve("public/artworks");

await mkdir(outputDir, { recursive: true });

for (const file of files) {
  const source = path.join(sourceDir, file);
  const output = path.join(outputDir, file.replace(/\.jpg$/i, ".webp"));

  await sharp(source)
    .rotate()
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(output);

  const metadata = await sharp(output).metadata();
  console.log(`${path.basename(output)}: ${metadata.width}x${metadata.height}`);
}
