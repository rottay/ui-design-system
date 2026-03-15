/**
 * BhBurnoutDetection - All Presets
 */

import type { BhBurnoutDetectionPreset, BhBurnoutDetectionProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhBurnoutDetection } from './compact';

export { CompactBhBurnoutDetection } from './compact';

export const BH_BURNOUT_DETECTION_PRESETS: Record<BhBurnoutDetectionPreset, ComponentType<BhBurnoutDetectionProps>> = {
  compact: CompactBhBurnoutDetection,
};
