'use client';

/**
 * @fileoverview ScatterChart -- D3-backed scatter/bubble chart using `scaleLinear` for both axes.
 * Each data point is rendered as a circle positioned by its x/y values. Optional bubble mode maps
 * a `size` field to circle radius via `scaleSqrt`. Supports an optional least-squares linear trend
 * line, grid lines, tooltips, and fade-in animation on mount.
 *
 * @example
 * <ScatterChart
 *   data={[
 *     { x: 10, y: 20, label: 'A' },
 *     { x: 30, y: 50, label: 'B', size: 80 },
 *     { x: 50, y: 40, label: 'C', size: 120 },
 *   ]}
 *   xLabel="Revenue ($K)"
 *   yLabel="Growth (%)"
 *   bubble
 *   trendLine
 *   height={400}
 *   title="Revenue vs Growth"
 * />
 */

import { memo, useEffect, useRef } from 'react';
import { axisBottom, axisLeft, extent, max, min, scaleLinear, scaleSqrt, select } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';
import { ChartTooltip, TooltipSeries } from '../tooltip';
import { createChartCrosshair, pointerToContainerPosition } from '../tooltip/crosshair';

/** A single data point in the scatter plot. */
export interface ScatterDataPoint {
  /** Horizontal axis value */
  x: number;
  /** Vertical axis value */
  y: number;
  /** Optional bubble size (used when bubble mode is enabled) */
  size?: number;
  /** Optional color override for this point */
  color?: string;
  /** Optional label shown in tooltip */
  label?: string;
  /** Additional custom properties accessible in render callbacks */
  [key: string]: unknown;
}

/** Props for the {@link ScatterChart} component. */
export interface ScatterChartProps extends ChartBaseProps {
  data: ScatterDataPoint[];
  /** X axis label */
  xLabel?: string;
  /** Y axis label */
  yLabel?: string;
  /** Default point radius. Default: 5 */
  pointRadius?: number;
  /** Enable bubble mode (radius mapped from data.size). Default: false */
  bubble?: boolean;
  /** Radius range for bubble mode [min, max]. Default: [4, 30] */
  sizeRange?: [number, number];
  /** Show grid lines. Default: true */
  grid?: boolean;
  /** Point fill opacity. Default: 0.7 */
  opacity?: number;
  /** Show linear trend line (least squares). Default: false */
  trendLine?: boolean;
}

/**
 * Computes the slope and intercept for a simple linear regression (least squares)
 * over the provided data points. Returns null if fewer than 2 points.
 */
