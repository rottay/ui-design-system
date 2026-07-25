/**
 * Immutable geometry builders for the React-owned SVG chart renderers.
 *
 * D3 is deliberately limited to scales, paths and interpolation. This module
 * never selects, appends, removes or mutates DOM nodes.
 */

import {
  arc as createArcPath,
  area,
  bin as createBinLayout,
  color as parseColor,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  hierarchy,
  interpolateRgb,
  line,
  pie as createPieLayout,
  scaleBand,
  scaleLinear,
  scalePoint,
  scaleQuantize,
  scaleSequential,
  scaleSqrt,
  scaleTime,
  scaleUtc,
  timeDay,
  timeFormat,
  timeMonday,
  timeMonth,
  treemap as createTreemapLayout,
  type PieArcDatum,
} from 'd3';

import { DEFAULT_COLORS } from '../../../../../foundation/palettes';

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

export const DEFAULT_RADIAL_INSETS: ChartGeometryInsets = Object.freeze({
  top: 16,
  right: 16,
  bottom: 16,
  left: 16,
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
  /** Optional series display name for multi-series (grouped/stacked) bars. */
  readonly series?: string;
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
  maxTicks,
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
  const explicitTickCount =
    typeof maxTicks === 'number' && Number.isSafeInteger(maxTicks)
      ? Math.max(2, maxTicks)
      : null;
  const valueTickCount = explicitTickCount ?? 5;
  const categoryTickCount = explicitTickCount ?? categories.length;
  const valueScale = scaleLinear()
    .domain(zeroAnchoredDomain(finiteData.map((datum) => datum.value)))
    .nice(valueTickCount)
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

  const categoryTicks = boundedSample(categories, categoryTickCount).map<ChartGeometryTick>((category) => {
    const position = (categoryScale(category) ?? 0) + categoryScale.bandwidth() / 2;
    return orientation === 'vertical'
      ? { id: `category-${category}`, label: category, value: category, x: position, y: plot.y + plot.height }
      : { id: `category-${category}`, label: category, value: category, x: plot.x, y: position };
  });
  const valueTicks = boundedSample(valueScale.ticks(valueTickCount), valueTickCount).map<ChartGeometryTick>((value) =>
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

/** One value of one series at one category, before layout. */
export interface SvgBarSeriesPoint {
  readonly category: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
}

/** A named categorical series contributing bars to a grouped/stacked layout. */
export interface SvgBarSeriesInput {
  readonly id: string;
  readonly label: string;
  readonly color?: string;
  readonly points: readonly SvgBarSeriesPoint[];
}

export type SvgBarLayout = 'grouped' | 'stacked';

/**
 * A single resolved bar in a multi-series layout. Extends the single-series
 * datum shape so the React renderer can share one marks loop; the extra fields
 * carry series identity and the stack-top flag used for corner-radius rounding.
 */
export interface SvgBarSeriesGeometryDatum extends SvgBarGeometryDatum {
  readonly seriesId: string;
  readonly seriesIndex: number;
  readonly seriesLabel: string;
  readonly isTopOfStack: boolean;
}

export interface SvgBarSeriesGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly orientation: 'vertical' | 'horizontal';
  readonly layout: SvgBarLayout;
  readonly baseline: number;
  readonly seriesCount: number;
  readonly categories: readonly string[];
  readonly bars: readonly SvgBarSeriesGeometryDatum[];
  readonly categoryTicks: readonly ChartGeometryTick[];
  readonly valueTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgBarSeriesGeometryOptions {
  readonly series: readonly SvgBarSeriesInput[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: 'vertical' | 'horizontal';
  readonly layout?: SvgBarLayout;
  readonly insets?: ChartGeometryInsets;
  /** Outer band padding between category groups. */
  readonly bandPadding?: number;
  /** Inner band padding between grouped bars inside one category. */
  readonly groupPadding?: number;
  readonly maxTicks?: number;
}

/**
 * Deterministic grouped/stacked multi-series bar layout. Pure arithmetic and
 * d3 scales only; no DOM. Single-series callers keep {@link buildSvgBarGeometry};
 * this builder owns the mode matrix (grouped | stacked, vertical | horizontal).
 * Stacking accumulates positive and negative values away from a shared zero
 * baseline (diverging), so signed data never overlaps at the origin.
 */
export function buildSvgBarSeriesGeometry({
  series,
  width: widthInput,
  height: heightInput,
  orientation = 'vertical',
  layout = 'grouped',
  insets: insetsInput,
  bandPadding = 0.2,
  groupPadding = 0.05,
  maxTicks,
}: BuildSvgBarSeriesGeometryOptions): SvgBarSeriesGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const vertical = orientation === 'vertical';
  const outerPadding = Number.isFinite(bandPadding)
    ? Math.min(0.95, Math.max(0, bandPadding))
    : 0.2;
  const innerPadding = Number.isFinite(groupPadding)
    ? Math.min(0.95, Math.max(0, groupPadding))
    : 0.05;
  const explicitTickCount =
    typeof maxTicks === 'number' && Number.isSafeInteger(maxTicks)
      ? Math.max(2, maxTicks)
      : null;
  const valueTickCount = explicitTickCount ?? 5;

  // Keep only finite points; preserve first-seen category order across series.
  const cleanSeries = series.map((currentSeries) => ({
    ...currentSeries,
    points: currentSeries.points.filter((point) => Number.isFinite(point.value)),
  }));
  const categories: string[] = [];
  const seen = new Set<string>();
  for (const currentSeries of cleanSeries) {
    for (const point of currentSeries.points) {
      if (!seen.has(point.category)) {
        seen.add(point.category);
        categories.push(point.category);
      }
    }
  }
  const seriesCount = cleanSeries.length;
  const categoryTickCount = explicitTickCount ?? categories.length;

  // Resolve the value domain. Grouped keeps zero visible over raw values;
  // stacked accumulates per-category positive and negative extents.
  let valueValues: number[];
  if (layout === 'stacked') {
    // Collect every finite cumulative endpoint in the same series order the
    // bar pass uses, so a finite intermediate stack level still bounds the
    // domain even when the running total later overflows to a non-finite value.
    valueValues = [0];
    for (const category of categories) {
      let positive = 0;
      let negative = 0;
      for (const currentSeries of cleanSeries) {
        const point = currentSeries.points.find((candidate) => candidate.category === category);
        if (!point) continue;
        if (point.value >= 0) {
          positive += point.value;
          if (Number.isFinite(positive)) valueValues.push(positive);
        } else {
          negative += point.value;
          if (Number.isFinite(negative)) valueValues.push(negative);
        }
      }
    }
  } else {
    valueValues = cleanSeries.flatMap((currentSeries) => currentSeries.points.map((point) => point.value));
  }

  const valueScale = scaleLinear()
    .domain(zeroAnchoredDomain(valueValues))
    .nice(valueTickCount)
    .range(vertical ? [plot.y + plot.height, plot.y] : [plot.x, plot.x + plot.width]);
  const categoryScale = scaleBand<string>()
    .domain(categories)
    .range(vertical ? [plot.x, plot.x + plot.width] : [plot.y, plot.y + plot.height])
    .padding(outerPadding);
  const groupScale = scaleBand<string>()
    .domain(cleanSeries.map((_, index) => `series-${index}`))
    .range([0, categoryScale.bandwidth()])
    .padding(innerPadding);
  const baseline = valueScale(0);

  const bars: SvgBarSeriesGeometryDatum[] = [];
  // Stack cursors per category, tracked in value space.
  const positiveCursor = new Map<string, number>();
  const negativeCursor = new Map<string, number>();

  cleanSeries.forEach((currentSeries, seriesIndex) => {
    const isLastSeries = seriesIndex === seriesCount - 1;
    currentSeries.points.forEach((point) => {
      const categoryPosition = categoryScale(point.category) ?? 0;
      let start: number;
      let end: number;
      if (layout === 'stacked') {
        if (point.value >= 0) {
          start = positiveCursor.get(point.category) ?? 0;
          end = start + point.value;
          positiveCursor.set(point.category, end);
        } else {
          start = negativeCursor.get(point.category) ?? 0;
          end = start + point.value;
          negativeCursor.set(point.category, end);
        }
      } else {
        start = 0;
        end = point.value;
      }
      // A stacked cumulative sum can overflow to a non-finite magnitude; such a
      // segment has no honest pixel span, so it is dropped rather than rendered
      // with an Infinity/NaN geometry.
      if (!Number.isFinite(start) || !Number.isFinite(end)) return;
      const startPixel = valueScale(start);
      const endPixel = valueScale(end);
      const groupOffset = layout === 'grouped' ? groupScale(`series-${seriesIndex}`) ?? 0 : 0;
      const thickness = layout === 'grouped' ? groupScale.bandwidth() : categoryScale.bandwidth();
      const along = categoryPosition + groupOffset;
      const isTopOfStack = layout === 'stacked' ? isLastSeries : true;

      if (vertical) {
        bars.push({
          id: `${currentSeries.id}::${point.category}`,
          seriesId: currentSeries.id,
          seriesIndex,
          seriesLabel: currentSeries.label,
          series: currentSeries.label,
          category: point.category,
          value: point.value,
          ...(point.valueLabel === undefined ? {} : { valueLabel: point.valueLabel }),
          ...(point.ariaLabel === undefined ? {} : { ariaLabel: point.ariaLabel }),
          ...(currentSeries.color === undefined ? {} : { color: currentSeries.color }),
          x: along,
          y: Math.min(startPixel, endPixel),
          width: thickness,
          height: Math.abs(endPixel - startPixel),
          valueX: along + thickness / 2,
          valueY: point.value >= 0 ? endPixel - 6 : endPixel + 14,
          isTopOfStack,
        });
      } else {
        bars.push({
          id: `${currentSeries.id}::${point.category}`,
          seriesId: currentSeries.id,
          seriesIndex,
          seriesLabel: currentSeries.label,
          series: currentSeries.label,
          category: point.category,
          value: point.value,
          ...(point.valueLabel === undefined ? {} : { valueLabel: point.valueLabel }),
          ...(point.ariaLabel === undefined ? {} : { ariaLabel: point.ariaLabel }),
          ...(currentSeries.color === undefined ? {} : { color: currentSeries.color }),
          x: Math.min(startPixel, endPixel),
          y: along,
          width: Math.abs(endPixel - startPixel),
          height: thickness,
          valueX: point.value >= 0 ? endPixel + 6 : endPixel - 6,
          valueY: along + thickness / 2,
          isTopOfStack,
        });
      }
    });
  });

  const categoryTicks = boundedSample(categories, categoryTickCount).map<ChartGeometryTick>((category) => {
    const position = (categoryScale(category) ?? 0) + categoryScale.bandwidth() / 2;
    return vertical
      ? { id: `category-${category}`, label: category, value: category, x: position, y: plot.y + plot.height }
      : { id: `category-${category}`, label: category, value: category, x: plot.x, y: position };
  });
  const valueTicks = boundedSample(valueScale.ticks(valueTickCount), valueTickCount).map<ChartGeometryTick>((value) =>
    vertical
      ? { id: `value-${value}`, label: tickLabel(value), value, x: plot.x, y: valueScale(value) }
      : { id: `value-${value}`, label: tickLabel(value), value, x: valueScale(value), y: plot.y + plot.height },
  );

  return {
    width,
    height,
    plot,
    orientation,
    layout,
    baseline,
    seriesCount,
    categories: Object.freeze(categories),
    bars: Object.freeze(bars),
    categoryTicks: Object.freeze(categoryTicks),
    valueTicks: Object.freeze(valueTicks),
  };
}

export interface SvgPieDatum {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
}

export interface SvgPieGeometryDatum extends SvgPieDatum {
  readonly path: string;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly percentage: number;
  readonly centroidX: number;
  readonly centroidY: number;
}

export interface SvgPieGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly centerX: number;
  readonly centerY: number;
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly total: number;
  readonly slices: readonly SvgPieGeometryDatum[];
}

export interface BuildSvgPieGeometryOptions {
  readonly data: readonly SvgPieDatum[];
  readonly width: number;
  readonly height: number;
  readonly insets?: ChartGeometryInsets;
  readonly innerRadiusRatio?: number;
  readonly padAngle?: number;
  readonly cornerRadius?: number;
  readonly startAngle?: number;
  readonly endAngle?: number;
}

/**
 * Builds deterministic part-to-whole geometry for the React-owned pie/donut
 * renderer. Negative values are rejected because they have no truthful radial
 * area encoding; invalid and zero values cannot create phantom slices.
 */
export function buildSvgPieGeometry({
  data,
  width: widthInput,
  height: heightInput,
  insets: insetsInput,
  innerRadiusRatio = 0,
  padAngle = 0.015,
  cornerRadius = 2,
  startAngle: startAngleInput = -Math.PI / 2,
  endAngle: endAngleInput = (Math.PI * 3) / 2,
}: BuildSvgPieGeometryOptions): SvgPieGeometry {
  const width = finiteSize(widthInput, 360);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_RADIAL_INSETS);
  const plot = plotRect(width, height, insets);
  const finiteData = data.filter((datum) => Number.isFinite(datum.value));
  assertUniqueStrings(finiteData.map((datum) => datum.id), 'pie datum id');

  const negative = finiteData.find((datum) => datum.value < 0);
  if (negative) {
    throw new TypeError(
      `[ChartGeometry] Pie datum ${negative.id} has a negative value (${negative.value}).`,
    );
  }

  const positiveData = finiteData.filter((datum) => datum.value > 0);
  const total = positiveData.reduce((sum, datum) => sum + datum.value, 0);
  const centerX = plot.x + plot.width / 2;
  const centerY = plot.y + plot.height / 2;
  const outerRadius = Math.max(0, Math.min(plot.width, plot.height) / 2);
  const normalizedInnerRatio = Number.isFinite(innerRadiusRatio)
    ? Math.min(0.9, Math.max(0, innerRadiusRatio))
    : 0;
  const innerRadius = outerRadius * normalizedInnerRatio;
  const normalizedPadAngle = Number.isFinite(padAngle)
    ? Math.min(0.08, Math.max(0, padAngle))
    : 0.015;
  const normalizedCornerRadius = Number.isFinite(cornerRadius)
    ? Math.min(Math.max(0, (outerRadius - innerRadius) / 2), Math.max(0, cornerRadius))
    : 2;
  const startAngle = Number.isFinite(startAngleInput) ? startAngleInput : -Math.PI / 2;
  const requestedEndAngle = Number.isFinite(endAngleInput) ? endAngleInput : startAngle + Math.PI * 2;
  const endAngle = requestedEndAngle > startAngle
    ? Math.min(startAngle + Math.PI * 2, requestedEndAngle)
    : startAngle + Math.PI * 2;

  if (total <= 0 || outerRadius <= 0) {
    return {
      width,
      height,
      plot,
      centerX,
      centerY,
      innerRadius,
      outerRadius,
      total: 0,
      slices: Object.freeze([]),
    };
  }

  const layout = createPieLayout<SvgPieDatum>()
    .value((datum) => datum.value)
    .sort(null)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .padAngle(normalizedPadAngle);
  const path = createArcPath<PieArcDatum<SvgPieDatum>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(normalizedCornerRadius);
  const centroid = createArcPath<PieArcDatum<SvgPieDatum>>()
    .innerRadius(innerRadius + (outerRadius - innerRadius) * 0.55)
    .outerRadius(innerRadius + (outerRadius - innerRadius) * 0.55);

  const slices = layout(positiveData).flatMap<SvgPieGeometryDatum>((segment) => {
    const segmentPath = path(segment);
    if (!segmentPath) return [];
    const [relativeX, relativeY] = centroid.centroid(segment);
    return [{
      ...segment.data,
      path: segmentPath,
      startAngle: segment.startAngle,
      endAngle: segment.endAngle,
      percentage: segment.data.value / total,
      centroidX: centerX + relativeX,
      centroidY: centerY + relativeY,
    }];
  });

  return {
    width,
    height,
    plot,
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    total,
    slices: Object.freeze(slices),
  };
}

/** One threshold band in a radial gauge. An explicitly empty color is valid. */
export interface SvgGaugeSegment {
  readonly from: number;
  readonly to: number;
  readonly color?: string;
  readonly label?: string;
}

export type SvgGaugeTone = 'error' | 'warning' | 'success' | 'custom';

export interface SvgGaugeGeometrySegment extends SvgGaugeSegment {
  readonly id: string;
  readonly path: string;
  readonly startRadians: number;
  readonly endRadians: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly active: boolean;
  readonly colorSource: 'default' | 'custom';
  readonly tone: SvgGaugeTone;
}

export interface SvgGaugeGeometry {
  readonly width: number;
  readonly height: number;
  readonly rangeMin: number;
  readonly rangeMax: number;
  readonly value: number;
  /** Compatibility-facing degree values retained for the public gauge contract. */
  readonly startAngle: number;
  readonly endAngle: number;
  readonly startRadians: number;
  readonly endRadians: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly outerRadius: number;
  readonly innerRadius: number;
  readonly trackPath: string;
  readonly needleRotation: number;
  readonly needlePath: string;
  readonly needleCapRadius: number;
  readonly valueY: number;
  readonly labelY: number;
  readonly valueFontSize: number;
  readonly labelFontSize: number;
  readonly segments: readonly SvgGaugeGeometrySegment[];
}

export interface BuildSvgGaugeGeometryOptions {
  readonly value: number;
  readonly width: number;
  readonly height: number;
  readonly min?: number;
  readonly max?: number;
  readonly segments?: readonly SvgGaugeSegment[];
  readonly startAngle?: number;
  readonly endAngle?: number;
  readonly innerRadiusRatio?: number;
  readonly trackCornerRadius?: number;
  readonly segmentCornerRadius?: number;
}

const DEFAULT_GAUGE_TONES: readonly SvgGaugeTone[] = [
  'error',
  'warning',
  'success',
];

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function resolveGaugeRange(min: number | undefined, max: number | undefined): readonly [number, number] {
  const finiteMin = Number.isFinite(min) ? min as number : 0;
  const finiteMax = Number.isFinite(max) ? max as number : 100;
  if (finiteMin === finiteMax) return [finiteMin, finiteMin + 1];
  return finiteMin < finiteMax ? [finiteMin, finiteMax] : [finiteMax, finiteMin];
}

function resolveGaugeAngles(
  startValue: number | undefined,
  endValue: number | undefined,
): readonly [number, number] {
  const rawStart = Number.isFinite(startValue) ? startValue as number : -120;
  const rawEnd = Number.isFinite(endValue) ? endValue as number : 120;
  const normalizedStart = rawStart % 360;
  const start = Object.is(normalizedStart, -0) ? 0 : normalizedStart;
  const rawSpan = rawEnd - rawStart;
  if (!Number.isFinite(rawSpan) || rawSpan === 0) return [start, start + 240];
  const span = Math.max(-360, Math.min(360, rawSpan));
  return [start, start + span];
}

function defaultGaugeSegments(rangeMin: number, rangeMax: number): readonly SvgGaugeSegment[] {
  const third = (rangeMax - rangeMin) / 3;
  return [
    { from: rangeMin, to: rangeMin + third, label: 'Low' },
    { from: rangeMin + third, to: rangeMin + third * 2, label: 'Medium' },
    { from: rangeMin + third * 2, to: rangeMax, label: 'High' },
  ];
}

function normalizedGaugeCornerRadius(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, value as number) : fallback;
}

