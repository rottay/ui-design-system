/**
 * Immutable geometry builders for the React-owned SVG chart renderers.
 *
 * D3 is deliberately limited to scales, paths and interpolation. This module
 * never selects, appends, removes or mutates DOM nodes.
 */

import {
  area,
  color as parseColor,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  interpolateRgb,
  line,
  scaleBand,
  scaleLinear,
  scalePoint,
  scaleSequential,
  scaleUtc,
} from 'd3';

import { DEFAULT_COLORS } from '../../Charts.types';

export interface ChartGeometryInsets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export interface ChartGeometryRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ChartGeometryTick {
  readonly id: string;
  readonly label: string;
  readonly value: string | number;
  readonly x: number;
  readonly y: number;
}

export const DEFAULT_CARTESIAN_INSETS: ChartGeometryInsets = Object.freeze({
  top: 16,
  right: 16,
  bottom: 44,
  left: 52,
});

export const DEFAULT_HEATMAP_INSETS: ChartGeometryInsets = Object.freeze({
  top: 16,
  right: 16,
  bottom: 58,
  left: 76,
});

function finiteSize(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function finiteInset(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeInsets(
  value: ChartGeometryInsets | undefined,
  fallback: ChartGeometryInsets,
): ChartGeometryInsets {
  const source = value ?? fallback;
  return {
    top: finiteInset(source.top),
    right: finiteInset(source.right),
    bottom: finiteInset(source.bottom),
    left: finiteInset(source.left),
  };
}

function plotRect(
  width: number,
  height: number,
  insets: ChartGeometryInsets,
): ChartGeometryRect {
  const left = Math.min(insets.left, width);
  const right = Math.min(insets.right, Math.max(0, width - left));
  const top = Math.min(insets.top, height);
  const bottom = Math.min(insets.bottom, Math.max(0, height - top));
  return {
    x: left,
    y: top,
    width: Math.max(0, width - left - right),
    height: Math.max(0, height - top - bottom),
  };
}

function zeroAnchoredDomain(values: readonly number[]): [number, number] {
  let minimum = 0;
  let maximum = 0;
  let hasFinite = false;

  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    hasFinite = true;
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }

  if (!hasFinite || minimum === maximum) return [0, 1];
  return [minimum, maximum];
}

function expandedDomain(minimum: number, maximum: number): [number, number] {
  if (minimum !== maximum) return [minimum, maximum];
  const delta = Math.max(Math.abs(minimum) * 0.01, 1);
  const lower = minimum - delta;
  const upper = maximum + delta;
  if (Number.isFinite(lower) && Number.isFinite(upper) && lower < upper) {
    return [lower, upper];
  }
  if (minimum > 0) return [0, minimum];
  if (minimum < 0) return [minimum, 0];
  return [-1, 1];
}

function sequentialDomain(values: readonly number[]): [number, number] {
  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }

  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return [0, 1];
  if (minimum !== maximum) return [minimum, maximum];
  if (minimum > 0) return [0, minimum];
  if (minimum < 0) return [minimum, 0];
  return [0, 1];
}

function tickLabel(value: number): string {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  if (absolute >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (absolute >= 1_000) return `${Number((value / 1_000).toFixed(1))}K`;
  return Number(value.toFixed(2)).toString();
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function boundedSample<T>(values: readonly T[], maximum: number): T[] {
  if (values.length <= maximum) return [...values];
  if (maximum <= 1) return values.length > 0 ? [values[0] as T] : [];

  const indices = new Set<number>();
  for (let index = 0; index < maximum; index += 1) {
    indices.add(Math.round((index * (values.length - 1)) / (maximum - 1)));
  }
  return [...indices].map((index) => values[index] as T);
}

function assertUniqueStrings(values: readonly string[], subject: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new TypeError(`[ChartGeometry] Duplicate ${subject}: ${value}.`);
    }
    seen.add(value);
  }
}

