/**
 * EvSeatingChart - Main Export
 * Large event seating with sections, rows, numbered seats, and price tiers
 */

import type { EvSeatingChartProps } from './core';
import { EV_SEATING_CHART_DEFAULTS } from './core';
import { EV_SEATING_CHART_PRESETS } from './presets';

export {
  type EvSeatingChartProps,
  type EvSeatingChartPreset,
  type SeatingSection as EvSeatingChartSeatingSection,
  type SeatInfo as EvSeatingChartSeatInfo,
  EV_SEATING_CHART_DEFAULTS,
} from './core';
export * from './presets';

export function EvSeatingChart(props: EvSeatingChartProps): React.ReactElement {
  const preset = props.preset ?? EV_SEATING_CHART_DEFAULTS.preset ?? 'editor';
  const PresetComponent = EV_SEATING_CHART_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvSeatingChart.displayName = 'EvSeatingChart';

export { EditorEvSeatingChart, AssignmentEvSeatingChart } from './presets';