function buildGaugeArcPath(
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius: number,
): string {
  const datum = { innerRadius, outerRadius, startAngle, endAngle };
  return createArcPath<typeof datum>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .cornerRadius(cornerRadius)(datum) ?? '';
}

function radialPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): readonly [number, number] {
  // d3.arc starts at twelve o'clock, therefore x follows sin and y follows -cos.
  return [
    centerX + Math.sin(angle) * radius,
    centerY - Math.cos(angle) * radius,
  ];
}

/**
 * Builds deterministic radial-gauge geometry for React-owned SVG rendering.
 * D3 contributes only path math; it never receives or owns a DOM node here.
 */
export function buildSvgGaugeGeometry({
  value,
  width: widthInput,
  height: heightInput,
  min,
  max,
  segments: providedSegments,
  startAngle: startAngleInput,
  endAngle: endAngleInput,
  innerRadiusRatio = 0.7,
  trackCornerRadius,
  segmentCornerRadius,
}: BuildSvgGaugeGeometryOptions): SvgGaugeGeometry {
  const width = finiteSize(widthInput, 400);
  const height = finiteSize(heightInput, 300);
  const [rangeMin, rangeMax] = resolveGaugeRange(min, max);
  const normalizedValue = Number.isFinite(value)
    ? Math.max(rangeMin, Math.min(rangeMax, value))
    : rangeMin;
  const [startAngle, endAngle] = resolveGaugeAngles(startAngleInput, endAngleInput);
  const startRadians = degreesToRadians(startAngle);
  const endRadians = degreesToRadians(endAngle);
  const totalRadians = endRadians - startRadians;
  const normalizedInnerRatio = Number.isFinite(innerRadiusRatio)
    ? Math.min(0.95, Math.max(0, innerRadiusRatio))
    : 0.7;
  const outerRadius = Math.max(0, Math.min(width, height) / 2 - 20);
  const innerRadius = outerRadius * normalizedInnerRatio;
  const centerX = width / 2;
  const centerY = height / 2 + (
    startAngle < 0 && endAngle > 0 ? outerRadius * 0.1 : 0
  );
  const sourceSegments = providedSegments ?? defaultGaugeSegments(rangeMin, rangeMax);
  const usesDefaultSegments = providedSegments === undefined;
  const normalizedSegments = sourceSegments.flatMap((segment, index) => {
    if (!Number.isFinite(segment.from) || !Number.isFinite(segment.to)) return [];
    const from = Math.max(rangeMin, segment.from);
    const to = Math.min(rangeMax, segment.to);
    if (to <= from) return [];
    return [{ ...segment, from, to, sourceIndex: index }];
  });
  const activeIndex = normalizedSegments.findIndex((segment) => (
    normalizedValue >= segment.from && normalizedValue <= segment.to
  ));
  const range = rangeMax - rangeMin;
  const resolvedTrackCornerRadius = normalizedGaugeCornerRadius(trackCornerRadius, 2);
  const resolvedSegmentCornerRadius = normalizedGaugeCornerRadius(segmentCornerRadius, 1);
  const middleRadius = innerRadius + (outerRadius - innerRadius) / 2;
  const segments = normalizedSegments.map<SvgGaugeGeometrySegment>((segment, index) => {
    const startFraction = Math.max(0, (segment.from - rangeMin) / range);
    const endFraction = Math.min(1, (segment.to - rangeMin) / range);
    const segmentStartRadians = startRadians + totalRadians * startFraction;
    const segmentEndRadians = startRadians + totalRadians * endFraction;
    const [segmentCenterX, segmentCenterY] = radialPoint(
      centerX,
      centerY,
      middleRadius,
      segmentStartRadians + (segmentEndRadians - segmentStartRadians) / 2,
    );
    return {
      id: `gauge-segment-${segment.sourceIndex}`,
      from: segment.from,
      to: segment.to,
      ...(segment.color === undefined ? {} : { color: segment.color }),
      ...(segment.label === undefined ? {} : { label: segment.label }),
      path: buildGaugeArcPath(
        innerRadius,
        outerRadius,
        segmentStartRadians,
        segmentEndRadians,
        resolvedSegmentCornerRadius,
      ),
      startRadians: segmentStartRadians,
      endRadians: segmentEndRadians,
      centerX: segmentCenterX,
      centerY: segmentCenterY,
      active: index === activeIndex,
      colorSource: usesDefaultSegments ? 'default' : 'custom',
      tone: usesDefaultSegments
        ? DEFAULT_GAUGE_TONES[index % DEFAULT_GAUGE_TONES.length] ?? 'error'
        : 'custom',
    };
  });
  const valueFraction = (normalizedValue - rangeMin) / range;
  const needleRadians = startRadians + totalRadians * valueFraction;
  const needleRotation = (needleRadians * 180) / Math.PI;
  const needleLength = outerRadius * 0.88;
  const needleBaseWidth = 4;

  return {
    width,
    height,
    rangeMin,
    rangeMax,
    value: normalizedValue,
    startAngle,
    endAngle,
    startRadians,
    endRadians,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    trackPath: buildGaugeArcPath(
      innerRadius,
      outerRadius,
      startRadians,
      endRadians,
      resolvedTrackCornerRadius,
    ),
    needleRotation,
    needlePath: [
      `M ${-needleBaseWidth} 0`,
      `L 0 ${-needleLength}`,
      `L ${needleBaseWidth} 0`,
      'Z',
    ].join(' '),
    needleCapRadius: needleBaseWidth + 2,
    valueY: 8,
    labelY: 32,
    valueFontSize: Math.max(16, outerRadius * 0.22),
    labelFontSize: Math.max(11, outerRadius * 0.11),
    segments: Object.freeze(segments),
  };
}