function normalizedConcreteColor(value: string, fallback: string): string {
  return parseColor(value)?.formatRgb() ?? fallback;
}

export interface SvgBarDatum {
  readonly id: string;
  readonly category: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
  readonly color?: string;
}

export interface SvgBarGeometryDatum extends SvgBarDatum, ChartGeometryRect {
  readonly valueX: number;
  readonly valueY: number;
}

export interface SvgBarGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly orientation: 'vertical' | 'horizontal';
  readonly baseline: number;
  readonly bars: readonly SvgBarGeometryDatum[];
  readonly categoryTicks: readonly ChartGeometryTick[];
  readonly valueTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgBarGeometryOptions {
  readonly data: readonly SvgBarDatum[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly insets?: ChartGeometryInsets;
  readonly bandPadding?: number;
  readonly maxTicks?: number;
}

export function buildSvgBarGeometry({
  data,
  width: widthInput,
  height: heightInput,
  orientation = 'vertical',
  insets: insetsInput,
  bandPadding = 0.2,
  maxTicks = 5,
}: BuildSvgBarGeometryOptions): SvgBarGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const finiteData = data.filter((datum) => Number.isFinite(datum.value));
  assertUniqueStrings(finiteData.map((datum) => datum.id), 'bar datum id');
  assertUniqueStrings(finiteData.map((datum) => datum.category), 'bar category');
  const categories = uniqueStrings(finiteData.map((datum) => datum.category));
  const padding = Number.isFinite(bandPadding)
    ? Math.min(0.95, Math.max(0, bandPadding))
    : 0.2;
  const tickCount = Number.isSafeInteger(maxTicks) ? Math.max(2, maxTicks) : 5;
  const valueScale = scaleLinear()
    .domain(zeroAnchoredDomain(finiteData.map((datum) => datum.value)))
    .nice(tickCount)
    .range(
      orientation === 'vertical'
        ? [plot.y + plot.height, plot.y]
        : [plot.x, plot.x + plot.width],
    );
  const categoryScale = scaleBand<string>()
    .domain(categories)
    .range(
      orientation === 'vertical'
        ? [plot.x, plot.x + plot.width]
        : [plot.y, plot.y + plot.height],
    )
    .padding(padding);
  const baseline = valueScale(0);

  const bars = finiteData.map<SvgBarGeometryDatum>((datum) => {
    const categoryPosition = categoryScale(datum.category) ?? 0;
    const endpoint = valueScale(datum.value);

    if (orientation === 'vertical') {
      return {
        ...datum,
        x: categoryPosition,
        y: Math.min(endpoint, baseline),
        width: categoryScale.bandwidth(),
        height: Math.abs(endpoint - baseline),
        valueX: categoryPosition + categoryScale.bandwidth() / 2,
        valueY: datum.value >= 0 ? endpoint - 6 : endpoint + 14,
      };
    }

    return {
      ...datum,
      x: Math.min(endpoint, baseline),
      y: categoryPosition,
      width: Math.abs(endpoint - baseline),
      height: categoryScale.bandwidth(),
      valueX: datum.value >= 0 ? endpoint + 6 : endpoint - 6,
      valueY: categoryPosition + categoryScale.bandwidth() / 2,
    };
  });

  const categoryTicks = boundedSample(categories, tickCount).map<ChartGeometryTick>((category) => {
    const position = (categoryScale(category) ?? 0) + categoryScale.bandwidth() / 2;
    return orientation === 'vertical'
      ? { id: `category-${category}`, label: category, value: category, x: position, y: plot.y + plot.height }
      : { id: `category-${category}`, label: category, value: category, x: plot.x, y: position };
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
    categoryTicks: Object.freeze(categoryTicks),
    valueTicks: Object.freeze(valueTicks),
  };
}

export type SvgLineXValue = string | number;
export type SvgLineXType = 'category' | 'linear' | 'time';
export type SvgLineCurve = 'linear' | 'smooth' | 'step';

export interface SvgLinePoint {
  readonly id: string;
  readonly x: SvgLineXValue;
  readonly value: number;
  readonly xLabel?: string;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
}

export interface SvgLineSeries {
  readonly id: string;
  readonly label: string;
  readonly color?: string;
  readonly points: readonly SvgLinePoint[];
}

export interface SvgLineGeometryPoint extends SvgLinePoint {
  readonly xPosition: number;
  readonly yPosition: number;
}

export interface SvgLineGeometrySeries {
  readonly id: string;
  readonly label: string;
  readonly seriesColor?: string;
  readonly path: string;
  readonly areaPath?: string;
  readonly points: readonly SvgLineGeometryPoint[];
}

export interface SvgLineGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly baseline: number;
  readonly series: readonly SvgLineGeometrySeries[];
  readonly xTicks: readonly ChartGeometryTick[];
  readonly yTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgLineGeometryOptions {
  readonly series: readonly SvgLineSeries[];
  readonly width: number;
  readonly height: number;
  readonly xType?: SvgLineXType;
  readonly curve?: SvgLineCurve;
  readonly showArea?: boolean;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
}

function lineXNumber(value: SvgLineXValue, xType: SvgLineXType): number | null {
  if (xType === 'linear') {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }
  if (xType === 'time') {
    let result: number;
    if (typeof value === 'number') {
      result = value;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      result = Date.parse(`${value}T00:00:00.000Z`);
    } else if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
      result = Date.parse(value);
    } else {
      return null;
    }
    return Number.isFinite(result) && Number.isFinite(new Date(result).getTime())
      ? result
      : null;
  }
  return null;
}

