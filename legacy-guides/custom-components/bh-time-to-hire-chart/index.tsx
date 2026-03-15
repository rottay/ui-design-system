/**
 * BhTimeToHireChart - Main Export
 * Multi-line chart by department with rolling avg and target line
 */

import type { BhTimeToHireChartProps } from './core';
import { BH_TIME_TO_HIRE_CHART_DEFAULTS } from './core';
import { BH_TIME_TO_HIRE_CHART_PRESETS } from './presets';

export {
  type BhTimeToHireChartProps,
  type BhTimeToHireChartPreset,
  type TimeToHireDataPoint,
  type DepartmentConfig,
  BH_TIME_TO_HIRE_CHART_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhTimeToHireChart component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTimeToHireChart(props: BhTimeToHireChartProps): React.ReactElement {
  const preset = props.preset ?? BH_TIME_TO_HIRE_CHART_DEFAULTS.preset ?? 'chart';
  const PresetComponent = BH_TIME_TO_HIRE_CHART_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTimeToHireChart.displayName = 'BhTimeToHireChart';
