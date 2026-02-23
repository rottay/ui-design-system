/**
 * BhCorrelationHeatmap - Main Export
 * Grid-based heatmap visualization for correlation matrices
 * Automatically selects preset based on props
 */

import type { BhCorrelationHeatmapProps } from './core';
import { BH_CORRELATION_HEATMAP_DEFAULTS } from './core';
import { BH_CORRELATION_HEATMAP_PRESETS } from './presets';

export {
  type BhCorrelationHeatmapProps,
  type BhCorrelationHeatmapPreset,
  type HeatmapCell,
  type HeatmapAxis,
  BH_CORRELATION_HEATMAP_DEFAULTS,
} from './core';
export {
  getHeatmapCellColor,
  getHeatmapTextColor,
} from './core';
export * from './presets';

/**
 * BhCorrelationHeatmap component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCorrelationHeatmap(props: BhCorrelationHeatmapProps): React.ReactElement {
  const preset = props.preset ?? BH_CORRELATION_HEATMAP_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_CORRELATION_HEATMAP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCorrelationHeatmap.displayName = 'BhCorrelationHeatmap';

export { StandardBhCorrelationHeatmap } from './presets';