function validLinePoint(point: SvgLinePoint, xType: SvgLineXType): boolean {
  if (!Number.isFinite(point.value)) return false;
  if (xType === 'category') return typeof point.x === 'string' || Number.isFinite(point.x);
  return lineXNumber(point.x, xType) !== null;
}

function timeTickLabel(value: number, span: number): string {
  const iso = new Date(value).toISOString();
  if (span < 60_000) return `${iso.slice(11, 23)}Z`;
  if (span <= 7 * 86_400_000) return `${iso.slice(5, 10)} ${iso.slice(11, 16)}Z`;
  if (span <= 370 * 86_400_000) return iso.slice(0, 10);
  return iso.slice(0, 7);
}

export function buildSvgLineGeometry({
  series,
  width: widthInput,
  height: heightInput,
  xType = 'category',
  curve = 'linear',
  showArea = false,
  insets: insetsInput,
  maxTicks = 5,
}: BuildSvgLineGeometryOptions): SvgLineGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const tickCount = Number.isSafeInteger(maxTicks) ? Math.max(2, maxTicks) : 5;
  const finiteSeries = series.map((currentSeries) => ({
    ...currentSeries,
    points: currentSeries.points.filter((point) => validLinePoint(point, xType)),
  }));
  assertUniqueStrings(finiteSeries.map((currentSeries) => currentSeries.id), 'line series id');
  for (const currentSeries of finiteSeries) {
    assertUniqueStrings(
      currentSeries.points.map((point) => point.id),
      `line point id in series ${currentSeries.id}`,
    );
  }
  const allPoints = finiteSeries.flatMap((currentSeries) => currentSeries.points);
  const yScale = scaleLinear()
    .domain(zeroAnchoredDomain(allPoints.map((point) => point.value)))
    .nice(tickCount)
    .range([plot.y + plot.height, plot.y]);
  const baseline = yScale(0);

  let resolveX: (value: SvgLineXValue) => number;
  let xTicks: ChartGeometryTick[];

  if (xType === 'category') {
    const categories = uniqueStrings(allPoints.map((point) => String(point.x)));
    const xScale = scalePoint<string>()
      .domain(categories)
      .range([plot.x, plot.x + plot.width])
      .padding(0.25);
    resolveX = (value) => xScale(String(value)) ?? plot.x;
    xTicks = boundedSample(categories, tickCount)
      .map((category) => ({
        id: `x-${category}`,
        label: category,
        value: category,
        x: resolveX(category),
        y: plot.y + plot.height,
      }));
  } else if (xType === 'time') {
    const xValues = allPoints
      .map((point) => lineXNumber(point.x, xType))
      .filter((value): value is number => value !== null);
    const minimum = xValues.length > 0 ? Math.min(...xValues) : 0;
    const maximum = xValues.length > 0 ? Math.max(...xValues) : 1;
    const [domainMinimum, domainMaximum] = expandedDomain(minimum, maximum);
    const xScale = scaleUtc()
      .domain([new Date(domainMinimum), new Date(domainMaximum)])
      .nice(tickCount)
      .range([plot.x, plot.x + plot.width]);
    resolveX = (value) => xScale(new Date(lineXNumber(value, xType) ?? minimum));
    const span = domainMaximum - domainMinimum;
    xTicks = boundedSample(xScale.ticks(tickCount), tickCount).map((value) => ({
      id: `x-${value.getTime()}`,
      label: timeTickLabel(value.getTime(), span),
      value: value.getTime(),
      x: xScale(value),
      y: plot.y + plot.height,
    }));
  } else {
    const xValues = allPoints
      .map((point) => lineXNumber(point.x, xType))
      .filter((value): value is number => value !== null);
    const minimum = xValues.length > 0 ? Math.min(...xValues) : 0;
    const maximum = xValues.length > 0 ? Math.max(...xValues) : 1;
    const xScale = scaleLinear()
      .domain(expandedDomain(minimum, maximum))
      .nice(tickCount)
      .range([plot.x, plot.x + plot.width]);
    resolveX = (value) => xScale(lineXNumber(value, xType) ?? minimum);
    xTicks = boundedSample(xScale.ticks(tickCount), tickCount).map((value) => ({
      id: `x-${value}`,
      label: tickLabel(value),
      value,
      x: xScale(value),
      y: plot.y + plot.height,
    }));
  }

  const curveFactory = curve === 'smooth'
    ? curveMonotoneX
    : curve === 'step'
      ? curveStepAfter
      : curveLinear;
  const lineBuilder = line<SvgLineGeometryPoint>()
    .x((point) => point.xPosition)
    .y((point) => point.yPosition)
    .curve(curveFactory);
  const areaBuilder = area<SvgLineGeometryPoint>()
    .x((point) => point.xPosition)
    .y0(baseline)
    .y1((point) => point.yPosition)
    .curve(curveFactory);
  const geometrySeries = finiteSeries.map<SvgLineGeometrySeries>((currentSeries) => {
    const points = currentSeries.points.map<SvgLineGeometryPoint>((point) => ({
      ...point,
      xPosition: resolveX(point.x),
      yPosition: yScale(point.value),
    }));
    return {
      id: currentSeries.id,
      label: currentSeries.label,
      seriesColor: currentSeries.color,
      path: lineBuilder(points) ?? '',
      areaPath: showArea ? areaBuilder(points) ?? '' : undefined,
      points: Object.freeze(points),
    };
  });
  const yTicks = boundedSample(yScale.ticks(tickCount), tickCount).map<ChartGeometryTick>((value) => ({
    id: `y-${value}`,
    label: tickLabel(value),
    value,
    x: plot.x,
    y: yScale(value),
  }));

  return {
    width,
    height,
    plot,
    baseline,
    series: Object.freeze(geometrySeries),
    xTicks: Object.freeze(xTicks),
    yTicks: Object.freeze(yTicks),
  };
}