/** A single value projected on one named radar axis. */
export interface SvgRadarDatum {
  readonly axis: string;
  readonly value: number;
}

/** A named radar polygon. Colors remain optional so the renderer can inherit a palette. */
export interface SvgRadarSeries {
  readonly name: string;
  readonly data: readonly SvgRadarDatum[];
  readonly color?: string;
}

/** One immutable axis vector in the local, centre-origin radar coordinate space. */
export interface SvgRadarGeometryAxis {
  readonly id: string;
  readonly index: number;
  readonly axis: string;
  readonly angle: number;
  readonly lineX: number;
  readonly lineY: number;
  readonly labelX: number;
  readonly labelY: number;
}

/** One vertex of a radar polygon, relative to the chart centre. */
export interface SvgRadarGeometryPoint extends SvgRadarDatum {
  readonly id: string;
  readonly axisIndex: number;
  readonly x: number;
  readonly y: number;
}

/** One concentric polygonal grid line. */
export interface SvgRadarGeometryGridLevel {
  readonly id: string;
  readonly level: number;
  readonly points: string;
}

/** An immutable, fully resolved radar series ready for React/SVG presentation. */
export interface SvgRadarGeometrySeries {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly colorSource: 'palette' | 'custom';
  readonly points: readonly SvgRadarGeometryPoint[];
  readonly polygonPoints: string;
  readonly zeroBaseline: boolean;
}

/**
 * Deterministic radar layout. Invalid legacy data is represented as an empty
 * mark set plus a user-facing fallback message rather than an exception.
 */
export interface SvgRadarGeometry {
  readonly width: number;
  readonly height: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly radius: number;
  readonly domainMax: number;
  readonly levels: number;
  readonly fallbackMessage: string | null;
  readonly axes: readonly SvgRadarGeometryAxis[];
  readonly gridLevels: readonly SvgRadarGeometryGridLevel[];
  readonly series: readonly SvgRadarGeometrySeries[];
}

export interface BuildSvgRadarGeometryOptions {
  readonly data: readonly SvgRadarDatum[];
  readonly series?: readonly SvgRadarSeries[];
  readonly colors?: readonly string[];
  readonly width: number;
  readonly height: number;
  readonly maxValue?: number;
  readonly levels?: number;
  /** Plot inset in CSS pixels. Label-free compact radars can reclaim space. */
  readonly padding?: number;
}

function radarCoordinate(value: number): number {
  return Math.abs(value) < 0.0000000001 ? 0 : value;
}

function radarFallbackMessage(
  series: readonly SvgRadarSeries[],
  axes: readonly string[],
  values: readonly number[],
): string | null {
  if (series.length === 0 || axes.length === 0) return 'No data to display.';
  if (axes.length < 3) return 'Radar charts require at least three axes.';
  if (values.some((value) => !Number.isFinite(value))) {
    return 'Radar charts require finite values.';
  }
  if (values.some((value) => value < 0)) {
    return 'Radar charts cannot represent negative values.';
  }
  const hasAlignedAxes = series.every((currentSeries) => (
    currentSeries.data.length === axes.length
    && currentSeries.data.every((point, index) => point.axis === axes[index])
  ));
  return hasAlignedAxes ? null : 'Radar chart series must use the same axes.';
}

/**
 * Builds immutable, centre-origin radar geometry for React-owned SVG marks.
 * The function intentionally has no DOM dependency so server and browser
 * render the exact same settled geometry.
 */
export function buildSvgRadarGeometry({
  data,
  series: providedSeries,
  colors,
  width: widthInput,
  height: heightInput,
  maxValue,
  levels: levelsInput = 5,
  padding: paddingInput = 40,
}: BuildSvgRadarGeometryOptions): SvgRadarGeometry {
  const width = finiteSize(widthInput, 400);
  const height = finiteSize(heightInput, 400);
  const centerX = width / 2;
  const centerY = height / 2;
  const padding = Number.isFinite(paddingInput)
    ? Math.max(8, Math.min(80, paddingInput))
    : 40;
  const radius = Math.max(1, Math.min(width, height) / 2 - padding);
  const safeLevels = Number.isFinite(levelsInput)
    ? Math.max(1, Math.floor(levelsInput))
    : 5;
  const sourceSeries: readonly SvgRadarSeries[] = providedSeries ?? [{ name: 'Data', data }];
  const referenceAxes = sourceSeries[0]?.data.map((point) => point.axis) ?? [];
  const values = sourceSeries.flatMap((currentSeries) => (
    currentSeries.data.map((point) => point.value)
  ));
  const fallbackMessage = radarFallbackMessage(sourceSeries, referenceAxes, values);
  const requestedMax = Number.isFinite(maxValue) && (maxValue ?? 0) > 0
    ? maxValue ?? 1
    : 1;
  const observedMax = fallbackMessage === null
    ? values.reduce((currentMax, value) => Math.max(currentMax, value), 0)
    : 0;
  const domainMax = Math.max(1, observedMax, requestedMax);

  if (fallbackMessage !== null) {
    return {
      width,
      height,
      centerX,
      centerY,
      radius,
      domainMax,
      levels: safeLevels,
      fallbackMessage,
      axes: Object.freeze([]),
      gridLevels: Object.freeze([]),
      series: Object.freeze([]),
    };
  }

  const angleSlice = (2 * Math.PI) / referenceAxes.length;
  const axes = referenceAxes.map<SvgRadarGeometryAxis>((axis, index) => {
    const angle = angleSlice * index - Math.PI / 2;
    const lineX = radarCoordinate(radius * Math.cos(angle));
    const lineY = radarCoordinate(radius * Math.sin(angle));
    const labelRadius = radius + 18;
    return {
      id: `radar-axis-${index}`,
      index,
      axis,
      angle,
      lineX,
      lineY,
      labelX: radarCoordinate(labelRadius * Math.cos(angle)),
      labelY: radarCoordinate(labelRadius * Math.sin(angle)),
    };
  });
  const gridLevels = Array.from({ length: safeLevels }, (_, index) => {
    const level = index + 1;
    const ratio = level / safeLevels;
    return {
      id: `radar-grid-${level}`,
      level,
      points: axes.map((axis) => (
        `${radarCoordinate(axis.lineX * ratio)},${radarCoordinate(axis.lineY * ratio)}`
      )).join(' '),
    };
  });
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const resolvedSeries = sourceSeries.map<SvgRadarGeometrySeries>((currentSeries, seriesIndex) => {
    const color = currentSeries.color ?? palette[seriesIndex % palette.length] ?? 'currentColor';
    const points = currentSeries.data.map<SvgRadarGeometryPoint>((point, axisIndex) => {
      const axis = axes[axisIndex] as SvgRadarGeometryAxis;
      const ratio = Math.max(0, Math.min(1, point.value / domainMax));
      return {
        id: `radar-series-${seriesIndex}-point-${axisIndex}`,
        axis: point.axis,
        value: point.value,
        axisIndex,
        x: radarCoordinate(axis.lineX * ratio),
        y: radarCoordinate(axis.lineY * ratio),
      };
    });

    return {
      id: `radar-series-${seriesIndex}`,
      name: currentSeries.name,
      color,
      colorSource: currentSeries.color === undefined ? 'palette' : 'custom',
      points: Object.freeze(points),
      polygonPoints: points.map((point) => `${point.x},${point.y}`).join(' '),
      zeroBaseline: currentSeries.data.every((point) => point.value === 0),
    };
  });

  return {
    width,
    height,
    centerX,
    centerY,
    radius,
    domainMax,
    levels: safeLevels,
    fallbackMessage: null,
    axes: Object.freeze(axes),
    gridLevels: Object.freeze(gridLevels),
    series: Object.freeze(resolvedSeries),
  };
}

