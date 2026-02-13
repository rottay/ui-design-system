/**
 * BhPipelineVelocityChart - Main Export
 * Line chart showing candidates processed per day over configurable periods
 */

import type { BhPipelineVelocityChartProps } from './core';
import { BH_PIPELINE_VELOCITY_CHART_DEFAULTS } from './core';
import { BH_PIPELINE_VELOCITY_CHART_PRESETS } from './presets';

export {
  type BhPipelineVelocityChartProps,
  type BhPipelineVelocityChartPreset,
  type VelocityPeriod,
  type VelocityDataPoint,
  BH_PIPELINE_VELOCITY_CHART_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineVelocityChart component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineVelocityChart(props: BhPipelineVelocityChartProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_VELOCITY_CHART_DEFAULTS.preset ?? 'line';
  const PresetComponent = BH_PIPELINE_VELOCITY_CHART_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineVelocityChart.displayName = 'BhPipelineVelocityChart';

export { LineBhPipelineVelocityChart, CompactBhPipelineVelocityChart } from './presets';
