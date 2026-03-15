/**
 * BhPipelineStatsBar - All Presets
 */

import type { BhPipelineStatsBarPreset, BhPipelineStatsBarProps } from '../core';
import type { ComponentType } from 'react';
import { DetailedBhPipelineStatsBar } from './detailed';
import { CompactBhPipelineStatsBar } from './compact';

export { DetailedBhPipelineStatsBar } from './detailed';
export { CompactBhPipelineStatsBar } from './compact';

export const BH_PIPELINE_STATS_BAR_PRESETS: Record<BhPipelineStatsBarPreset, ComponentType<BhPipelineStatsBarProps>> = {
  'detailed': DetailedBhPipelineStatsBar,
  'compact': CompactBhPipelineStatsBar,
};