/** A categorical stage in a tapering funnel. */
export interface SvgFunnelDatum {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
}

export type SvgFunnelOrientation = 'vertical' | 'horizontal';
export type SvgFunnelSegmentPosition = 'first' | 'middle' | 'last';

/** An immutable funnel segment ready for React/SVG presentation. */
export interface SvgFunnelGeometrySegment extends SvgFunnelDatum {
  readonly id: string;
  readonly index: number;
  readonly color: string;
  readonly colorSource: 'palette' | 'custom';
  readonly position: SvgFunnelSegmentPosition;
  readonly polygonPoints: string;
  readonly centerX: number;
  readonly centerY: number;
  readonly labelX: number;
  readonly labelY: number;
  readonly valueX: number;
  readonly valueY: number;
  readonly percentage: number;
  readonly percentageLabel: string;
  readonly conversionLabel?: string;
  readonly conversionX?: number;
  readonly conversionY?: number;
}

/**
 * Deterministic taper geometry for a funnel. Invalid input becomes an empty
 * mark set with a fallback message, allowing compatibility adapters to retain
 * their existing status overlay without imperative cleanup.
 */
export interface SvgFunnelGeometry {
  readonly width: number;
  readonly height: number;
  readonly orientation: SvgFunnelOrientation;
  readonly margin: ChartGeometryInsets;
  readonly innerWidth: number;
  readonly innerHeight: number;
  readonly maxValue: number;
  readonly fallbackMessage: string | null;
  readonly segments: readonly SvgFunnelGeometrySegment[];
}

