/**
 * BhCalendarHeatmap - Main Export
 * 12-month activity heatmap for interviews scheduled
 */

import type { BhCalendarHeatmapProps } from './core';
import { BH_CALENDAR_HEATMAP_DEFAULTS } from './core';
import { BH_CALENDAR_HEATMAP_PRESETS } from './presets';

export {
  type BhCalendarHeatmapProps,
  type BhCalendarHeatmapPreset,
  type HeatmapDay,
  BH_CALENDAR_HEATMAP_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCalendarHeatmap component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCalendarHeatmap(props: BhCalendarHeatmapProps): React.ReactElement {
  const preset = props.preset ?? BH_CALENDAR_HEATMAP_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_CALENDAR_HEATMAP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCalendarHeatmap.displayName = 'BhCalendarHeatmap';
