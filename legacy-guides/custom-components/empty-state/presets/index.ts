import { standardPreset } from './standard';
import { illustrationPreset } from './illustration';
import type { EmptyStatePreset } from '../core';

export { standardPreset, illustrationPreset };

export const PRESETS: Record<EmptyStatePreset, typeof standardPreset> = {
  standard: standardPreset,
  illustration: illustrationPreset,
};