export interface SvgHeatMapDatum {
  readonly id: string;
  readonly column: string;
  readonly row: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
}

export interface SvgHeatMapGeometryDatum extends SvgHeatMapDatum, ChartGeometryRect {
  readonly cellColor: string;
}

export interface SvgHeatMapGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly cells: readonly SvgHeatMapGeometryDatum[];
  readonly xTicks: readonly ChartGeometryTick[];
  readonly yTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgHeatMapGeometryOptions {
  readonly data: readonly SvgHeatMapDatum[];
  readonly width: number;
  readonly height: number;
  readonly colorRange: readonly [string, string];
  readonly xLabels?: readonly string[];
  readonly yLabels?: readonly string[];
  readonly insets?: ChartGeometryInsets;
  readonly cellPadding?: number;
}

export function buildSvgHeatMapGeometry({
  data,
  width: widthInput,
  height: heightInput,
  colorRange,
  xLabels: xLabelsInput,
  yLabels: yLabelsInput,
  insets: insetsInput,
  cellPadding = 0.06,
}: BuildSvgHeatMapGeometryOptions): SvgHeatMapGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_HEATMAP_INSETS);
  const plot = plotRect(width, height, insets);
  const finiteData = data.filter((datum) => Number.isFinite(datum.value));
  assertUniqueStrings(finiteData.map((datum) => datum.id), 'heatmap datum id');
  const xLabels = xLabelsInput
    ? uniqueStrings([...xLabelsInput])
    : uniqueStrings(finiteData.map((datum) => datum.column));
  const yLabels = yLabelsInput
    ? uniqueStrings([...yLabelsInput])
    : uniqueStrings(finiteData.map((datum) => datum.row));
  const xDomain = new Set(xLabels);
  const yDomain = new Set(yLabels);
  const domainData = finiteData.filter(
    (datum) => xDomain.has(datum.column) && yDomain.has(datum.row),
  );
  assertUniqueStrings(
    domainData.map((datum) => `${datum.column}\u0000${datum.row}`),
    'heatmap coordinate',
  );
  const padding = Number.isFinite(cellPadding)
    ? Math.min(0.5, Math.max(0, cellPadding))
    : 0.06;
  const xScale = scaleBand<string>()
    .domain(xLabels)
    .range([plot.x, plot.x + plot.width])
    .padding(padding);
  const yScale = scaleBand<string>()
    .domain(yLabels)
    .range([plot.y, plot.y + plot.height])
    .padding(padding);
  const highFallback = DEFAULT_COLORS[0] as string;
  const lowFallback = DEFAULT_COLORS[8] as string;
  const lowColor = normalizedConcreteColor(colorRange[0], lowFallback);
  const highColor = normalizedConcreteColor(colorRange[1], highFallback);
  const colorScale = scaleSequential<string>()
    .domain(sequentialDomain(domainData.map((datum) => datum.value)))
    .interpolator(interpolateRgb(lowColor, highColor));
  const cells = domainData.map<SvgHeatMapGeometryDatum>((datum) => ({
    ...datum,
    x: xScale(datum.column) ?? plot.x,
    y: yScale(datum.row) ?? plot.y,
    width: xScale.bandwidth(),
    height: yScale.bandwidth(),
    cellColor: colorScale(datum.value),
  }));
  const xTicks = xLabels.map<ChartGeometryTick>((label) => ({
    id: `x-${label}`,
    label,
    value: label,
    x: (xScale(label) ?? plot.x) + xScale.bandwidth() / 2,
    y: plot.y + plot.height,
  }));
  const yTicks = yLabels.map<ChartGeometryTick>((label) => ({
    id: `y-${label}`,
    label,
    value: label,
    x: plot.x,
    y: (yScale(label) ?? plot.y) + yScale.bandwidth() / 2,
  }));

  return {
    width,
    height,
    plot,
    cells: Object.freeze(cells),
    xTicks: Object.freeze(xTicks),
    yTicks: Object.freeze(yTicks),
  };
}
