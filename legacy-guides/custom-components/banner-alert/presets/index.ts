import { standardPreset } from './standard';
import { compactPreset } from './compact';
import type { BannerAlertPreset } from '../core';

export { standardPreset, compactPreset };

export const PRESETS: Record<BannerAlertPreset, typeof standardPreset> = {
  standard: standardPreset,
  compact: compactPreset,
};
