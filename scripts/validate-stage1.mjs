import { access, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import * as THREE from "three";
import { ARTWORK_MAX_DIMENSION } from "../src/renderQuality.ts";

const root = process.cwd();
const contentPath = path.join(root, "content", "artworks.json");
const artworks = JSON.parse(await readFile(contentPath, "utf8")).filter(
  (artwork) => artwork.roomId === "A",
);

if (!Array.isArray(artworks) || artworks.length !== 8) {
  throw new Error("Room A must contain exactly eight artworks.");
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

const camera = new THREE.PerspectiveCamera();
camera.rotation.order = "YXZ";
const controlCases = [
  { yaw: 0, forward: [0, 0, -1], right: [1, 0, 0] },
  { yaw: -Math.PI / 2, forward: [1, 0, 0], right: [0, 0, 1] },
  { yaw: Math.PI / 2, forward: [-1, 0, 0], right: [0, 0, -1] },
];

for (const test of controlCases) {
  camera.rotation.set(0, test.yaw, 0);
  const forward = camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  if (forward.distanceTo(new THREE.Vector3(...test.forward)) > 0.0001) {
    throw new Error(`Forward movement does not match camera yaw ${test.yaw}`);
  }
  if (right.distanceTo(new THREE.Vector3(...test.right)) > 0.0001) {
    throw new Error(`Right movement does not match camera yaw ${test.yaw}`);
  }
}

console.log(`Room A validated: ${artworks.length} artworks, readable mobile images, camera-relative controls.`);
