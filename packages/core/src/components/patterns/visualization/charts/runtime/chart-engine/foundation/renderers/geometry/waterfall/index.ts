import { scaleBand, scaleLinear } from 'd3';

import {
  DEFAULT_CARTESIAN_INSETS,
  finiteSize,
  normalizeInsets,
  plotRect,
  tickLabel,
  boundedSample,
  type ChartGeometryInsets,
  type ChartGeometryRect,
  type ChartGeometryTick,
} from '../foundation';

// ---------------------------------------------------------------------------
// Waterfall geometry (running-total bars + connectors)
// ---------------------------------------------------------------------------

export type SvgWaterfallType = 'increase' | 'decrease' | 'total';

export interface SvgWaterfallDatum {
  readonly label: string;
  readonly value: number;
  readonly type?: SvgWaterfallType;
}

export interface SvgWaterfallBar {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly type: SvgWaterfallType;
  readonly start: number;
  readonly end: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly valueX: number;
  readonly valueY: number;
  readonly valueAnchor: 'start' | 'middle' | 'end';
  readonly valueBaseline?: 'middle';
}

export interface SvgWaterfallConnector {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface SvgWaterfallGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly orientation: 'vertical' | 'horizontal';
  readonly baseline: number;
  readonly bars: readonly SvgWaterfallBar[];
  readonly connectors: readonly SvgWaterfallConnector[];
  readonly categoryTicks: readonly ChartGeometryTick[];
  readonly valueTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgWaterfallGeometryOptions {
  readonly data: readonly SvgWaterfallDatum[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly insets?: ChartGeometryInsets;
  readonly bandPadding?: number;
  readonly maxTicks?: number;
}

function resolveWaterfallType(point: SvgWaterfallDatum): SvgWaterfallType {
  if (point.type) return point.type;
  return point.value >= 0 ? 'increase' : 'decrease';
}

interface ComputedWaterfallBar {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly type: SvgWaterfallType;
  readonly start: number;
  readonly end: number;
}

/**
 * Builds immutable waterfall geometry. Each bar begins where the previous one
 * ended (running total); `total` bars always anchor to zero. Increase,
 * decrease, and total tones are resolved by the renderer through semantic
 * status tokens rather than the categorical palette.
 */
export function buildSvgWaterfallGeometry({
  data,
  width: widthInput,
  height: heightInput,
  orientation = 'vertical',
  insets: insetsInput,
  bandPadding = 0.3,
  maxTicks = 5,
}: BuildSvgWaterfallGeometryOptions): SvgWaterfallGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const tickCount = Number.isSafeInteger(maxTicks) ? Math.max(2, maxTicks) : 5;
  const padding = Number.isFinite(bandPadding) ? Math.min(0.95, Math.max(0, bandPadding)) : 0.3;

  let runningTotal = 0;
  const computed: ComputedWaterfallBar[] = [];
  data.forEach((point, index) => {
    if (!Number.isFinite(point.value)) return;
    const key = String(index);
    const type = resolveWaterfallType(point);
    if (type === 'total') {
      computed.push({ key, label: point.label, value: point.value, type, start: 0, end: point.value });
      return;
    }
    const start = runningTotal;
    const next = runningTotal + point.value;
    if (!Number.isFinite(next)) return;
    runningTotal = next;
    computed.push({ key, label: point.label, value: point.value, type, start, end: next });
  });

  const allValues = computed.flatMap((currentBar) => [currentBar.start, currentBar.end]);
  const domainMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const domainMax = allValues.length > 0 ? Math.max(...allValues) : 0;
  const domain: [number, number] = domainMin === domainMax
    ? [Math.min(0, domainMin), Math.max(1, domainMax)]
    : [Math.min(0, domainMin), Math.max(0, domainMax)];

  const categoryScale = scaleBand<string>()
    .domain(computed.map((currentBar) => currentBar.key))
    .range(orientation === 'vertical' ? [plot.x, plot.x + plot.width] : [plot.y, plot.y + plot.height])
    .padding(padding);
  const valueScale = scaleLinear()
    .domain(domain)
    .nice(tickCount)
    .range(orientation === 'vertical' ? [plot.y + plot.height, plot.y] : [plot.x, plot.x + plot.width]);
  const baseline = valueScale(0);

  const bars = computed.map<SvgWaterfallBar>((currentBar) => {
    const bandPosition = categoryScale(currentBar.key) ?? 0;
    const bandwidth = categoryScale.bandwidth();
    if (orientation === 'vertical') {
      const topY = valueScale(Math.max(currentBar.start, currentBar.end));
      const bottomY = valueScale(Math.min(currentBar.start, currentBar.end));
      return {
        ...currentBar,
        x: bandPosition,
        y: topY,
        width: bandwidth,
        height: Math.abs(valueScale(currentBar.start) - valueScale(currentBar.end)),
        valueX: bandPosition + bandwidth / 2,
        valueY: currentBar.value >= 0 ? topY - 5 : bottomY + 14,
        valueAnchor: 'middle',
      };
    }
    const leftX = valueScale(Math.min(currentBar.start, currentBar.end));
    const rightX = valueScale(Math.max(currentBar.start, currentBar.end));
    return {
      ...currentBar,
      x: leftX,
      y: bandPosition,
      width: Math.abs(valueScale(currentBar.end) - valueScale(currentBar.start)),
      height: bandwidth,
      valueX: currentBar.value >= 0 ? rightX + 5 : leftX - 5,
      valueY: bandPosition + bandwidth / 2,
      valueAnchor: currentBar.value >= 0 ? 'start' : 'end',
      valueBaseline: 'middle',
    };
  });

  const connectors = computed.flatMap<SvgWaterfallConnector>((currentBar, index) => {
    const nextBar = computed[index + 1];
    if (!nextBar) return [];
    const bandPosition = categoryScale(currentBar.key) ?? 0;
    const bandwidth = categoryScale.bandwidth();
    const nextPosition = categoryScale(nextBar.key) ?? 0;
    if (orientation === 'vertical') {
      const yPosition = valueScale(currentBar.end);
      return [{ id: `connector-${currentBar.key}`, x1: bandPosition + bandwidth, y1: yPosition, x2: nextPosition, y2: yPosition }];
    }
    const xPosition = valueScale(currentBar.end);
    return [{ id: `connector-${currentBar.key}`, x1: xPosition, y1: bandPosition + bandwidth, x2: xPosition, y2: nextPosition }];
  });

  const categoryTicks = computed.map<ChartGeometryTick>((currentBar) => {
    const position = (categoryScale(currentBar.key) ?? 0) + categoryScale.bandwidth() / 2;
    return orientation === 'vertical'
      ? { id: `category-${currentBar.key}`, label: currentBar.label, value: currentBar.label, x: position, y: plot.y + plot.height }
      : { id: `category-${currentBar.key}`, label: currentBar.label, value: currentBar.label, x: plot.x, y: position };
  });
  const valueTicks = boundedSample(valueScale.ticks(tickCount), tickCount).map<ChartGeometryTick>((value) =>
    orientation === 'vertical'
      ? { id: `value-${value}`, label: tickLabel(value), value, x: plot.x, y: valueScale(value) }
      : { id: `value-${value}`, label: tickLabel(value), value, x: valueScale(value), y: plot.y + plot.height },
  );

  return {
    width,
    height,
    plot,
    orientation,
    baseline,
    bars: Object.freeze(bars),
    connectors: Object.freeze(connectors),
    categoryTicks: Object.freeze(categoryTicks),
    valueTicks: Object.freeze(valueTicks),
  };
}