export interface BuildSvgFunnelGeometryOptions {
  readonly data: readonly SvgFunnelDatum[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: SvgFunnelOrientation;
  readonly colors?: readonly string[];
  readonly margin?: ChartGeometryInsets;
}

/** Preserves the historic funnel padding while making it an explicit engine token. */
export const DEFAULT_FUNNEL_INSETS: ChartGeometryInsets = Object.freeze({
  top: 20,
  right: 20,
  bottom: 40,
  left: 50,
});

function funnelFallbackMessage(data: readonly SvgFunnelDatum[]): string | null {
  if (data.length === 0) return 'No data to display.';
  if (data.some((item) => !Number.isFinite(item.value))) {
    return 'Funnel charts require finite values.';
  }
  if (data.some((item) => item.value < 0)) {
    return 'Funnel charts cannot represent negative stages.';
  }
  const maxValue = data.reduce((currentMax, item) => Math.max(currentMax, item.value), 0);
  return maxValue <= 0 ? 'Funnel chart has no positive stages.' : null;
}

function funnelPosition(index: number, length: number): SvgFunnelSegmentPosition {
  if (index === 0) return 'first';
  if (index === length - 1) return 'last';
  return 'middle';
}

function funnelConversionLabel(value: number, previousValue: number): string {
  const rawRate = previousValue > 0 ? (value / previousValue) * 100 : null;
  if (rawRate !== null && Number.isFinite(rawRate)) return `${rawRate.toFixed(1)}%`;
  return value === 0 ? '0.0%' : 'N/A';
}

/**
 * Builds immutable funnel polygons using only arithmetic. The returned mark
 * coordinates are local to the supplied margin so React can own the SVG tree
 * with a single translated plot group.
 */
export function buildSvgFunnelGeometry({
  data,
  width: widthInput,
  height: heightInput,
  orientation = 'vertical',
  colors,
  margin: marginInput,
}: BuildSvgFunnelGeometryOptions): SvgFunnelGeometry {
  const width = finiteSize(widthInput, 600);
  const height = finiteSize(heightInput, 400);
  const margin = normalizeInsets(marginInput, DEFAULT_FUNNEL_INSETS);
  const innerWidth = Math.max(1, width - margin.left - margin.right);
  const innerHeight = Math.max(1, height - margin.top - margin.bottom);
  const fallbackMessage = funnelFallbackMessage(data);
  const maxValue = fallbackMessage === null
    ? data.reduce((currentMax, item) => Math.max(currentMax, item.value), 0)
    : 0;

  if (fallbackMessage !== null) {
    return {
      width,
      height,
      orientation,
      margin,
      innerWidth,
      innerHeight,
      maxValue,
      fallbackMessage,
      segments: Object.freeze([]),
    };
  }

  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const segmentExtent = orientation === 'vertical'
    ? innerHeight / data.length
    : innerWidth / data.length;
  // Keep seams legible without allowing tiny containers to invert a polygon.
  const gap = Math.min(2, Math.max(0, segmentExtent / 3));
  const segments = data.map<SvgFunnelGeometrySegment>((item, index) => {
    const ratio = item.value / maxValue;
    const nextValue = data[index + 1]?.value;
    const nextRatio = nextValue === undefined ? ratio * 0.8 : nextValue / maxValue;
    const color = item.color ?? palette[index % palette.length] ?? 'currentColor';
    const percentage = ratio * 100;
    const base = {
      id: `funnel-segment-${index}`,
      index,
      label: item.label,
      value: item.value,
      color,
      colorSource: item.color === undefined ? 'palette' as const : 'custom' as const,
      position: funnelPosition(index, data.length),
      percentage,
      percentageLabel: `${percentage.toFixed(0)}%`,
      ...(index > 0 ? {
        conversionLabel: funnelConversionLabel(item.value, data[index - 1]?.value ?? 0),
      } : {}),
    };

    if (orientation === 'vertical') {
      const topWidth = innerWidth * ratio;
      const bottomWidth = innerWidth * nextRatio;
      const topX = (innerWidth - topWidth) / 2;
      const bottomX = (innerWidth - bottomWidth) / 2;
      const y = index * segmentExtent;
      const centerY = y + segmentExtent / 2;
      return {
        ...base,
        polygonPoints: [
          [topX, y + gap],
          [topX + topWidth, y + gap],
          [bottomX + bottomWidth, y + segmentExtent - gap],
          [bottomX, y + segmentExtent - gap],
        ].map((point) => point.join(',')).join(' '),
        centerX: innerWidth / 2,
        centerY,
        labelX: innerWidth / 2,
        labelY: centerY - 6,
        valueX: innerWidth / 2,
        valueY: centerY + 10,
        ...(index > 0 ? {
          conversionX: innerWidth + 8,
          conversionY: y + 4,
        } : {}),
      };
    }

    const leftHeight = innerHeight * ratio;
    const rightHeight = innerHeight * nextRatio;
    const leftY = (innerHeight - leftHeight) / 2;
    const rightY = (innerHeight - rightHeight) / 2;
    const x = index * segmentExtent;
    return {
      ...base,
      polygonPoints: [
        [x + gap, leftY],
        [x + segmentExtent - gap, rightY],
        [x + segmentExtent - gap, rightY + rightHeight],
        [x + gap, leftY + leftHeight],
      ].map((point) => point.join(',')).join(' '),
      centerX: x + segmentExtent / 2,
      centerY: innerHeight / 2,
      labelX: x + segmentExtent / 2,
      labelY: innerHeight / 2,
      valueX: x + segmentExtent / 2,
      valueY: innerHeight / 2,
    };
  });

  return {
    width,
    height,
    orientation,
    margin,
    innerWidth,
    innerHeight,
    maxValue,
    fallbackMessage: null,
    segments: Object.freeze(segments),
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
  const tickCount = Number.isSafeInteger(maxTicks) ? Math.max(2, maxTicks) : 5;
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
      seriesIndex = seriesIndices.size % 10;
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

// ---------------------------------------------------------------------------
// Bullet (linear KPI gauge) geometry
// ---------------------------------------------------------------------------

/** A single KPI datum rendered as one bullet lane. */
export interface SvgBulletDatum {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly target: number;
  readonly ranges?: readonly [number, number, number];
  readonly max?: number;
}

export type SvgBulletOrientation = 'horizontal' | 'vertical';
export type SvgBulletTier = 'poor' | 'satisfactory' | 'good';

export interface SvgBulletBand extends ChartGeometryRect {
  readonly id: string;
  readonly tier: SvgBulletTier;
}

export interface SvgBulletItemGeometry {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly target: number;
  readonly domainMin: number;
  readonly domainMax: number;
  /** Bands ordered widest-first (good, satisfactory, poor) so overlap is correct. */
  readonly bands: readonly SvgBulletBand[];
  readonly valueBar: ChartGeometryRect;
  readonly valueDirection: 'positive' | 'negative' | 'zero';
  readonly targetMarker: ChartGeometryRect;
  readonly zeroBaseline:
    | { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number }
    | null;
  readonly labelAnchor: { readonly x: number; readonly y: number };
  readonly valueAnchor: { readonly x: number; readonly y: number };
}

export interface SvgBulletGeometry {
  readonly width: number;
  readonly height: number;
  readonly orientation: SvgBulletOrientation;
  readonly showLabels: boolean;
  readonly fallbackMessage: string | null;
  readonly items: readonly SvgBulletItemGeometry[];
}

export interface BuildSvgBulletGeometryOptions {
  readonly data: readonly SvgBulletDatum[];
  readonly width: number;
  readonly height: number;
  readonly orientation?: SvgBulletOrientation;
  readonly barThickness?: number;
  readonly gap?: number;
  readonly showLabels?: boolean;
}

/** Horizontal label column and value gutter, preserved from the legacy family. */
const BULLET_LABEL_WIDTH = 100;
const BULLET_VALUE_MARGIN = 60;

function bulletItemFinite(item: SvgBulletDatum): boolean {
  return Number.isFinite(item.value)
    && Number.isFinite(item.target)
    && (item.max === undefined || Number.isFinite(item.max))
    && (item.ranges === undefined || item.ranges.every(Number.isFinite));
}

function bulletRangesOrdered(item: SvgBulletDatum): boolean {
  return item.ranges === undefined
    || (item.ranges[0] <= item.ranges[1] && item.ranges[1] <= item.ranges[2]);
}

interface BulletDomain {
  readonly domain: [number, number];
  readonly ranges: [number, number, number];
}

/** Builds a truthful domain that always contains zero, actual, target and ranges. */
function resolveBulletDomain(item: SvgBulletDatum): BulletDomain {
  const candidates = [0, item.value, item.target];
  if (item.ranges) candidates.push(...item.ranges);
  if (item.max !== undefined) candidates.push(item.max);

  let domainMin = Math.min(...candidates);
  let domainMax = Math.max(...candidates);

  if (domainMin === domainMax) {
    const padding = Math.abs(domainMin) * 0.1 || 1;
    domainMin -= padding;
    domainMax += padding;
  } else if (item.max === undefined) {
    const span = domainMax - domainMin;
    if (domainMin < 0) domainMin -= span * 0.1;
    if (domainMax > 0) domainMax += span * 0.1;
  }

  const ranges: [number, number, number] = item.ranges
    ? [item.ranges[0], item.ranges[1], item.ranges[2]]
    : domainMin < 0
      ? [
          domainMin + (domainMax - domainMin) * 0.5,
          domainMin + (domainMax - domainMin) * 0.75,
          domainMax,
        ]
      : [item.target * 0.5, item.target * 0.75, domainMax];

  return { domain: [domainMin, domainMax], ranges };
}

function bulletDirection(value: number): 'positive' | 'negative' | 'zero' {
  return value < 0 ? 'negative' : value > 0 ? 'positive' : 'zero';
}

/**
 * Deterministic linear bullet geometry. All marks are returned in absolute SVG
 * coordinates so the React renderer performs no scale math; D3 contributes the
 * linear scale only. Invalid input yields no items plus a fallback message,
 * preserving the family's status-overlay contract.
 */
export function buildSvgBulletGeometry({
  data,
  width: widthInput,
  height: heightInput,
  orientation = 'horizontal',
  barThickness: barThicknessInput = 28,
  gap: gapInput = 16,
  showLabels = true,
}: BuildSvgBulletGeometryOptions): SvgBulletGeometry {
  const width = finiteSize(widthInput, 600);
  const height = finiteSize(heightInput, 200);
  const barThickness = Number.isFinite(barThicknessInput) ? Math.max(1, barThicknessInput) : 28;
  const gap = Number.isFinite(gapInput) ? Math.max(0, gapInput) : 16;

  const fallbackMessage = data.length === 0
    ? 'No data to display.'
    : data.some((item) => !bulletItemFinite(item))
      ? 'Bullet charts require finite values.'
      : data.some((item) => !bulletRangesOrdered(item))
        ? 'Bullet chart ranges must be ordered from low to high.'
        : null;

  if (fallbackMessage !== null) {
    return { width, height, orientation, showLabels, fallbackMessage, items: [] };
  }

  const tierOf = (index: number): SvgBulletTier =>
    index === 0 ? 'good' : index === 1 ? 'satisfactory' : 'poor';

  if (orientation === 'horizontal') {
    const labelW = showLabels ? BULLET_LABEL_WIDTH : 0;
    const valueW = showLabels ? BULLET_VALUE_MARGIN : 0;
    const barAreaWidth = Math.max(1, width - labelW - valueW);

    const items = data.map<SvgBulletItemGeometry>((item, i) => {
      const { domain, ranges } = resolveBulletDomain(item);
      const yOffset = 12 + i * (barThickness + gap);
      const scale = scaleLinear().domain(domain).range([0, barAreaWidth]).clamp(true);
      const domainStartX = scale(domain[0]);
      const zeroX = scale(0);

      // Widest first: good, satisfactory, poor.
      const bands = [ranges[2], ranges[1], ranges[0]].map<SvgBulletBand>((upper, bandIndex) => {
        const bandEndX = scale(upper);
        return {
          id: `${item.id}-band-${tierOf(bandIndex)}`,
          tier: tierOf(bandIndex),
          x: labelW + Math.min(domainStartX, bandEndX),
          y: yOffset,
          width: Math.abs(bandEndX - domainStartX),
          height: barThickness,
        };
      });

      const valueBarHeight = barThickness * 0.4;
      const valueX = scale(item.value);
      const valueBar: ChartGeometryRect = {
        x: labelW + Math.min(zeroX, valueX),
        y: yOffset + (barThickness - valueBarHeight) / 2,
        width: Math.abs(valueX - zeroX),
        height: valueBarHeight,
      };

      const markerHeight = barThickness * 0.7;
      const targetX = scale(item.target);
      const targetMarker: ChartGeometryRect = {
        x: labelW + targetX - 1.5,
        y: yOffset + (barThickness - markerHeight) / 2,
        width: 3,
        height: markerHeight,
      };

      return {
        id: item.id,
        label: item.label,
        value: item.value,
        target: item.target,
        domainMin: domain[0],
        domainMax: domain[1],
        bands,
        valueBar,
        valueDirection: bulletDirection(item.value),
        targetMarker,
        zeroBaseline: domain[0] < 0
          ? { x1: labelW + zeroX, y1: yOffset, x2: labelW + zeroX, y2: yOffset + barThickness }
          : null,
        labelAnchor: { x: labelW - 8, y: yOffset + barThickness / 2 },
        valueAnchor: { x: labelW + barAreaWidth + 8, y: yOffset + barThickness / 2 },
      };
    });

    return { width, height, orientation, showLabels, fallbackMessage: null, items: Object.freeze(items) };
  }

  // Vertical orientation.
  const labelH = showLabels ? 24 : 0;
  const valueH = showLabels ? 20 : 0;
  const barAreaHeight = Math.max(1, height - labelH - valueH - 24);
  const barWidth = barThickness;
  const totalWidth = data.length * barWidth + (data.length - 1) * gap;
  const startX = (width - totalWidth) / 2;

  const items = data.map<SvgBulletItemGeometry>((item, i) => {
    const { domain, ranges } = resolveBulletDomain(item);
    const xOffset = startX + i * (barWidth + gap);
    const scale = scaleLinear().domain(domain).range([barAreaHeight, 0]).clamp(true);
    const domainStartY = scale(domain[0]);
    const zeroY = scale(0);
    const barTop = labelH;

    const bands = [ranges[2], ranges[1], ranges[0]].map<SvgBulletBand>((upper, bandIndex) => {
      const bandEndY = scale(upper);
      return {
        id: `${item.id}-band-${tierOf(bandIndex)}`,
        tier: tierOf(bandIndex),
        x: xOffset,
        y: barTop + Math.min(domainStartY, bandEndY),
        width: barWidth,
        height: Math.abs(domainStartY - bandEndY),
      };
    });

    const valueBarWidth = barWidth * 0.4;
    const valueY = scale(item.value);
    const valueBar: ChartGeometryRect = {
      x: xOffset + (barWidth - valueBarWidth) / 2,
      y: barTop + Math.min(zeroY, valueY),
      width: valueBarWidth,
      height: Math.abs(valueY - zeroY),
    };

    const markerWidth = barWidth * 0.7;
    const targetY = scale(item.target);
    const targetMarker: ChartGeometryRect = {
      x: xOffset + (barWidth - markerWidth) / 2,
      y: barTop + targetY - 1.5,
      width: markerWidth,
      height: 3,
    };

    return {
      id: item.id,
      label: item.label,
      value: item.value,
      target: item.target,
      domainMin: domain[0],
      domainMax: domain[1],
      bands,
      valueBar,
      valueDirection: bulletDirection(item.value),
      targetMarker,
      zeroBaseline: domain[0] < 0
        ? { x1: xOffset, y1: barTop + zeroY, x2: xOffset + barWidth, y2: barTop + zeroY }
        : null,
      labelAnchor: { x: xOffset + barWidth / 2, y: barTop + barAreaHeight + 16 },
      valueAnchor: { x: xOffset + barWidth / 2, y: barTop - 8 },
    };
  });

  return { width, height, orientation, showLabels, fallbackMessage: null, items: Object.freeze(items) };
}

// ---------------------------------------------------------------------------
// TreeMap (squarified hierarchy) geometry
// ---------------------------------------------------------------------------

export interface SvgTreeMapNode {
  readonly name: string;
  readonly value: number;
  readonly children?: readonly SvgTreeMapNode[];
}

export interface SvgTreeMapTile extends ChartGeometryRect {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly index: number;
  readonly color: string;
  readonly colorSource: 'palette';
  readonly showLabel: boolean;
  readonly showValue: boolean;
}

export interface SvgTreeMapGeometry {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly SvgTreeMapTile[];
}

export interface BuildSvgTreeMapGeometryOptions {
  readonly data: readonly SvgTreeMapNode[];
  readonly width: number;
  readonly height: number;
  readonly padding?: number;
  readonly colors?: readonly string[];
}

interface MutableTreeNode {
  name: string;
  value: number;
  children?: MutableTreeNode[];
}

function toMutableTreeNodes(nodes: readonly SvgTreeMapNode[]): MutableTreeNode[] {
  return nodes.map((node) => {
    const children = node.children?.length ? toMutableTreeNodes(node.children) : undefined;
    return {
      name: node.name,
      value: Number.isFinite(node.value) && node.value > 0 ? node.value : 0,
      ...(children ? { children } : {}),
    };
  });
}

/**
 * Immutable squarified treemap geometry. D3 contributes the hierarchy sum and
 * tiling layout only; the React renderer draws the positioned rects. Leaves
 * are ordered descending by value so the largest tile is top-left.
 */
export function buildSvgTreeMapGeometry({
  data,
  width: widthInput,
  height: heightInput,
  padding = 2,
  colors,
}: BuildSvgTreeMapGeometryOptions): SvgTreeMapGeometry {
  const width = finiteSize(widthInput, 600);
  const height = finiteSize(heightInput, 400);
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const safePadding = Number.isFinite(padding) ? Math.max(0, padding) : 2;

  if (width === 0 || height === 0 || data.length === 0) {
    return { width, height, tiles: Object.freeze([]) };
  }

  const root = hierarchy<MutableTreeNode>({
    name: 'root',
    value: 0,
    children: toMutableTreeNodes(data),
  })
    .sum((node) => (node.children?.length ? 0 : node.value))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const layoutRoot = createTreemapLayout<MutableTreeNode>()
    .size([width, height])
    .padding(safePadding)
    .round(true)(root);

  const tiles = layoutRoot.leaves().flatMap<SvgTreeMapTile>((leaf, index) => {
    const value = leaf.value ?? 0;
    if (value <= 0) return [];
    const rectWidth = Math.max(0, leaf.x1 - leaf.x0);
    const rectHeight = Math.max(0, leaf.y1 - leaf.y0);
    return [{
      id: `treemap-tile-${index}`,
      name: leaf.data.name,
      value,
      index,
      x: leaf.x0,
      y: leaf.y0,
      width: rectWidth,
      height: rectHeight,
      color: palette[index % palette.length] ?? 'var(--ds-color-primary)',
      colorSource: 'palette',
      showLabel: rectWidth > 40 && rectHeight > 20,
      showValue: rectWidth > 40 && rectHeight > 32,
    }];
  });

  return { width, height, tiles: Object.freeze(tiles) };
}

// ---------------------------------------------------------------------------
// Calendar heat-map (day grid) geometry
// ---------------------------------------------------------------------------

const CALENDAR_KEY_FORMAT = timeFormat('%Y-%m-%d');
const CALENDAR_MONTH_FORMAT = timeFormat('%b');
const CALENDAR_DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''] as const;
const CALENDAR_DEFAULT_STEPS = 5;
const CALENDAR_MAX_STEPS = 256;

export interface SvgCalendarHeatMapCell extends ChartGeometryRect {
  readonly id: string;
  readonly dateKey: string;
  readonly value: number | null;
  readonly state: 'empty' | 'filled';
  readonly fill: string;
}

export interface SvgCalendarHeatMapLabel {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

export interface SvgCalendarHeatMapGeometry {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly SvgCalendarHeatMapCell[];
  readonly monthLabels: readonly SvgCalendarHeatMapLabel[];
  readonly dayLabels: readonly SvgCalendarHeatMapLabel[];
  readonly recordedCount: number;
  readonly startDateKey: string;
  readonly endDateKey: string;
}

export interface BuildSvgCalendarHeatMapGeometryOptions {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly values: ReadonlyMap<string, number>;
  /** Concrete low/high colors already resolved from CSS by the renderer. */
  readonly colorRange: readonly [string, string];
  readonly colorSteps?: number;
  readonly cellSize?: number;
  readonly cellGap?: number;
  readonly measuredWidth?: number;
  readonly responsive?: boolean;
  readonly showMonthLabels?: boolean;
  readonly showDayLabels?: boolean;
}

function calendarQuantizeDomain(values: readonly number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum !== maximum) return [minimum, maximum];
  if (minimum > 0) return [0, minimum];
  if (minimum < 0) return [minimum, 0];
  return [-1, 0];
}

/**
 * Deterministic GitHub-style contribution grid. D3 supplies calendar math
 * (timeDay/timeMonday/timeMonth) and the quantize color scale; the React
 * renderer draws one positioned rect per day. Colors arrive already resolved
 * to concrete values so this pure module never touches the DOM.
 */
export function buildSvgCalendarHeatMapGeometry({
  startDate,
  endDate,
  values,
  colorRange,
  colorSteps = CALENDAR_DEFAULT_STEPS,
  cellSize = 14,
  cellGap = 2,
  measuredWidth,
  responsive = true,
  showMonthLabels = true,
  showDayLabels = true,
}: BuildSvgCalendarHeatMapGeometryOptions): SvgCalendarHeatMapGeometry {
  const resolvedCellSize = Number.isFinite(cellSize) && cellSize > 0 ? cellSize : 14;
  const resolvedCellGap = Number.isFinite(cellGap) && cellGap >= 0 ? cellGap : 2;
  const resolvedSteps = Number.isFinite(colorSteps)
    ? Math.min(CALENDAR_MAX_STEPS, Math.max(2, Math.floor(colorSteps)))
    : CALENDAR_DEFAULT_STEPS;
  const step = resolvedCellSize + resolvedCellGap;
  const dayLabelWidth = showDayLabels ? 32 : 0;
  const monthLabelHeight = showMonthLabels ? 18 : 0;

  const startValid = Number.isFinite(startDate.getTime());
  const endValid = Number.isFinite(endDate.getTime());
  if (!startValid || !endValid || endDate < startDate) {
    return {
      width: 0,
      height: 0,
      cells: Object.freeze([]),
      monthLabels: Object.freeze([]),
      dayLabels: Object.freeze([]),
      recordedCount: 0,
      startDateKey: startValid ? CALENDAR_KEY_FORMAT(startDate) : '',
      endDateKey: endValid ? CALENDAR_KEY_FORMAT(endDate) : '',
    };
  }

  const allDays = timeDay.range(startDate, timeDay.offset(endDate, 1));
  const firstMonday = timeMonday.floor(startDate);
  const totalWeeks = Math.ceil((timeDay.count(firstMonday, endDate) + 1) / 7);
  const gridWidth = totalWeeks * step;
  const gridHeight = 7 * step;
  const safeMeasured = Number.isFinite(measuredWidth) ? Math.max(0, measuredWidth as number) : 0;
  const width = responsive
    ? Math.max(safeMeasured, gridWidth + dayLabelWidth + 8)
    : gridWidth + dayLabelWidth + 8;
  const height = gridHeight + monthLabelHeight + 4;

  const lowColor = normalizedConcreteColor(colorRange[0], DEFAULT_COLORS[8] as string);
  const highColor = normalizedConcreteColor(colorRange[1], DEFAULT_COLORS[0] as string);
  const interpolate = interpolateRgb(lowColor, highColor);
  const stepColors: string[] = [];
  for (let i = 0; i < resolvedSteps; i += 1) {
    stepColors.push(interpolate(i / (resolvedSteps - 1)));
  }
  // The first color is reserved for days without any observation.
  const filledStepColors = stepColors.slice(1);
  const finiteValues = [...values.values()].filter((value) => Number.isFinite(value));
  const colorScale = scaleQuantize<string>()
    .domain(calendarQuantizeDomain(finiteValues))
    .range(filledStepColors);

  let recordedCount = 0;
  const cells = allDays.map<SvgCalendarHeatMapCell>((date) => {
    const dateKey = CALENDAR_KEY_FORMAT(date);
    const rawValue = values.get(dateKey);
    const hasValue = rawValue != null && Number.isFinite(rawValue);
    if (hasValue) recordedCount += 1;
    const weekOffset = Math.floor(timeDay.count(firstMonday, date) / 7);
    const dow = (date.getDay() + 6) % 7;
    return {
      id: `cal-${dateKey}`,
      dateKey,
      value: hasValue ? (rawValue as number) : null,
      state: hasValue ? 'filled' : 'empty',
      x: dayLabelWidth + weekOffset * step,
      y: monthLabelHeight + dow * step,
      width: resolvedCellSize,
      height: resolvedCellSize,
      fill: hasValue ? colorScale(rawValue as number) ?? lowColor : lowColor,
    };
  });

  const dayLabels = showDayLabels
    ? CALENDAR_DAY_LABELS.flatMap<SvgCalendarHeatMapLabel>((label, i) => (
        label
          ? [{
              id: `cal-day-${i}`,
              label,
              x: dayLabelWidth - 6,
              y: monthLabelHeight + i * step + step / 2,
            }]
          : []
      ))
    : [];

  const monthLabels = showMonthLabels
    ? timeMonth.range(timeMonth.ceil(startDate), timeDay.offset(endDate, 1))
        .map<SvgCalendarHeatMapLabel>((monthDate) => {
          const weekOffset = Math.floor(timeDay.count(firstMonday, monthDate) / 7);
          return {
            id: `cal-month-${CALENDAR_KEY_FORMAT(monthDate)}`,
            label: CALENDAR_MONTH_FORMAT(monthDate),
            x: dayLabelWidth + weekOffset * step,
            y: monthLabelHeight - 4,
          };
        })
    : [];

  return {
    width,
    height,
    cells: Object.freeze(cells),
    monthLabels: Object.freeze(monthLabels),
    dayLabels: Object.freeze(dayLabels),
    recordedCount,
    startDateKey: CALENDAR_KEY_FORMAT(startDate),
    endDateKey: CALENDAR_KEY_FORMAT(endDate),
  };
}

// ---------------------------------------------------------------------------
// Gantt (time-axis lanes) geometry
// ---------------------------------------------------------------------------

export interface SvgGanttTask {
  readonly id: string;
  readonly name: string;
  readonly start: Date;
  readonly end: Date;
  readonly progress?: number;
  readonly color?: string;
}

export interface SvgGanttBarGeometry {
  readonly id: string;
  readonly name: string;
  readonly index: number;
  readonly duration: ChartGeometryRect;
  readonly progress: ChartGeometryRect | null;
  readonly progressValue: number | null;
  readonly color: string;
  readonly colorSource: 'palette' | 'custom';
  readonly rowLabel: { readonly x: number; readonly y: number };
}

export interface SvgGanttGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly bars: readonly SvgGanttBarGeometry[];
  readonly xTicks: readonly ChartGeometryTick[];
  readonly gridLines: readonly {
    readonly id: string;
    readonly x: number;
    readonly y1: number;
    readonly y2: number;
  }[];
  readonly today:
    | { readonly x: number; readonly y1: number; readonly y2: number; readonly labelX: number; readonly labelY: number }
    | null;
}

export interface BuildSvgGanttGeometryOptions {
  readonly tasks: readonly SvgGanttTask[];
  readonly width: number;
  readonly height: number;
  readonly margin?: ChartGeometryInsets;
  readonly showProgress?: boolean;
  readonly showToday?: boolean;
  readonly colors?: readonly string[];
  /** Injected for deterministic fixtures; defaults to the wall clock. */
  readonly now?: Date;
}

const DEFAULT_GANTT_INSETS: ChartGeometryInsets = Object.freeze({
  top: 20,
  right: 20,
  bottom: 30,
  left: 150,
});

function ganttTickFormat(domainSpanMs: number): (date: Date) => string {
  const days = domainSpanMs / (24 * 60 * 60 * 1000);
  if (days > 730) return timeFormat('%Y');
  if (days > 120) return timeFormat('%b %Y');
  return timeFormat('%b %d');
}

/**
 * Deterministic Gantt geometry. D3 contributes the time scale, band scale and
 * tick generation; the React renderer draws lanes and bars. All marks are
 * absolute so the renderer performs no scale math. `now` is injectable to keep
 * the today marker deterministic under test.
 */
export function buildSvgGanttGeometry({
  tasks,
  width: widthInput,
  height: heightInput,
  margin,
  showProgress = true,
  showToday = true,
  colors,
  now,
}: BuildSvgGanttGeometryOptions): SvgGanttGeometry {
  const width = finiteSize(widthInput, 800);
  const height = finiteSize(heightInput, 400);
  const insets = normalizeInsets(margin, DEFAULT_GANTT_INSETS);
  const plot = plotRect(width, height, insets);
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;

  if (tasks.length === 0 || plot.width === 0 || plot.height === 0) {
    return {
      width,
      height,
      plot,
      bars: Object.freeze([]),
      xTicks: Object.freeze([]),
      gridLines: Object.freeze([]),
      today: null,
    };
  }

  const earliest = tasks.reduce((acc, task) => (task.start < acc ? task.start : acc), tasks[0]!.start);
  const latest = tasks.reduce((acc, task) => (task.end > acc ? task.end : acc), tasks[0]!.end);
  const constantDomain = earliest.getTime() === latest.getTime();
  const domainStart = constantDomain
    ? new Date(earliest.getTime() - 12 * 60 * 60 * 1000)
    : earliest;
  const domainEnd = constantDomain
    ? new Date(latest.getTime() + 12 * 60 * 60 * 1000)
    : latest;

  const x = scaleTime().domain([domainStart, domainEnd]).range([0, plot.width]).nice();
  const y = scaleBand<string>().domain(tasks.map((task) => task.id)).range([0, plot.height]).padding(0.3);
  const [niceStart, niceEnd] = x.domain();
  const tickFormatter = ganttTickFormat(niceEnd.getTime() - niceStart.getTime());
  const bandwidth = y.bandwidth();

  const bars = tasks.map<SvgGanttBarGeometry>((task, index) => {
    const barX = plot.x + x(task.start);
    const barY = plot.y + (y(task.id) ?? 0);
    const durationWidth = Math.max(1, x(task.end) - x(task.start));
    const hasProgress = showProgress && task.progress != null && task.progress > 0;
    return {
      id: task.id,
      name: task.name,
      index,
      duration: { x: barX, y: barY, width: durationWidth, height: bandwidth },
      progress: hasProgress
        ? {
            x: barX,
            y: barY,
            width: Math.max(1, durationWidth * ((task.progress ?? 0) / 100)),
            height: bandwidth,
          }
        : null,
      progressValue: task.progress ?? null,
      color: task.color ?? palette[index % palette.length] ?? 'var(--ds-color-primary)',
      colorSource: task.color ? 'custom' : 'palette',
      rowLabel: { x: plot.x - 8, y: barY + bandwidth / 2 },
    };
  });

  const xTicks = x.ticks(6).map<ChartGeometryTick>((tickDate, index) => ({
    id: `gantt-tick-${index}`,
    label: tickFormatter(tickDate),
    value: tickDate.getTime(),
    x: plot.x + x(tickDate),
    y: plot.y + plot.height,
  }));

  const gridLines = xTicks.map((tick) => ({
    id: `${tick.id}-grid`,
    x: tick.x,
    y1: plot.y,
    y2: plot.y + plot.height,
  }));

  const marker = now ?? new Date();
  const today = showToday
    && Number.isFinite(marker.getTime())
    && marker >= niceStart
    && marker <= niceEnd
    ? {
        x: plot.x + x(marker),
        y1: plot.y,
        y2: plot.y + plot.height,
        labelX: plot.x + x(marker),
        labelY: plot.y - 6,
      }
    : null;

  return {
    width,
    height,
    plot,
    bars: Object.freeze(bars),
    xTicks: Object.freeze(xTicks),
    gridLines: Object.freeze(gridLines),
    today,
  };
}

// ---------------------------------------------------------------------------
// Area geometry (line top edge + filled band; diverging stacking supported)
// ---------------------------------------------------------------------------

/** A single category-anchored point in an area series. */
export interface SvgAreaPoint {
  readonly id: string;
  readonly x: string;
  readonly value: number;
  readonly xLabel?: string;
  readonly valueLabel?: string;
  readonly ariaLabel?: string;
}

/** A named area series. */
export interface SvgAreaSeries {
  readonly id: string;
  readonly label: string;
  readonly color?: string;
  readonly points: readonly SvgAreaPoint[];
}

export interface SvgAreaGeometryPoint extends SvgAreaPoint {
  readonly xPosition: number;
  /** Upper (visible boundary) edge y in px. */
  readonly yPosition: number;
  /** Lower band edge y in px (baseline for independent series, cumulative when stacked). */
  readonly lowerPosition: number;
}

export interface SvgAreaGeometrySeries {
  readonly id: string;
  readonly label: string;
  readonly seriesColor?: string;
  /** Top-edge line path. */
  readonly path: string;
  /** Filled band between the lower edge and the top edge. */
  readonly areaPath: string;
  readonly points: readonly SvgAreaGeometryPoint[];
}

export interface SvgAreaGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly baseline: number;
  readonly stacked: boolean;
  /** True when a stacked cumulative total exceeded the finite numeric range. */
  readonly stackOverflow: boolean;
  readonly series: readonly SvgAreaGeometrySeries[];
  readonly xTicks: readonly ChartGeometryTick[];
  readonly yTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgAreaGeometryOptions {
  readonly series: readonly SvgAreaSeries[];
  readonly width: number;
  readonly height: number;
  readonly curve?: SvgLineCurve;
  readonly stacked?: boolean;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
}

function validAreaPoint(point: SvgAreaPoint): boolean {
  return Number.isFinite(point.value) && typeof point.x === 'string';
}

interface AreaBand {
  readonly lower: number;
  readonly upper: number;
}

/**
 * Builds immutable area geometry. Independent series each rest on the value
 * baseline; stacked series accumulate with a diverging offset (positive
 * contributions above zero, negative below) that mirrors the historical
 * `stackOffsetDiverging` behaviour without owning any DOM.
 */
export function buildSvgAreaGeometry({
  series,
  width: widthInput,
  height: heightInput,
  curve = 'linear',
  stacked = false,
  insets: insetsInput,
  maxTicks = 5,
}: BuildSvgAreaGeometryOptions): SvgAreaGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const tickCount = Number.isSafeInteger(maxTicks) ? Math.max(2, maxTicks) : 5;
  const finiteSeries = series.map((currentSeries) => ({
    ...currentSeries,
    points: currentSeries.points.filter(validAreaPoint),
  }));
  assertUniqueStrings(finiteSeries.map((currentSeries) => currentSeries.id), 'area series id');
  for (const currentSeries of finiteSeries) {
    assertUniqueStrings(
      currentSeries.points.map((point) => point.id),
      `area point id in series ${currentSeries.id}`,
    );
  }
  const categories = uniqueStrings(
    finiteSeries.flatMap((currentSeries) => currentSeries.points.map((point) => String(point.x))),
  );
  const xScale = scalePoint<string>()
    .domain(categories)
    .range([plot.x, plot.x + plot.width])
    .padding(0.25);
  const resolveX = (value: string): number => xScale(value) ?? plot.x;

