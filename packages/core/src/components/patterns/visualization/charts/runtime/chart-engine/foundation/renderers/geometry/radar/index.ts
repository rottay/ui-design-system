import { DEFAULT_COLORS } from '../../../../../../foundation/palettes';

import { finiteSize } from '../foundation';

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
