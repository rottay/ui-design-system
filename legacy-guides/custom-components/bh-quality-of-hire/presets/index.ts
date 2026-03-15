/**
 * BhQualityOfHire - All Presets
 */

import type { BhQualityOfHirePreset, BhQualityOfHireProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhQualityOfHire } from './compact';

export { CompactBhQualityOfHire } from './compact';

export const BH_QUALITY_OF_HIRE_PRESETS: Record<BhQualityOfHirePreset, ComponentType<BhQualityOfHireProps>> = {
  compact: CompactBhQualityOfHire,
};
