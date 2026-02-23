/**
 * BhSourceEffectiveness - All Presets
 */

import type { BhSourceEffectivenessPreset, BhSourceEffectivenessProps } from '../core';
import type { ComponentType } from 'react';
import { DetailedBhSourceEffectiveness } from './detailed';
import { CompactBhSourceEffectiveness } from './compact';

export { DetailedBhSourceEffectiveness } from './detailed';
export { CompactBhSourceEffectiveness } from './compact';

export const BH_SOURCE_EFFECTIVENESS_PRESETS: Record<BhSourceEffectivenessPreset, ComponentType<BhSourceEffectivenessProps>> = {
  'detailed': DetailedBhSourceEffectiveness,
  'compact': CompactBhSourceEffectiveness,
};