  const positiveCumulative = new Map<string, number>();
  const negativeCumulative = new Map<string, number>();
  let stackOverflow = false;
  // Sequential order accumulates the diverging stack correctly per category.
  const seriesWithBands = finiteSeries.map((currentSeries) => {
    const bands = new Map<string, AreaBand>();
    for (const point of currentSeries.points) {
      const category = String(point.x);
      if (!stacked) {
        bands.set(category, { lower: 0, upper: point.value });
        continue;
      }
      if (point.value >= 0) {
        const base = positiveCumulative.get(category) ?? 0;
        const next = base + point.value;
        if (!Number.isFinite(next)) stackOverflow = true;
        positiveCumulative.set(category, next);
        bands.set(category, { lower: base, upper: next });
      } else {
        const base = negativeCumulative.get(category) ?? 0;
        const next = base + point.value;
        if (!Number.isFinite(next)) stackOverflow = true;
        negativeCumulative.set(category, next);
        bands.set(category, { lower: base, upper: next });
      }
    }
    return { series: currentSeries, bands };
  });

  const domainValues: number[] = [];
  if (stacked) {
    for (const value of positiveCumulative.values()) domainValues.push(value);
    for (const value of negativeCumulative.values()) domainValues.push(value);
  } else {
    for (const currentSeries of finiteSeries) {
      for (const point of currentSeries.points) domainValues.push(point.value);
    }
  }
  const yScale = scaleLinear()
    .domain(zeroAnchoredDomain(domainValues))
    .nice(tickCount)
    .range([plot.y + plot.height, plot.y]);
  const baseline = yScale(0);

