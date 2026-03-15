/**
 * BhProctoringHeatmap - All Presets
 */

import type { BhProctoringHeatmapPreset, BhProctoringHeatmapProps } from '../core';
import type { ComponentType } from 'react';
import { GridBhProctoringHeatmap } from './grid';
import { CompactBhProctoringHeatmap } from './compact';

export { GridBhProctoringHeatmap } from './grid';
export { CompactBhProctoringHeatmap } from './compact';

export const BH_PROCTORING_HEATMAP_PRESETS: Record<BhProctoringHeatmapPreset, ComponentType<BhProctoringHeatmapProps>> = {
  'grid': GridBhProctoringHeatmap,
  'compact': CompactBhProctoringHeatmap,
};
