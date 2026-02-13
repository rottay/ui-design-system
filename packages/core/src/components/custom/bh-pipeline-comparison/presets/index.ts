/**
 * BhPipelineComparison - All Presets
 */

import type { BhPipelineComparisonPreset } from '../core';
import { SideBySideBhPipelineComparison } from './side-by-side';
import { OverlayBhPipelineComparison } from './overlay';

export { SideBySideBhPipelineComparison } from './side-by-side';
export { OverlayBhPipelineComparison } from './overlay';

export const BH_PIPELINE_COMPARISON_PRESETS: Record<BhPipelineComparisonPreset, React.ComponentType<any>> = {
  'side-by-side': SideBySideBhPipelineComparison,
  'overlay': OverlayBhPipelineComparison,
};
