import {
  area,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  line,
  scaleLinear,
  scalePoint,
} from 'd3';

import {
  DEFAULT_CARTESIAN_INSETS,
  MAX_CARTESIAN_TICKS,
  finiteSize,
  normalizeInsets,
  plotRect,
  zeroAnchoredDomain,
  tickLabel,
  uniqueStrings,
  boundedSample,
  assertUniqueStrings,
  type ChartGeometryInsets,
  type ChartGeometryRect,
  type ChartGeometryTick,
  type SvgLineCurve,
} from '../kernel';

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
  const tickCount = Number.isSafeInteger(maxTicks)
    ? Math.min(MAX_CARTESIAN_TICKS, Math.max(2, maxTicks))
    : 5;
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
