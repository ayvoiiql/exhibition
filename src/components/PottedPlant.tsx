import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { Vec3 } from "../galleryLayout";

const POTTED_PLANT_MODEL = "/models/potted-plant-01/potted_plant_01_1k.gltf";

interface PottedPlantProps {
  position: Vec3;
  rotationY: number;
  scale?: number;
}

export function PottedPlant({ position, rotationY, scale = 1 }: PottedPlantProps) {
  const { scene } = useGLTF(POTTED_PLANT_MODEL);
  const plant = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return clone;
  }, [scene]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={plant} />
    </group>
  );
}

useGLTF.preload(POTTED_PLANT_MODEL);
