import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import {
  ROOM_A_COVE_BLOOM,
  ROOM_A_COVE_BLOOM_LAYER,
  ROOM_A_COVE_OCCLUDER_LAYER,
} from "../roomARightWallLightmap";
import { useGalleryStore } from "../store";

interface RoomACoveBloomProps {
  sourceMaterials: readonly [THREE.MeshBasicMaterial, THREE.MeshBasicMaterial];
}

interface CoveBloomPipeline {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  overlayPass: ShaderPass;
  occlusionMaskMaterial: THREE.MeshBasicMaterial;
}

const overlayVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const overlayFragmentShader = /* glsl */ `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;

  void main() {
    vec3 bloom = texture2D(tDiffuse, vUv).rgb;
    gl_FragColor = vec4(bloom, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function RoomACoveBloom({ sourceMaterials }: RoomACoveBloomProps) {
  const { camera, gl, scene, size, viewport } = useThree();
  const currentRoom = useGalleryStore((state) => state.currentRoom);
  const baseSourceColors = useMemo(
    () => sourceMaterials.map((material) => material.color.clone()),
    [sourceMaterials],
  );
  const pipelineRef = useRef<CoveBloomPipeline | null>(null);

  useEffect(() => {
    const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      stencilBuffer: false,
      samples: 0,
    });
    renderTarget.texture.name = "RoomA.CoveBloom.HalfFloat";

    const composer = new EffectComposer(gl, renderTarget);
    composer.renderToScreen = false;

    const renderPass = new RenderPass(
      scene,
      camera,
      null,
      new THREE.Color(0x000000),
      0,
    );
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      ROOM_A_COVE_BLOOM.strength,
      ROOM_A_COVE_BLOOM.radius,
      ROOM_A_COVE_BLOOM.threshold,
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const overlayMaterial = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: overlayVertexShader,
      fragmentShader: overlayFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      toneMapped: true,
    });
    const overlayPass = new ShaderPass(overlayMaterial);
    overlayPass.renderToScreen = true;

    const occlusionMaskMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
    });

    const pipeline = {
      composer,
      bloomPass,
      overlayPass,
      occlusionMaskMaterial,
    };
    pipelineRef.current = pipeline;

    return () => {
      if (pipelineRef.current === pipeline) pipelineRef.current = null;
      overlayPass.dispose();
      bloomPass.dispose();
      occlusionMaskMaterial.dispose();
      composer.dispose();
    };
  }, [camera, gl, scene]);

  useEffect(() => {
    const pipeline = pipelineRef.current;
    if (!pipeline) return;
    const bloomPixelRatio = Math.min(viewport.dpr, ROOM_A_COVE_BLOOM.maxPixelRatio);
    pipeline.composer.setPixelRatio(bloomPixelRatio);
    pipeline.composer.setSize(size.width, size.height);
  }, [size.height, size.width, viewport.dpr]);

  useFrame((_, delta) => {
    const pipeline = pipelineRef.current;

    if (!ROOM_A_COVE_BLOOM.enabled || !pipeline || currentRoom !== "A") {
      gl.render(scene, camera);
      return;
    }

    const previousCameraLayerMask = camera.layers.mask;
    const previousOverrideMaterial = scene.overrideMaterial;
    const previousBloomAutoClear = gl.autoClear;
    const previousRenderTarget = gl.getRenderTarget();
    try {
      camera.layers.set(ROOM_A_COVE_BLOOM_LAYER);
      sourceMaterials[0].color
        .copy(baseSourceColors[0])
        .multiplyScalar(ROOM_A_COVE_BLOOM.sourceStrength.upper);
      sourceMaterials[1].color
        .copy(baseSourceColors[1])
        .multiplyScalar(ROOM_A_COVE_BLOOM.sourceStrength.lower);
      pipeline.composer.render(delta);

      camera.layers.set(ROOM_A_COVE_OCCLUDER_LAYER);
      scene.overrideMaterial = pipeline.occlusionMaskMaterial;
      gl.autoClear = false;
      gl.setRenderTarget(pipeline.composer.readBuffer);
      gl.render(scene, camera);
    } finally {
      camera.layers.mask = previousCameraLayerMask;
      scene.overrideMaterial = previousOverrideMaterial;
      gl.autoClear = previousBloomAutoClear;
      gl.setRenderTarget(previousRenderTarget);
      sourceMaterials[0].color.copy(baseSourceColors[0]);
      sourceMaterials[1].color.copy(baseSourceColors[1]);
    }

    gl.setRenderTarget(null);
    gl.render(scene, camera);

    const previousAutoClear = gl.autoClear;
    try {
      gl.autoClear = false;
      pipeline.overlayPass.render(
        gl,
        pipeline.composer.writeBuffer,
        pipeline.composer.readBuffer,
        delta,
        false,
      );
    } finally {
      gl.autoClear = previousAutoClear;
    }
  }, 1);

  return null;
}