function linearRegression(data: ScatterDataPoint[]): { slope: number; intercept: number } | null {
  if (data.length < 2) return null;

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * Renders a scatter or bubble chart powered by D3's `scaleLinear` for both axes.
 * Optional linear trend line, grid, tooltips, and fade-in animation.
 *
 * @param props - See {@link ScatterChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const ScatterChart = memo(function ScatterChart({
  data,
  xLabel,
  yLabel,
  pointRadius = 5,
  bubble = false,
  sizeRange = [4, 30],
  grid = true,
  opacity = 0.7,
  trendLine = false,
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  legend = false,
  animate,
  responsive = true,
  colors = DEFAULT_COLORS,
  tooltip,
  margin = DEFAULT_MARGIN,
  compact,
  autoCompact,
  compactBreakpoint,
}: ScatterChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const { show: showTooltip, hide: hideTooltip, tooltipProps } = useChartTooltip();
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;

  const summary = {
    caption: title ? `${title} data summary` : 'Scatter chart data summary',
    headers: ['Label', 'X', 'Y', ...(bubble ? ['Size'] : [])],
    rows: data.map((point) => [
      point.label ?? '-',
      point.x,
      point.y,
      ...(bubble ? [point.size ?? '-'] : []),
    ]),
  };

  // Collect unique colors for a legend when points have explicit colors
  const legendNode = legend ? (
    <div data-part="legend" data-variant={bubble ? 'bubble' : 'scatter'} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {data
        .filter((d) => d.label)
        .slice(0, 10) // Limit legend to 10 items to avoid clutter
        .map((d, i) => (
          <div key={d.label ?? i} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span
              data-part="legend-swatch"
              style={{
                width: 10,
                height: 10,
                backgroundColor: d.color ?? colors[i % colors.length],
                display: 'inline-block',
              }}
            />
            <span data-part="legend-label">{d.label}</span>
          </div>
        ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('data-variant', bubble ? 'bubble' : 'scatter')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale with 5% padding on each side so points don't sit on axes
    const xExtent = extent(data, (d) => d.x) as [number, number];
    const xPadding = (xExtent[1] - xExtent[0]) * 0.05 || 1;
    const x = scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .nice()
      .range([0, innerWidth]);

    // Y scale with 5% padding
    const yExtent = extent(data, (d) => d.y) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.05 || 1;
    const y = scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .nice()
      .range([innerHeight, 0]);

    // Bubble size scale (sqrt so area scales linearly with value)
    const sizeScale = bubble
      ? scaleSqrt()
          .domain([min(data, (d) => d.size ?? 1) ?? 1, max(data, (d) => d.size ?? 1) ?? 1])
          .range(sizeRange)
      : null;

    // X axis
    g.append('g')
      .attr('data-part', 'axis')
      .attr('data-axis', 'x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x).ticks(tickCount))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    // Y axis
    g.append('g')
      .attr('data-part', 'axis')
      .attr('data-axis', 'y')
      .call(axisLeft(y).ticks(tickCount))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    // Grid lines
    if (grid) {
      // Horizontal grid
      g.append('g')
        .attr('class', 'grid-h')
        .attr('data-part', 'grid')
        .attr('data-axis', 'y')
        .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
        .selectAll('line')
        .attr('data-part', 'grid-line')
        .style('stroke-opacity', 0.5);

      g.selectAll('.grid-h .domain').remove();

      // Vertical grid
      g.append('g')
        .attr('class', 'grid-v')
        .attr('data-part', 'grid')
        .attr('data-axis', 'x')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(axisBottom(x).ticks(tickCount).tickSize(-innerHeight).tickFormat(() => ''))
        .selectAll('line')
        .attr('data-part', 'grid-line')
        .style('stroke-opacity', 0.5);

      g.selectAll('.grid-v .domain').remove();
    }

    // Trend line (rendered behind points)
    if (trendLine) {
      const regression = linearRegression(data);
      if (regression) {
        const xDomain = x.domain();
        const x1 = xDomain[0];
        const x2 = xDomain[1];
        const y1 = regression.slope * x1 + regression.intercept;
        const y2 = regression.slope * x2 + regression.intercept;

        const line = g
          .append('line')
          .attr('data-part', 'trend-line')
          .attr('x1', x(x1))
          .attr('x2', x(x2))
          .attr('y1', y(y1))
          .attr('y2', y(y2))
          .style('stroke-width', 1.5)
          .style('stroke-dasharray', '6,4')
          .style('opacity', 0.6);

        if (chartPersonality.animate) {
          line
            .style('opacity', 0)
            .transition()
            .duration(chartPersonality.animationDuration)
            .delay(data.length * 20)
            .style('opacity', 0.6);
        }
      }
    }

    // Data points
    const circles = g
      .selectAll('.scatter-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'scatter-point')
      .attr('data-part', 'series-point')
      .attr('data-state', 'idle')
      .attr('cx', (d) => x(d.x))
      .attr('cy', (d) => y(d.y))
      .attr('r', (d) => {
        if (bubble && sizeScale && d.size != null) {
          return sizeScale(d.size);
        }
        return pointRadius;
      })
      .attr('fill', (d, i) => d.color ?? colors[i % colors.length])
      .attr('fill-opacity', opacity)
      .attr('stroke', (d, i) => d.color ?? colors[i % colors.length])
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.9);

    // Crosshair + tooltip, attached per-point (scatter points are already
    // discrete hit targets -- unlike line/bar there is no "nearest x" to
    // snap to between them) -- replaces the native <title> tooltip so hover
    // feedback is consistent with the rest of the chart family.
    if (chartPersonality.tooltip) {
      const crosshair = createChartCrosshair(g, innerWidth, innerHeight);

      circles
        .style('cursor', 'pointer')
        .on('mouseenter mousemove', (event: MouseEvent, d) => {
          select(event.currentTarget as SVGCircleElement).attr('data-state', 'hovered');
          const cx = x(d.x);
          const cy = y(d.y);
          const color = String(select(event.currentTarget as SVGCircleElement).attr('fill'));

          crosshair.show(cx, [{ y: cy, color }], cy);

          const pos = pointerToContainerPosition(event, containerRef.current);
          if (!pos) return;

          const compact = compactState.compactTooltip;
          showTooltip(
            pos.x,
            pos.y,
            <TooltipSeries
              title={compact ? undefined : d.label}
              items={[
                { name: compact ? '' : 'x', value: d.x, color },
                { name: compact ? '' : 'y', value: d.y, color },
                ...(bubble && d.size != null ? [{ name: compact ? '' : 'size', value: d.size, color }] : []),
              ]}
            />
          );
        })
        .on('mouseleave', (event: MouseEvent) => {
          select(event.currentTarget as SVGCircleElement).attr('data-state', 'idle');
          crosshair.hide();
          hideTooltip();
        });
    }

    // Fade-in animation
    if (chartPersonality.animate) {
      circles
        .attr('opacity', 0)
        .attr('r', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 20)
        .attr('opacity', 1)
        .attr('r', (d) => {
          if (bubble && sizeScale && d.size != null) {
            return sizeScale(d.size);
          }
          return pointRadius;
        });
    }

    // Axis labels
    if (xLabel) {
      svg
        .append('text')
        .attr('data-part', 'axis-label')
        .attr('data-axis', 'x')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight - 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(xLabel);
    }

    if (yLabel) {
      svg
        .append('text')
        .attr('data-part', 'axis-label')
        .attr('data-axis', 'y')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(yLabel);
    }

    // Style axis lines
    svg.selectAll('.domain').attr('data-part', 'axis-domain');
    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');

    // Data/dimension changes rebuild the svg from scratch (selectAll('*').remove()
    // above), which would otherwise leave a stale React-side tooltip pointing at
    // removed nodes.
    return () => {
      hideTooltip();
    };
  }, [data, chartWidth, chartHeight, pointRadius, bubble, sizeRange, grid, opacity, trendLine, chartPersonality, colors, margin, xLabel, yLabel, tickCount, compactState.compactTooltip, showTooltip, hideTooltip]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-scatter', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Scatter chart'}
      ariaDescription={describeChart('Scatter chart', data.length, subtitle, [
        bubble ? 'Bubble mode enabled.' : null,
        trendLine ? 'Trend line shown.' : null,
        grid ? 'Grid lines visible.' : null,
        xLabel ? `X axis: ${xLabel}.` : null,
        yLabel ? `Y axis: ${yLabel}.` : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      overlay={<ChartTooltip {...tooltipProps} />}
    />
  );
});
