/**
 * BhProctoringHeatmap - Main Export
 * Heatmap showing event density by hour and day of week
 */

import type { BhProctoringHeatmapProps } from './core';
import { BH_PROCTORING_HEATMAP_DEFAULTS } from './core';
import { BH_PROCTORING_HEATMAP_PRESETS } from './presets';

export {
  type BhProctoringHeatmapProps,
  type BhProctoringHeatmapPreset,
  type HeatmapDataPoint,
  BH_PROCTORING_HEATMAP_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringHeatmap component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringHeatmap(props: BhProctoringHeatmapProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_HEATMAP_DEFAULTS.preset ?? 'grid';
  const PresetComponent = BH_PROCTORING_HEATMAP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringHeatmap.displayName = 'BhProctoringHeatmap';

export { GridBhProctoringHeatmap, CompactBhProctoringHeatmap } from './presets';
