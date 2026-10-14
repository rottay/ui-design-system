import { scaleLinear, scaleSqrt } from 'd3';

import {
  DEFAULT_CARTESIAN_INSETS,
  MAX_CARTESIAN_TICKS,
  finiteSize,
  normalizeInsets,
  plotRect,
  expandedDomain,
  tickLabel,
  boundedSample,
  assertUniqueStrings,
  type ChartGeometryInsets,
  type ChartGeometryRect,
  type ChartGeometryTick,
} from '../kernel';

export type SvgScatterVariant = 'scatter' | 'bubble';

export interface SvgScatterDatum {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  /** Bubble magnitude. Ignored by the fixed-radius scatter variant. */
  readonly size?: number;
  /** Optional semantic series used to resolve a provider-owned palette channel. */
  readonly series?: string;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly sizeLabel?: string;
  readonly ariaLabel?: string;
}

export interface SvgScatterGeometryDatum extends SvgScatterDatum {
  readonly xPosition: number;
  readonly yPosition: number;
  readonly radius: number;
  readonly seriesIndex: number;
}

/** Least-squares trend segment in plot pixel space (endpoints at the x-domain edges). */
export interface SvgScatterTrendLine {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface SvgScatterGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly variant: SvgScatterVariant;
  readonly xDomain: readonly [number, number];
  readonly yDomain: readonly [number, number];
  readonly sizeDomain: readonly [number, number] | null;
  readonly points: readonly SvgScatterGeometryDatum[];
  readonly xTicks: readonly ChartGeometryTick[];
  readonly yTicks: readonly ChartGeometryTick[];
  /** Least-squares regression segment, or null when unrequested or non-finite. */
  readonly trend: SvgScatterTrendLine | null;
}

export interface BuildSvgScatterGeometryOptions {
  readonly data: readonly SvgScatterDatum[];
  readonly width: number;
  readonly height: number;
  readonly variant?: SvgScatterVariant;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
  readonly pointRadius?: number;
  /** Minimum visible and maximum bubble radii. Zero magnitudes remain radius zero. */
  readonly bubbleRadiusRange?: readonly [number, number];
  /** Compute a least-squares regression segment across the plotted points. */
  readonly trendLine?: boolean;
}

/**
 * Ordinary least-squares fit over the plotted points. Mirrors the historical
 * ScatterChart family maths so the migrated trend segment is value-stable:
 * returns null for fewer than two points or any non-finite intermediate.
 */
function scatterTrend(
  points: readonly { readonly x: number; readonly y: number }[],
): { slope: number; intercept: number } | null {
  if (points.length < 2) return null;
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }
  const denominator = n * sumXX - sumX * sumX;
  if (!Number.isFinite(denominator) || denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return null;
  return { slope, intercept };
}

function scatterDomain(values: readonly number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return expandedDomain(minimum, maximum);

  const padding = (maximum - minimum) * 0.05;
  return [minimum - padding, maximum + padding];
}

/**
 * Builds deterministic Cartesian geometry for scatter and bubble plots.
 * Bubble area uses a square-root scale; D3 owns only numeric scales while
 * React retains every semantic, focusable SVG node.
 */
