/**
 * BhPipelineComparison - All Presets
 */

import type { BhPipelineComparisonPreset, BhPipelineComparisonProps } from '../core';
import type { ComponentType } from 'react';
import { SideBySideBhPipelineComparison } from './side-by-side';
import { OverlayBhPipelineComparison } from './overlay';

export { SideBySideBhPipelineComparison } from './side-by-side';
export { OverlayBhPipelineComparison } from './overlay';

export const BH_PIPELINE_COMPARISON_PRESETS: Record<BhPipelineComparisonPreset, ComponentType<BhPipelineComparisonProps>> = {
  'side-by-side': SideBySideBhPipelineComparison,
  'overlay': OverlayBhPipelineComparison,
};
