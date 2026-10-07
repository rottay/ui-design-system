import { resolveListCardMinWidth, type DensityPosture } from '@rottay/design-system';

// SurfaceDensity is named in this comment and must stay.
export function cardWidth(density: DensityPosture): number {
  return resolveListCardMinWidth(density);
}

export const fallback: DensityPosture = 'comfortable';
