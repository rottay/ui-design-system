import { normalizeSurfaceDensity } from '@rottay/design-system';

export function postureOf(input: string | null) {
  return normalizeSurfaceDensity(input) ?? 'comfortable';
}

export const label = 'normalizeSurfaceDensity';
