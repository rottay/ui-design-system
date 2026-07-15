'use client';

/**
 * @fileoverview HeatMap -- D3-backed matrix heatmap using `scaleBand` for both axes and
 * `scaleSequential` with `interpolateRgb` for the two-stop colour gradient. Each cell is a
 * rounded `<rect>` positioned by the band scales. The sequential scale maps the data's min-max
 * range to the provided `colorRange`, making it suitable for magnitude displays (not diverging
 * data). Cells animate with a staggered fade-in on mount.
 *
 * @example
 * <HeatMap
 *   data={[
 *     { x: 'Mon', y: '9am', value: 12 },
 *     { x: 'Mon', y: '10am', value: 8 },
 *     { x: 'Tue', y: '9am', value: 20 },
 *   ]}
 *   colorRange={['#eef', '#3366ff']}
 *   cellRadius={4}
 *   height={300}
 *   title="Weekly Activity"
 * />
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import {
  axisBottom,
  axisLeft,
  color as parseColor,
  extent,
  interpolateRgb,
  scaleBand,
  scaleSequential,
  select,
} from 'd3';

import type { ChartBaseProps, ChartMarginProps } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartTheme } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';
import { resolveCssColor } from '../utils/resolve-css-color';

const DEFAULT_HEATMAP_COLOR_RANGE: [string, string] = [
  'var(--ds-color-info-bg)',
  'var(--ds-color-primary-500)',
];
const DEFAULT_HEATMAP_MARGIN = { top: 20, right: 20, bottom: 60, left: 80 };
const LOW_COLOR_FALLBACK = '#e5e7eb';
const HIGH_COLOR_FALLBACK = '#0072b2';

function resolveD3Color(
  value: string,
  owner: HTMLElement | SVGElement | null,
  fallback: string,
): string {
  const resolved = resolveCssColor(value, owner, fallback);
  return parseColor(resolved)?.formatRgb() ?? fallback;
}

function sequentialDomain(values: number[]): [number, number] {
  const [minimum, maximum] = extent(values) as [number, number];
  if (minimum !== maximum) return [minimum, maximum];
  if (minimum > 0) return [0, minimum];
  if (minimum < 0) return [minimum, 0];
  return [0, 1];
}

/** Props for the {@link HeatMap} component. */
export interface HeatMapProps extends ChartBaseProps, ChartMarginProps {
  data: { x: string; y: string; value: number }[];
  xLabels?: string[];
  yLabels?: string[];
  colorRange?: [string, string];
  cellRadius?: number;
}

/**
 * Renders a matrix heatmap using D3's `scaleBand` for axes and `scaleSequential` for colour.
 *
 * @param props - See {@link HeatMapProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table.
 */
export const HeatMap = memo(function HeatMap({
  data,
  xLabels: xLabelsProp,
  yLabels: yLabelsProp,
  colorRange = DEFAULT_HEATMAP_COLOR_RANGE,
  cellRadius = 2,
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  animate = true,
  responsive = true,
  tooltip = true,
  margin = DEFAULT_HEATMAP_MARGIN,
}: HeatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  // The stable ref form resolves after mount and changes identity whenever
  // this chart's provider ancestry mutates. The D3 effect can then repaint
  // tenant colors without reading document-global theme state.
  const chartTheme = useChartTheme(containerRef);
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const finiteData = useMemo(
    () => data.filter((item) => Number.isFinite(item.value)),
    [data],
  );
  const summary = useMemo(() => ({
    caption: title ? `${title} data summary` : 'Heatmap data summary',
    headers: ['X', 'Y', 'Value'],
    rows: finiteData.map((item) => [item.x, item.y, item.value]),
  }), [finiteData, title]);

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const svg = select(svgNode);
    svg.selectAll('*').interrupt().remove();

    const safeChartWidth = Number.isFinite(chartWidth) ? Math.max(0, chartWidth) : 0;
    const safeChartHeight = Number.isFinite(chartHeight) ? Math.max(0, chartHeight) : 0;
    svg.attr('width', safeChartWidth).attr('height', safeChartHeight);

    if (finiteData.length === 0) return;

    const innerWidth = Math.max(0, safeChartWidth - margin.left - margin.right);
    const innerHeight = Math.max(0, safeChartHeight - margin.top - margin.bottom);
    if (innerWidth === 0 || innerHeight === 0) return;

    // Derive axis labels from data when the consumer does not provide them
    // explicitly; Set preserves insertion order for a stable axis layout.
    const xLabels = xLabelsProp ?? [...new Set(finiteData.map((d) => d.x))];
    const yLabels = yLabelsProp ?? [...new Set(finiteData.map((d) => d.y))];

    // 5% padding between cells visually separates them while preserving the
    // grid alignment; bandwidth() accounts for this padding automatically.
    const x = scaleBand().domain(xLabels).range([0, innerWidth]).padding(0.05);
    const y = scaleBand().domain(yLabels).range([0, innerHeight]).padding(0.05);

    // Sequential color scale maps the data's value range to a two-stop gradient.
    // This is preferred over a diverging scale because heatmaps here represent
    // magnitude, not deviation from a midpoint.
    const colorOwner = containerRef.current ?? svgNode;
    const lowColor = resolveD3Color(colorRange[0], colorOwner, LOW_COLOR_FALLBACK);
    const highColor = resolveD3Color(colorRange[1], colorOwner, HIGH_COLOR_FALLBACK);
    const colorScale = scaleSequential<string>()
      .domain(sequentialDomain(finiteData.map((item) => item.value)))
      .interpolator(interpolateRgb(lowColor, highColor));

    const g = svg
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end');

    // Y axis
    g.append('g')
      .call(axisLeft(y))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '11px');

    // Each cell is one rect whose fill is computed via the sequential colour
    // scale. The staggered 10ms delay creates a "wave" reveal across the matrix.
    const cells = g
      .selectAll('.cell')
      .data(finiteData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('data-part', 'cell')
      .attr('x', (d) => x(d.x) ?? 0)
      .attr('y', (d) => y(d.y) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', cellRadius)
      .attr('fill', (d) => colorScale(d.value));

    if (chartPersonality.animate) {
      cells
        .attr('opacity', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 10)
        .attr('opacity', 1);
    }

    if (chartPersonality.tooltip) {
      cells.append('title').text((d) => `${d.x}, ${d.y}: ${d.value}`);
    }

    svg.selectAll('.domain').attr('data-part', 'axis-domain');
    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');

    return () => {
      svg.selectAll('*').interrupt();
    };
  }, [
    finiteData,
    chartWidth,
    chartHeight,
    xLabelsProp,
    yLabelsProp,
    colorRange,
    cellRadius,
    chartPersonality.animate,
    chartPersonality.animationDuration,
    chartPersonality.tooltip,
    chartTheme,
    margin,
  ]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-heatmap', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Heatmap'}
      ariaDescription={describeChart('Heatmap', finiteData.length, subtitle)}
      summary={summary}
    />
  );
});
