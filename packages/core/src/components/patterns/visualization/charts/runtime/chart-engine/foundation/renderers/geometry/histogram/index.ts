import { bin as createBinLayout, line, scaleLinear } from 'd3';

import {
  DEFAULT_CARTESIAN_INSETS,
  MAX_CARTESIAN_TICKS,
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
  const tickCount = Number.isSafeInteger(maxTicks)
    ? Math.min(MAX_CARTESIAN_TICKS, Math.max(2, maxTicks))
    : 5;
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
