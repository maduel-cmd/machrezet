import type { BeadCategory, BeadShape } from './types';

export type MaterialFinish =
  | 'plastic'
  | 'gem'
  | 'pearl'
  | 'crystal'
  | 'metal'
  | 'wood'
  | 'matte'
  | 'acrylic';

export interface MaterialRecipe {
  finish: MaterialFinish;
  /** שקיפות חלקית — חוט נראה מעט דרך החרוז */
  translucency: number;
  /** גודל hotspot יחסי (0–1) */
  specular: number;
  /** חספוס — פחות = מבריק יותר */
  roughness: number;
  /** האם החוט מוסתר לגמרי מאחורי הגוף */
  opaque: boolean;
  holeScale: number;
}

const BY_CATEGORY: Record<BeadCategory, MaterialRecipe> = {
  pony: { finish: 'plastic', translucency: 0.14, specular: 0.98, roughness: 0.14, opaque: true, holeScale: 0.42 },
  gemstone: { finish: 'gem', translucency: 0.34, specular: 1, roughness: 0.08, opaque: true, holeScale: 0.36 },
  pearl: { finish: 'pearl', translucency: 0.12, specular: 0.72, roughness: 0.32, opaque: true, holeScale: 0.36 },
  crystal: { finish: 'crystal', translucency: 0.58, specular: 1, roughness: 0.05, opaque: false, holeScale: 0.34 },
  metal: { finish: 'metal', translucency: 0, specular: 1, roughness: 0.08, opaque: true, holeScale: 0.4 },
  wood: { finish: 'wood', translucency: 0, specular: 0.42, roughness: 0.55, opaque: true, holeScale: 0.4 },
  heishi: { finish: 'matte', translucency: 0, specular: 0.3, roughness: 0.6, opaque: true, holeScale: 0.48 },
  letter: { finish: 'acrylic', translucency: 0.05, specular: 0.78, roughness: 0.22, opaque: true, holeScale: 0.4 },
  charm: { finish: 'metal', translucency: 0, specular: 0.98, roughness: 0.1, opaque: true, holeScale: 0.28 },
  seed: { finish: 'matte', translucency: 0, specular: 0.4, roughness: 0.5, opaque: true, holeScale: 0.44 },
};

export function materialFor(category: BeadCategory): MaterialRecipe {
  return BY_CATEGORY[category];
}

export const SIZE_PX: Record<'xs' | 'sm' | 'md' | 'lg', number> = {
  xs: 16,
  sm: 22,
  md: 32,
  lg: 40,
};

export function beadPixelSize(size: keyof typeof SIZE_PX, shape: BeadShape): { w: number; h: number } {
  const px = SIZE_PX[size];
  if (shape === 'tube') return { w: px * 0.58, h: px * 1.15 };
  if (shape === 'disc') return { w: px * 1.05, h: px * 0.42 };
  return { w: px, h: px };
}
