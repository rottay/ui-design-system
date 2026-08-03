import { describe, expect, it } from 'vitest';

import type {
  AreaChartProps,
  BarChartProps,
  BulletChartProps,
  CalendarHeatMapProps,
  FunnelChartProps,
  GanttChartProps,
  GaugeChartProps,
  HeatMapProps,
  HistogramProps,
  LineChartProps,
  NetworkGraphProps,
  PieChartProps,
  RadarChartProps,
  SankeyChartProps,
  ScatterChartProps,
  TreeMapProps,
  WaterfallChartProps,
} from '..';

type Equal<TActual, TExpected> =
  (<T>() => T extends TActual ? 1 : 2) extends
  (<T>() => T extends TExpected ? 1 : 2)
    ? true
    : false;

type CapabilityKey =
  | 'legend'
  | 'colors'
  | 'colorScheme'
  | 'margin'
  | 'compact'
  | 'compactMode'
  | 'autoCompact'
  | 'compactBreakpoint';

type CompactCapabilityKey =
  | 'hideLegend'
  | 'compactTooltip'
  | 'minHeight'
  | 'maxTicks'
  | 'hideSeriesLabels';

type CapabilitiesOf<TProps> = Extract<keyof TProps, CapabilityKey>;
type CompactOf<TProps extends { compact?: unknown }> = NonNullable<TProps['compact']>;
type CompactCapabilitiesOf<TProps extends { compact?: unknown }> =
  Extract<keyof CompactOf<TProps>, CompactCapabilityKey>;

type CompactActivation = 'compact' | 'compactMode' | 'autoCompact' | 'compactBreakpoint';
type Legend = 'legend';
type Colors = 'colors';
type Scheme = 'colorScheme';
type Margin = 'margin';
type CompactCore = 'hideLegend' | 'compactTooltip' | 'minHeight';
type CompactCartesian = CompactCore | 'maxTicks';
type CompactSeriesLabels = CompactCore | 'hideSeriesLabels';

function typeContract<TContract extends true>(): true {
  return true;
}

// These compile-time assertions are deliberately kept beside the runtime
// behavior fixtures. Adding a broad capability back to ChartBaseProps, or
// widening a family's compact config, makes this test fail during typecheck.
const capabilityContract = [
  typeContract<Equal<CapabilitiesOf<AreaChartProps>, Legend | Colors | Scheme | Margin | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<BarChartProps>, Legend | Colors | Scheme | Margin | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<LineChartProps>, Legend | Colors | Scheme | Margin | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<BulletChartProps>, Legend | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<CalendarHeatMapProps>, Legend | Scheme>>(),
  typeContract<Equal<CapabilitiesOf<FunnelChartProps>, Legend | Colors | Margin>>(),
  typeContract<Equal<CapabilitiesOf<GanttChartProps>, Colors | Margin>>(),
  typeContract<Equal<CapabilitiesOf<GaugeChartProps>, Legend | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<HeatMapProps>, Legend | Margin>>(),
  typeContract<Equal<CapabilitiesOf<HistogramProps>, Legend | Margin | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<NetworkGraphProps>, Legend | Colors>>(),
  typeContract<Equal<CapabilitiesOf<PieChartProps>, Legend | Colors | Scheme | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<RadarChartProps>, Legend | Colors | Scheme>>(),
  typeContract<Equal<CapabilitiesOf<SankeyChartProps>, Legend | Colors | Margin>>(),
  typeContract<Equal<CapabilitiesOf<ScatterChartProps>, Legend | Colors | Margin | CompactActivation>>(),
  typeContract<Equal<CapabilitiesOf<TreeMapProps>, Legend | Colors | Scheme>>(),
  typeContract<Equal<CapabilitiesOf<WaterfallChartProps>, Legend | Margin | CompactActivation>>(),
  typeContract<Equal<CompactCapabilitiesOf<AreaChartProps>, CompactCartesian>>(),
  typeContract<Equal<CompactCapabilitiesOf<BarChartProps>, CompactCartesian>>(),
  typeContract<Equal<CompactCapabilitiesOf<LineChartProps>, CompactCartesian>>(),
  typeContract<Equal<CompactCapabilitiesOf<HistogramProps>, CompactCartesian>>(),
  typeContract<Equal<CompactCapabilitiesOf<ScatterChartProps>, CompactCartesian>>(),
  typeContract<Equal<CompactCapabilitiesOf<WaterfallChartProps>, CompactCartesian>>(),
  typeContract<Equal<CompactCapabilitiesOf<BulletChartProps>, CompactCore>>(),
  typeContract<Equal<CompactCapabilitiesOf<GaugeChartProps>, CompactCore>>(),
  typeContract<Equal<CompactCapabilitiesOf<PieChartProps>, CompactSeriesLabels>>(),
] as const;

describe('chart capability traits', () => {
  it('keeps every public family contract narrowed to implemented capabilities', () => {
    expect(capabilityContract.every(Boolean)).toBe(true);
  });
});
