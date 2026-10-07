import { resolveListCardMinWidth, type SurfaceDensity } from '@rottay/design-system';

// SurfaceDensity is named in this comment and must stay.
export function cardWidth(density: SurfaceDensity): number {
  return resolveListCardMinWidth(density);
}

export const fallback: SurfaceDensity = 'comfortable';
