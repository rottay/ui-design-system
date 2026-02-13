/**
 * BhProctoringHeatmap - All Presets
 */

import type { BhProctoringHeatmapPreset } from '../core';
import { GridBhProctoringHeatmap } from './grid';
import { CompactBhProctoringHeatmap } from './compact';

export { GridBhProctoringHeatmap } from './grid';
export { CompactBhProctoringHeatmap } from './compact';

export const BH_PROCTORING_HEATMAP_PRESETS: Record<BhProctoringHeatmapPreset, React.ComponentType<any>> = {
  'grid': GridBhProctoringHeatmap,
  'compact': CompactBhProctoringHeatmap,
};
