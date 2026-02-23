/**
 * BhControlChart - Main Export
 * SVG Statistical Process Control chart for interviewer scoring patterns.
 */

import type { BhControlChartProps } from './core';
import { BH_CONTROL_CHART_DEFAULTS } from './core';
import { BH_CONTROL_CHART_PRESETS } from './presets';

export {
  type BhControlChartProps,
  type BhControlChartPreset,
  type ControlChartData,
  type ControlChartDataPoint,
  type ControlChartLimits,
  BH_CONTROL_CHART_DEFAULTS,
} from './core';
export * from './presets';

export function BhControlChart(props: BhControlChartProps): React.ReactElement {
  const preset = props.preset ?? BH_CONTROL_CHART_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_CONTROL_CHART_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhControlChart.displayName = 'BhControlChart';

export { StandardBhControlChart } from './presets';