export function buildSvgScatterGeometry({
  data,
  width: widthInput,
  height: heightInput,
  variant = 'scatter',
  insets: insetsInput,
  maxTicks = 5,
  pointRadius = 5,
  bubbleRadiusRange = [4, 24],
  trendLine = false,
}: BuildSvgScatterGeometryOptions): SvgScatterGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const tickCount = Number.isSafeInteger(maxTicks)
    ? Math.min(MAX_CARTESIAN_TICKS, Math.max(2, maxTicks))
    : 5;
  const finiteData = data.filter((datum) => (
    Number.isFinite(datum.x)
    && Number.isFinite(datum.y)
    && (variant !== 'bubble' || datum.size === undefined || Number.isFinite(datum.size))
  ));
  assertUniqueStrings(finiteData.map((datum) => datum.id), 'scatter datum id');

  if (variant === 'bubble') {
    const negative = finiteData.find((datum) => (datum.size ?? 1) < 0);
    if (negative) {
      throw new TypeError(
        `[ChartGeometry] Bubble datum ${negative.id} has a negative size (${negative.size}).`,
      );
    }
  }

  const xScale = scaleLinear()
    .domain(scatterDomain(finiteData.map((datum) => datum.x)))
    .nice(tickCount)
    .range([plot.x, plot.x + plot.width]);
  const yScale = scaleLinear()
    .domain(scatterDomain(finiteData.map((datum) => datum.y)))
    .nice(tickCount)
    .range([plot.y + plot.height, plot.y]);
  const normalizedPointRadius = Number.isFinite(pointRadius)
    ? Math.min(24, Math.max(1, pointRadius))
    : 5;
  const requestedMinimumRadius = Number.isFinite(bubbleRadiusRange[0])
    ? Math.min(16, Math.max(1, bubbleRadiusRange[0]))
    : 4;
  const requestedMaximumRadius = Number.isFinite(bubbleRadiusRange[1])
    ? Math.min(48, Math.max(requestedMinimumRadius, bubbleRadiusRange[1]))
    : 24;
  const sizes = variant === 'bubble'
    ? finiteData.map((datum) => datum.size ?? 1)
    : [];
  const maximumSize = sizes.length > 0 ? Math.max(...sizes) : 0;
  const sizeDomain: readonly [number, number] | null = variant === 'bubble'
    ? [0, maximumSize > 0 ? maximumSize : 1]
    : null;
  const sizeScale = sizeDomain
    ? scaleSqrt().domain(sizeDomain).range([0, requestedMaximumRadius])
    : null;
  const seriesIndices = new Map<string, number>();

  const points = finiteData.map<SvgScatterGeometryDatum>((datum) => {
    const series = datum.series ?? 'default';
    let seriesIndex = seriesIndices.get(series);
    if (seriesIndex === undefined) {
      seriesIndex = seriesIndices.size;
      seriesIndices.set(series, seriesIndex);
    }
    const magnitude = datum.size ?? 1;
    const scaledRadius = sizeScale?.(magnitude) ?? normalizedPointRadius;
    const radius = variant === 'bubble'
      ? magnitude === 0
        ? 0
        : Math.max(requestedMinimumRadius, scaledRadius)
      : normalizedPointRadius;

    return {
      ...datum,
      xPosition: xScale(datum.x),
      yPosition: yScale(datum.y),
      radius,
      seriesIndex,
    };
  });
  const xTicks = boundedSample(xScale.ticks(tickCount), tickCount).map<ChartGeometryTick>((value) => ({
    id: `x-${value}`,
    label: tickLabel(value),
    value,
    x: xScale(value),
    y: plot.y + plot.height,
  }));
  const yTicks = boundedSample(yScale.ticks(tickCount), tickCount).map<ChartGeometryTick>((value) => ({
    id: `y-${value}`,
    label: tickLabel(value),
    value,
    x: plot.x,
    y: yScale(value),
  }));
  const xDomain = xScale.domain() as [number, number];
  const yDomain = yScale.domain() as [number, number];

  // Trend segment: fit in data space, then project the two x-domain edges into
  // plot pixels. A non-finite projection (extreme domains) yields no segment.
  const regression = trendLine ? scatterTrend(finiteData) : null;
  let trend: SvgScatterTrendLine | null = null;
  if (regression) {
    const x1 = xScale(xDomain[0]);
    const y1 = yScale(regression.slope * xDomain[0] + regression.intercept);
    const x2 = xScale(xDomain[1]);
    const y2 = yScale(regression.slope * xDomain[1] + regression.intercept);
    if ([x1, y1, x2, y2].every((value) => Number.isFinite(value))) {
      trend = { x1, y1, x2, y2 };
    }
  }

  return {
    width,
    height,
    plot,
    variant,
    xDomain: Object.freeze(xDomain),
    yDomain: Object.freeze(yDomain),
    sizeDomain,
    points: Object.freeze(points),
    xTicks: Object.freeze(xTicks),
    yTicks: Object.freeze(yTicks),
    trend,
  };
}