  const curveFactory = curve === 'smooth'
    ? curveMonotoneX
    : curve === 'step'
      ? curveStepAfter
      : curveLinear;
  const lineBuilder = line<SvgAreaGeometryPoint>()
    .x((point) => point.xPosition)
    .y((point) => point.yPosition)
    .curve(curveFactory);
  const areaBuilder = area<SvgAreaGeometryPoint>()
    .x((point) => point.xPosition)
    .y0((point) => point.lowerPosition)
    .y1((point) => point.yPosition)
    .curve(curveFactory);

  const geometrySeries = seriesWithBands.map<SvgAreaGeometrySeries>(({ series: currentSeries, bands }) => {
    const points = currentSeries.points.map<SvgAreaGeometryPoint>((point) => {
      const band = bands.get(String(point.x)) ?? { lower: 0, upper: point.value };
      return {
        ...point,
        xPosition: resolveX(String(point.x)),
        yPosition: yScale(band.upper),
        lowerPosition: yScale(band.lower),
      };
    });
    return {
      id: currentSeries.id,
      label: currentSeries.label,
      seriesColor: currentSeries.color,
      path: lineBuilder(points) ?? '',
      areaPath: areaBuilder(points) ?? '',
      points: Object.freeze(points),
    };
  });

  const xTicks = boundedSample(categories, tickCount).map<ChartGeometryTick>((category) => ({
    id: `x-${category}`,
    label: category,
    value: category,
    x: resolveX(category),
    y: plot.y + plot.height,
  }));
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
    stacked,
    stackOverflow,
    series: Object.freeze(geometrySeries),
    xTicks: Object.freeze(xTicks),
    yTicks: Object.freeze(yTicks),
  };
}

// ---------------------------------------------------------------------------
// Sparkline geometry (micro line variant; no axes or chrome)
// ---------------------------------------------------------------------------

export type SvgSparklineCurve = 'sharp' | 'smooth' | 'step';

export interface SvgSparklineDot {
  readonly cx: number;
  readonly cy: number;
}

export interface SvgSparklineGeometry {
  readonly width: number;
  readonly height: number;
  readonly linePath: string;
  readonly areaPath: string | null;
  readonly endDot: SvgSparklineDot | null;
  readonly minDot: SvgSparklineDot | null;
  readonly maxDot: SvgSparklineDot | null;
  readonly minimum: number;
  readonly maximum: number;
  readonly pointCount: number;
}

