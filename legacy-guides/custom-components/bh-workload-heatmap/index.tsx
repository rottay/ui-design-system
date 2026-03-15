/**
 * BhWorkloadHeatmap - Main Export
 * Dashboard widget showing recruiter workload distribution as a heatmap.
 */

import type { BhWorkloadHeatmapProps } from './core';
import { BH_WORKLOAD_HEATMAP_DEFAULTS } from './core';
import { BH_WORKLOAD_HEATMAP_PRESETS } from './presets';

export {
  type BhWorkloadHeatmapProps,
  type BhWorkloadHeatmapPreset,
  type WorkloadHeatmapData,
  type RecruiterWorkload,
  BH_WORKLOAD_HEATMAP_DEFAULTS,
} from './core';
export * from './presets';

export function BhWorkloadHeatmap(props: BhWorkloadHeatmapProps): React.ReactElement {
  const preset = props.preset ?? BH_WORKLOAD_HEATMAP_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_WORKLOAD_HEATMAP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhWorkloadHeatmap.displayName = 'BhWorkloadHeatmap';

export { CompactBhWorkloadHeatmap } from './presets';
