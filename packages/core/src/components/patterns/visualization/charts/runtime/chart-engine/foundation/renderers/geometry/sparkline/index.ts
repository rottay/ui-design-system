import { area, curveLinear, curveMonotoneX, curveStepAfter, line, scaleLinear } from 'd3';

import { finiteSize } from '../kernel';

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
