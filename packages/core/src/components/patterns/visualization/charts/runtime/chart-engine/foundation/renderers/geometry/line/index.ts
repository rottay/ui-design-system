import {
  area,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  line,
  scaleLinear,
  scalePoint,
  scaleUtc,
} from 'd3';

import {
  DEFAULT_CARTESIAN_INSETS,
  finiteSize,
  normalizeInsets,
  plotRect,
  zeroAnchoredDomain,
  expandedDomain,
  tickLabel,
  uniqueStrings,
  boundedSample,
  assertUniqueStrings,
  type ChartGeometryInsets,
  type ChartGeometryRect,
  type ChartGeometryTick,
  type SvgLineCurve,
} from '../foundation';

export type SvgLineXValue = string | number;
export type SvgLineXType = 'category' | 'linear' | 'time';

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
