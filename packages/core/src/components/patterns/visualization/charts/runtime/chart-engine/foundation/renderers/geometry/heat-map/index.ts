import { interpolateRgb, scaleBand, scaleSequential } from 'd3';

import { DEFAULT_COLORS } from '../../../../../../foundation/palettes';

import {
  DEFAULT_HEATMAP_INSETS,
  finiteSize,
  normalizeInsets,
  plotRect,
  sequentialDomain,
  uniqueStrings,
  assertUniqueStrings,
  normalizedConcreteColor,
  type ChartGeometryInsets,
  type ChartGeometryRect,
  type ChartGeometryTick,
} from '../kernel';

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
