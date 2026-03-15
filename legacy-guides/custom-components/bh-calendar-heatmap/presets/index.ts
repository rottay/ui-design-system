/**
 * BhCalendarHeatmap - All Presets
 */

import type { BhCalendarHeatmapPreset, BhCalendarHeatmapProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhCalendarHeatmap } from './full';
import { CompactBhCalendarHeatmap } from './compact';

export { FullBhCalendarHeatmap } from './full';
export { CompactBhCalendarHeatmap } from './compact';

export const BH_CALENDAR_HEATMAP_PRESETS: Record<BhCalendarHeatmapPreset, ComponentType<BhCalendarHeatmapProps>> = {
  'full': FullBhCalendarHeatmap,
  'compact': CompactBhCalendarHeatmap,
};
