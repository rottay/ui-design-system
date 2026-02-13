/**
 * BhPipelineStatsBar - All Presets
 */

import type { BhPipelineStatsBarPreset } from '../core';
import { DetailedBhPipelineStatsBar } from './detailed';
import { CompactBhPipelineStatsBar } from './compact';

export { DetailedBhPipelineStatsBar } from './detailed';
export { CompactBhPipelineStatsBar } from './compact';

export const BH_PIPELINE_STATS_BAR_PRESETS: Record<BhPipelineStatsBarPreset, React.ComponentType<any>> = {
  'detailed': DetailedBhPipelineStatsBar,
  'compact': CompactBhPipelineStatsBar,
};
