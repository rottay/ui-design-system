/**
 * Immutable geometry builders for the React-owned SVG chart renderers.
 *
 * D3 is deliberately limited to scales, paths and interpolation. This module
 * never selects, appends, removes or mutates DOM nodes.
 */

import {
  arc as createArcPath,
  area,
  color as parseColor,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  interpolateRgb,
  line,
  pie as createPieLayout,
  scaleBand,
  scaleLinear,
  scalePoint,
  scaleSequential,
  scaleSqrt,
  scaleUtc,
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
}: BuildSvgRadarGeometryOptions): SvgRadarGeometry {
  const width = finiteSize(widthInput, 400);
  const height = finiteSize(heightInput, 400);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(1, Math.min(width, height) / 2 - 40);
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
