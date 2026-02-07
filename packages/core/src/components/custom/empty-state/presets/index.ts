import { standardPreset } from './standard';
import { compactPreset } from './compact';
import { illustrationPreset } from './illustration';
import type { EmptyStatePreset } from '../core';

export { standardPreset, compactPreset, illustrationPreset };

export const PRESETS: Record<EmptyStatePreset, typeof standardPreset> = {
  standard: standardPreset,
  compact: compactPreset,
  illustration: illustrationPreset,
};
