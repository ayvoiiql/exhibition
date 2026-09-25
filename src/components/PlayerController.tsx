import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MoveInput } from "../types";
import { useGalleryStore } from "../store";
import {
  galleryCollisionBlocks,
  galleryWalkablePolygons,
  getRoomIdAt,
} from "../galleryLayout";

interface PlayerControllerProps {
  moveInput: React.RefObject<MoveInput>;
  lookInput: React.RefObject<MoveInput>;
  isCoarsePointer: boolean;
  interactionBlocked: boolean;
}

const DRAG_SENSITIVITY = 0.003;
const KEYBOARD_TURN_SPEED = 1.65;
const TURN_SMOOTHING = 14;

function pointInPolygon(x: number, z: number, polygon: [number, number][]) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [xi, zi] = polygon[index];
    const [xj, zj] = polygon[previous];
    const crosses = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function isWalkable(x: number, z: number) {
  if (!galleryWalkablePolygons.some((polygon) => pointInPolygon(x, z, polygon))) return false;
  return !galleryCollisionBlocks.some(
    (block) => x >= block.minX && x <= block.maxX && z >= block.minZ && z <= block.maxZ,
  );
}

export function PlayerController({
  moveInput,
  lookInput,
  isCoarsePointer,
  interactionBlocked,
}: PlayerControllerProps) {
  const { camera, gl, scene } = useThree();
  const started = useGalleryStore((state) => state.started);
  const selectedArtwork = useGalleryStore((state) => state.selectedArtwork);
  const selectArtwork = useGalleryStore((state) => state.selectArtwork);
  const setFocusedArtwork = useGalleryStore((state) => state.setFocusedArtwork);
  const setCurrentRoom = useGalleryStore((state) => state.setCurrentRoom);
  const yaw = useRef(0);
  const targetYaw = useRef(0);
  const keys = useRef(new Set<string>());
  const dragPointer = useRef<number | null>(null);
  const lastPointerX = useRef(0);
  const raycaster = useRef(new THREE.Raycaster());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(0, 1.65, 3.1);
    camera.rotation.order = "YXZ";
  }, [camera]);

  useEffect(() => {
    if (started && !interactionBlocked) return;
    keys.current.clear();
    moveInput.current.x = 0;
    moveInput.current.y = 0;
    lookInput.current.x = 0;
    lookInput.current.y = 0;
    if (dragPointer.current !== null) {
      const pointerId = dragPointer.current;
      if (gl.domElement.hasPointerCapture(pointerId)) {
        gl.domElement.releasePointerCapture(pointerId);
      }
      dragPointer.current = null;
      gl.domElement.style.cursor = "";
    }
  }, [gl.domElement, interactionBlocked, lookInput, moveInput, started]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!useGalleryStore.getState().started || interactionBlocked) {
        keys.current.clear();
        return;
      }

      keys.current.add(event.code);
      if (event.code === "KeyE") {
        const artwork = useGalleryStore.getState().focusedArtwork;
        if (artwork) selectArtwork(artwork);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keys.current.delete(event.code);
    const onPointerDown = (event: PointerEvent) => {
      const state = useGalleryStore.getState();
      if (
        isCoarsePointer
        || event.button !== 0
        || !state.started
        || state.selectedArtwork
        || interactionBlocked
      ) return;
      dragPointer.current = event.pointerId;
      lastPointerX.current = event.clientX;
      gl.domElement.setPointerCapture(event.pointerId);
      gl.domElement.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (dragPointer.current !== event.pointerId || selectedArtwork || interactionBlocked) return;
      const dx = event.clientX - lastPointerX.current;
      lastPointerX.current = event.clientX;
      targetYaw.current += dx * DRAG_SENSITIVITY;
    };
    const endDrag = (event?: PointerEvent) => {
      if (event && dragPointer.current !== event.pointerId) return;
      if (event && gl.domElement.hasPointerCapture(event.pointerId)) {
        gl.domElement.releasePointerCapture(event.pointerId);
      }
      dragPointer.current = null;
      gl.domElement.style.cursor = "";
    };
    const onBlur = () => {
      keys.current.clear();
      endDrag();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    gl.domElement.addEventListener("pointerdown", onPointerDown);
    gl.domElement.addEventListener("pointermove", onPointerMove);
    gl.domElement.addEventListener("pointerup", endDrag);
    gl.domElement.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      gl.domElement.removeEventListener("pointermove", onPointerMove);
      gl.domElement.removeEventListener("pointerup", endDrag);
      gl.domElement.removeEventListener("pointercancel", endDrag);
    };
  }, [gl.domElement, interactionBlocked, isCoarsePointer, selectArtwork, selectedArtwork]);

  useFrame((_, delta) => {
    if (!started || selectedArtwork || interactionBlocked) return;
    const frameDelta = Math.min(delta, 0.05);

    if (isCoarsePointer) {
      targetYaw.current += lookInput.current.x * DRAG_SENSITIVITY;
      lookInput.current.x = 0;
      lookInput.current.y = 0;
    }

    const keyboardTurn =
      Number(keys.current.has("KeyA") || keys.current.has("ArrowLeft")) -
      Number(keys.current.has("KeyD") || keys.current.has("ArrowRight"));
    targetYaw.current += keyboardTurn * KEYBOARD_TURN_SPEED * frameDelta;
    yaw.current = THREE.MathUtils.damp(yaw.current, targetYaw.current, TURN_SMOOTHING, frameDelta);
    camera.rotation.set(0, yaw.current, 0);

    const keyboardY = Number(keys.current.has("KeyW") || keys.current.has("ArrowUp")) - Number(keys.current.has("KeyS") || keys.current.has("ArrowDown"));
    const inputX = THREE.MathUtils.clamp(moveInput.current.x, -1, 1);
    const inputY = THREE.MathUtils.clamp(keyboardY + moveInput.current.y, -1, 1);

    if (inputX || inputY) {
      camera.getWorldDirection(forward.current);
      forward.current.y = 0;
      forward.current.normalize();
      right.current.crossVectors(forward.current, camera.up).normalize();
      const movement = forward.current
        .clone()
        .multiplyScalar(inputY)
        .add(right.current.clone().multiplyScalar(inputX));
      if (movement.lengthSq() > 1) movement.normalize();
      movement.multiplyScalar(3.1 * frameDelta);

      const nextX = camera.position.x + movement.x;
      if (isWalkable(nextX, camera.position.z)) camera.position.x = nextX;

      const nextZ = camera.position.z + movement.z;
      if (isWalkable(camera.position.x, nextZ)) camera.position.z = nextZ;
      camera.position.y = 1.65;
    }

    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    raycaster.current.far = 10.5;
    const hit = raycaster.current
      .intersectObjects(scene.children, true)
      .find(
        (intersection) =>
          intersection.object.userData.artworkId || intersection.object.userData.blocksArtworkRay,
      );
    setFocusedArtwork(hit?.object.userData.artwork ?? null);

    const currentRoom = getRoomIdAt(camera.position.x, camera.position.z);
    if (useGalleryStore.getState().currentRoom !== currentRoom) setCurrentRoom(currentRoom);
  });

  return null;
}
