/**
 * BhSimulationChart - Main Export
 * SVG histogram for simulation distribution visualization
 * Automatically selects preset based on props
 */

import type { BhSimulationChartProps } from './core';
import { BH_SIMULATION_CHART_DEFAULTS } from './core';
import { BH_SIMULATION_CHART_PRESETS } from './presets';

export {
  type BhSimulationChartProps,
  type BhSimulationChartPreset,
  type DistributionData,
  BH_SIMULATION_CHART_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSimulationChart component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSimulationChart(props: BhSimulationChartProps): React.ReactElement {
  const preset = props.preset ?? BH_SIMULATION_CHART_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_SIMULATION_CHART_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSimulationChart.displayName = 'BhSimulationChart';

export { StandardBhSimulationChart } from './presets';
