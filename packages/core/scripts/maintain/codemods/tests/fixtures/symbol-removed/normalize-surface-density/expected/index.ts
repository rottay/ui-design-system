import { normalizeDensityPosture } from '@rottay/design-system';

export function postureOf(input: string | null) {
  return normalizeDensityPosture(input) ?? 'comfortable';
}

export const label = 'normalizeSurfaceDensity';
