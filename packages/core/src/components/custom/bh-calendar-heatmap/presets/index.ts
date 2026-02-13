/**
 * BhCalendarHeatmap - All Presets
 */

import type { BhCalendarHeatmapPreset } from '../core';
import { FullBhCalendarHeatmap } from './full';
import { CompactBhCalendarHeatmap } from './compact';

export { FullBhCalendarHeatmap } from './full';
export { CompactBhCalendarHeatmap } from './compact';

export const BH_CALENDAR_HEATMAP_PRESETS: Record<BhCalendarHeatmapPreset, React.ComponentType<any>> = {
  'full': FullBhCalendarHeatmap,
  'compact': CompactBhCalendarHeatmap,
};
