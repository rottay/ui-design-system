/**
 * BhSourceEffectiveness - All Presets
 */

import type { BhSourceEffectivenessPreset } from '../core';
import { DetailedBhSourceEffectiveness } from './detailed';
import { CompactBhSourceEffectiveness } from './compact';

export { DetailedBhSourceEffectiveness } from './detailed';
export { CompactBhSourceEffectiveness } from './compact';

export const BH_SOURCE_EFFECTIVENESS_PRESETS: Record<BhSourceEffectivenessPreset, React.ComponentType<any>> = {
  'detailed': DetailedBhSourceEffectiveness,
  'compact': CompactBhSourceEffectiveness,
};
