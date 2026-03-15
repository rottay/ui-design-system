/**
 * BhInterviewQuality - All Presets
 */

import type { BhInterviewQualityPreset, BhInterviewQualityProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhInterviewQuality } from './compact';

export { CompactBhInterviewQuality } from './compact';

export const BH_INTERVIEW_QUALITY_PRESETS: Record<BhInterviewQualityPreset, ComponentType<BhInterviewQualityProps>> = {
  compact: CompactBhInterviewQuality,
};
