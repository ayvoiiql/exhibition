import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ARTWORK_MAX_DIMENSION } from "../src/renderQuality.ts";

const root = process.cwd();
const artworks = JSON.parse(
  await readFile(path.join(root, "content", "artworks.json"), "utf8"),
).filter((artwork) => artwork.roomId === "B");

if (artworks.length !== 8) {
  throw new Error("Room B must contain exactly eight artworks.");
}

const ids = new Set();
for (const artwork of artworks) {
  for (const key of ["id", "title", "description", "roomId", "image"]) {
    if (typeof artwork[key] !== "string" || !artwork[key].trim()) {
      throw new Error(`${artwork.id ?? "unknown"}: missing ${key}`);
    }
  }
  if (!Number.isInteger(artwork.order) || artwork.order < 1) {
    throw new Error(`${artwork.id}: order must be a positive integer`);
  }
  if (ids.has(artwork.id)) throw new Error(`Duplicate artwork id: ${artwork.id}`);
  ids.add(artwork.id);

  const imagePath = path.join(root, "public", artwork.image.replace(/^\//, ""));
  await access(imagePath);
  const metadata = await sharp(imagePath).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Unreadable image: ${imagePath}`);
  if (Math.max(metadata.width, metadata.height) > ARTWORK_MAX_DIMENSION) {
    throw new Error(`Image exceeds the mobile limit: ${imagePath}`);
  }
}

console.log(`Room B validated: ${artworks.length} artworks and readable images.`);
