/**
 * BhWorkloadHeatmap - All Presets
 */

import type { BhWorkloadHeatmapPreset, BhWorkloadHeatmapProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhWorkloadHeatmap } from './compact';

export { CompactBhWorkloadHeatmap } from './compact';

export const BH_WORKLOAD_HEATMAP_PRESETS: Record<BhWorkloadHeatmapPreset, ComponentType<BhWorkloadHeatmapProps>> = {
  compact: CompactBhWorkloadHeatmap,
};