export interface BuildSvgSparklineGeometryOptions {
  readonly data: readonly number[];
  readonly width: number;
  readonly height: number;
  readonly curve?: SvgSparklineCurve;
  readonly showEndDot?: boolean;
  readonly showMinMax?: boolean;
  readonly showArea?: boolean;
  readonly paddingX?: number;
  readonly paddingY?: number;
}

/**
 * Builds immutable sparkline geometry. Returns `null` when there is no finite
 * datum to plot, mirroring the family's historical empty guard.
 */
export function buildSvgSparklineGeometry({
  data,
  width: widthInput,
  height: heightInput,
  curve = 'smooth',
  showEndDot = true,
  showMinMax = false,
  showArea = false,
  paddingX = 2,
  paddingY = 2,
}: BuildSvgSparklineGeometryOptions): SvgSparklineGeometry | null {
  const width = finiteSize(widthInput, 100);
  const height = finiteSize(heightInput, 24);
  const points = data.filter((value) => Number.isFinite(value));
  if (points.length === 0) return null;
  const padX = Number.isFinite(paddingX) ? Math.max(0, paddingX) : 2;
  const padY = Number.isFinite(paddingY) ? Math.max(0, paddingY) : 2;
  const innerWidth = Math.max(0, width - padX * 2);
  const innerHeight = Math.max(0, height - padY * 2);
  let minimum = points[0] ?? 0;
  let maximum = points[0] ?? 0;
  for (const value of points) {
    if (value < minimum) minimum = value;
    if (value > maximum) maximum = value;
  }
  const xScale = scaleLinear()
    .domain([0, points.length - 1])
    .range([padX, padX + innerWidth]);
  const yScale = scaleLinear()
    .domain([
      minimum === maximum ? minimum - 0.5 : minimum,
      minimum === maximum ? maximum + 0.5 : maximum,
    ])
    .range([padY + innerHeight, padY]);
  const curveFactory = curve === 'sharp'
    ? curveLinear
    : curve === 'step'
      ? curveStepAfter
      : curveMonotoneX;

  const mutablePoints = [...points];
  const lineGenerator = line<number>()
    .x((_, index) => xScale(index))
    .y((value) => yScale(value))
    .curve(curveFactory);
  const linePath = lineGenerator(mutablePoints) ?? '';

  let areaPath: string | null = null;
  if (showArea) {
    const areaGenerator = area<number>()
      .x((_, index) => xScale(index))
      .y0(padY + innerHeight)
      .y1((value) => yScale(value))
      .curve(curveFactory);
    areaPath = areaGenerator(mutablePoints) ?? null;
  }

  const lastValue = points[points.length - 1] ?? 0;
  const endDot: SvgSparklineDot | null = showEndDot
    ? { cx: xScale(points.length - 1), cy: yScale(lastValue) }
    : null;

  let minDot: SvgSparklineDot | null = null;
  let maxDot: SvgSparklineDot | null = null;
  if (showMinMax && points.length > 1) {
    let minIndex = 0;
    let maxIndex = 0;
    for (let index = 1; index < points.length; index += 1) {
      if ((points[index] ?? 0) < (points[minIndex] ?? 0)) minIndex = index;
      if ((points[index] ?? 0) > (points[maxIndex] ?? 0)) maxIndex = index;
    }
    if (!showEndDot || minIndex !== points.length - 1) {
      minDot = { cx: xScale(minIndex), cy: yScale(points[minIndex] ?? 0) };
    }
    if (!showEndDot || maxIndex !== points.length - 1) {
      maxDot = { cx: xScale(maxIndex), cy: yScale(points[maxIndex] ?? 0) };
    }
  }

  return {
    width,
    height,
    linePath,
    areaPath,
    endDot,
    minDot,
    maxDot,
    minimum,
    maximum,
    pointCount: points.length,
  };
}

// ---------------------------------------------------------------------------
// Histogram geometry (contiguous distribution bars; d3.bin is layout math)
// ---------------------------------------------------------------------------

export interface SvgHistogramBin {
  readonly id: string;
  readonly x0: number;
  readonly x1: number;
  readonly count: number;
  /** Probability density for this bin (count / (n * width)). */
  readonly densityValue: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly labelX: number;
  readonly labelY: number;
}

export interface SvgHistogramCumulativePoint {
  readonly cx: number;
  readonly cy: number;
  readonly ratio: number;
}

export interface SvgHistogramCumulative {
  readonly path: string;
  readonly points: readonly SvgHistogramCumulativePoint[];
  readonly axisTicks: readonly ChartGeometryTick[];
}

export interface SvgHistogramGeometry {
  readonly width: number;
  readonly height: number;
  readonly plot: ChartGeometryRect;
  readonly density: boolean;
  readonly bins: readonly SvgHistogramBin[];
  readonly cumulative: SvgHistogramCumulative | null;
  readonly valueDomainMax: number;
  readonly xTicks: readonly ChartGeometryTick[];
  readonly yTicks: readonly ChartGeometryTick[];
}

export interface BuildSvgHistogramGeometryOptions {
  readonly values: readonly number[];
  readonly width: number;
  readonly height: number;
  readonly bins?: number;
  readonly thresholds?: readonly number[];
  readonly density?: boolean;
  readonly cumulative?: boolean;
  readonly insets?: ChartGeometryInsets;
  readonly maxTicks?: number;
}

/** Sturges' formula bin count: ceil(log2(n) + 1). */
function sturgesBinCount(n: number): number {
  if (n <= 0) return 1;
  return Math.ceil(Math.log2(n) + 1);
}

/**
 * Builds immutable histogram geometry. `d3.bin` (layout math, never DOM) owns
 * the binning; the optional cumulative distribution overlay is expressed as a
 * pure line path against a secondary 0..1 axis.
 */
export function buildSvgHistogramGeometry({
  values,
  width: widthInput,
  height: heightInput,
  bins: binCount,
  thresholds,
  density = false,
  cumulative = false,
  insets: insetsInput,
  maxTicks = 5,
}: BuildSvgHistogramGeometryOptions): SvgHistogramGeometry {
  const width = finiteSize(widthInput, 640);
  const height = finiteSize(heightInput, 360);
  const insets = normalizeInsets(insetsInput, DEFAULT_CARTESIAN_INSETS);
  const plot = plotRect(width, height, insets);
  const tickCount = Number.isSafeInteger(maxTicks) ? Math.max(2, maxTicks) : 5;
  const finiteValues = values.filter((value) => Number.isFinite(value));
  const resolvedBinCount = Number.isFinite(binCount)
    ? Math.min(512, Math.max(1, Math.floor(binCount as number)))
    : sturgesBinCount(finiteValues.length);
  const finiteThresholds = thresholds
    ?.filter((value) => Number.isFinite(value))
    .slice()
    .sort((left, right) => left - right);

  interface RawBin {
    readonly x0: number;
    readonly x1: number;
    readonly length: number;
  }
  let histogramBins: RawBin[] = [];
  if (finiteValues.length > 0) {
    const binGenerator = createBinLayout<number, number>().value((datum) => datum);
    if (finiteThresholds && finiteThresholds.length > 0) {
      binGenerator.thresholds(finiteThresholds);
    } else {
      binGenerator.thresholds(resolvedBinCount);
    }
    histogramBins = binGenerator([...finiteValues]).map((currentBin) => ({
      x0: currentBin.x0 ?? 0,
      x1: currentBin.x1 ?? 0,
      length: currentBin.length,
    }));
  }

  const firstBin = histogramBins[0];
  const lastBin = histogramBins[histogramBins.length - 1];
  const xMin = firstBin?.x0 ?? 0;
  const xMax = lastBin?.x1 ?? 0;
  const xScale = scaleLinear().domain([xMin, xMax]).range([plot.x, plot.x + plot.width]);

  const densityValues = histogramBins.map((currentBin) => {
    const binWidth = currentBin.x1 - currentBin.x0;
    return binWidth > 0 && finiteValues.length > 0
      ? currentBin.length / (finiteValues.length * binWidth)
      : 0;
  });
  const yValues = histogramBins.map((currentBin, index) =>
    density ? densityValues[index] ?? 0 : currentBin.length,
  );
  const valueDomainMax = yValues.length > 0 ? Math.max(...yValues) : 0;
  const yScale = scaleLinear()
    .domain([0, valueDomainMax])
    .nice(tickCount)
    .range([plot.y + plot.height, plot.y]);

  const bins = histogramBins.map<SvgHistogramBin>((currentBin, index) => {
    const yValue = yValues[index] ?? 0;
    const barY = yScale(yValue);
    return {
      id: `bin-${index}`,
      x0: currentBin.x0,
      x1: currentBin.x1,
      count: currentBin.length,
      densityValue: densityValues[index] ?? 0,
      x: xScale(currentBin.x0) + 1,
      y: barY,
      width: Math.max(0, xScale(currentBin.x1) - xScale(currentBin.x0) - 1),
      height: (plot.y + plot.height) - barY,
      labelX: (xScale(currentBin.x0) + xScale(currentBin.x1)) / 2,
      labelY: barY - 5,
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
    label: density ? Number(value.toFixed(4)).toString() : tickLabel(value),
    value,
    x: plot.x,
    y: yScale(value),
  }));

  let cumulativeGeometry: SvgHistogramCumulative | null = null;
  if (cumulative && finiteValues.length > 0 && histogramBins.length > 0) {
    const yCumulative = scaleLinear().domain([0, 1]).range([plot.y + plot.height, plot.y]);
    const total = finiteValues.length;
    const cumulativePoints: SvgHistogramCumulativePoint[] = [
      { cx: xScale(firstBin?.x0 ?? 0), cy: yCumulative(0), ratio: 0 },
    ];
    let running = 0;
    for (const currentBin of histogramBins) {
      running += currentBin.length;
      const ratio = running / total;
      cumulativePoints.push({ cx: xScale(currentBin.x1), cy: yCumulative(ratio), ratio });
    }
    const cumulativeLine = line<SvgHistogramCumulativePoint>()
      .x((point) => point.cx)
      .y((point) => point.cy);
    const axisTicks = boundedSample(yCumulative.ticks(tickCount), tickCount).map<ChartGeometryTick>((value) => ({
      id: `cumulative-${value}`,
      label: `${Math.round(value * 100)}%`,
      value,
      x: plot.x + plot.width,
      y: yCumulative(value),
    }));
    cumulativeGeometry = {
      path: cumulativeLine(cumulativePoints) ?? '',
      points: Object.freeze(cumulativePoints),
      axisTicks: Object.freeze(axisTicks),
    };
  }

  return {
    width,
    height,
    plot,
    density,
    bins: Object.freeze(bins),
    cumulative: cumulativeGeometry,
    valueDomainMax,
    xTicks: Object.freeze(xTicks),
    yTicks: Object.freeze(yTicks),
  };
}

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
