export interface RenderQuality {
  dpr: [number, number];
  antialias: boolean;
}

const MOBILE_RENDER_QUALITY: RenderQuality = {
  dpr: [1, 1.5],
  antialias: true,
};

const DESKTOP_RENDER_QUALITY: RenderQuality = {
  dpr: [1, 1.5],
  antialias: true,
};

export const ARTWORK_MAX_DIMENSION = 1536;
export const ARTWORK_WEBP_QUALITY = 88;
export const FRAME_INNER_TRIM = 0.036;

export function getRenderQuality(isCoarsePointer: boolean): RenderQuality {
  return isCoarsePointer ? MOBILE_RENDER_QUALITY : DESKTOP_RENDER_QUALITY;
}

export function getTextureAnisotropy(deviceMaximum: number) {
  return Math.max(1, Math.min(8, Math.floor(deviceMaximum)));
}
