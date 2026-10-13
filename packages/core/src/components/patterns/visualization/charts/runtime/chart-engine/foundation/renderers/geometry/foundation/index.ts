import { color as parseColor } from 'd3';

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

export type SvgLineCurve = 'linear' | 'smooth' | 'step';

export {
  finiteSize,
  normalizeInsets,
  plotRect,
  zeroAnchoredDomain,
  expandedDomain,
  sequentialDomain,
  tickLabel,
  uniqueStrings,
  boundedSample,
  assertUniqueStrings,
  normalizedConcreteColor,
};
