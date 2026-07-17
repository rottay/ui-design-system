'use client';

/**
 * @fileoverview LineChart -- D3-backed multi-series line chart supporting category, time, and
 * linear x-axis types. Uses `scalePoint` (category), `scaleTime`, or `scaleLinear` for x depending
 * on `xType`. Line paths are drawn with D3 `line()` generator and optionally filled with `area()`.
 * Animation uses the stroke-dashoffset "drawing" trick for a progressive reveal effect.
 *
 * @example
 * <LineChart
 *   series={[{ name: 'Revenue', data: [{ x: 'Jan', y: 100 }, { x: 'Feb', y: 240 }] }]}
 *   curved
 *   showDots
 *   showArea
 *   height={350}
 *   title="Monthly Revenue"
 * />
 */

import { memo, useEffect, useId, useMemo, useRef } from 'react';
import { arrayValueAt } from '@/foundation/kernel/collections';
import {
  area,
  axisBottom,
  axisLeft,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  line,
  scaleLinear,
  scalePoint,
  scaleTime,
  select,
  type ScaleLinear,
  type ScalePoint,
  type ScaleTime,
} from 'd3';

import type {
  ChartBaseProps,
  ChartCartesianCompactConfig,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartCompactProps,
  ChartLegendProps,
  ChartMarginProps,
  Series,
} from '../../contracts';
import { DEFAULT_MARGIN } from '../../foundation/geometry';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { ChartTooltip, TooltipSeries } from '../../presentation/tooltip';
import { createChartCrosshair, nearestIndexByPixel, plotLocalPointerPosition, pointerToContainerPosition } from '../../presentation/crosshair';

type LinePoint = Series['data'][number];
const FALLBACK_LINE_COLOR = 'var(--ds-color-primary)';

function lineColor(palette: readonly string[], index: number): string {
  return arrayValueAt(palette, palette.length > 0 ? index % palette.length : 0) ?? FALLBACK_LINE_COLOR;
}

function timeValue(value: LinePoint['x']): number | null {
  const timestamp = value instanceof Date
    ? value.getTime()
    : new Date(value as string | number).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function validPoint(point: LinePoint, xType: LineChartProps['xType']): boolean {
  if (!Number.isFinite(point.y)) return false;
  if (xType === 'time') return timeValue(point.x) !== null;
  if (xType === 'linear') return typeof point.x === 'number' && Number.isFinite(point.x);
  if (point.x instanceof Date) return Number.isFinite(point.x.getTime());
  if (typeof point.x === 'number') return Number.isFinite(point.x);
  return typeof point.x === 'string';
}

function sameXValue(
  left: LinePoint['x'],
  right: LinePoint['x'],
  xType: LineChartProps['xType'],
): boolean {
  if (xType === 'time') return timeValue(left) === timeValue(right);
  if (xType === 'linear') return left === right;
  return String(left) === String(right);
}

function expandedDomain(minimum: number, maximum: number): [number, number] {
  if (minimum !== maximum) return [minimum, maximum];
  const delta = Math.max(Math.abs(minimum) * 0.01, 1);
  const lower = minimum - delta;
  const upper = maximum + delta;
  if (Number.isFinite(lower) && Number.isFinite(upper) && lower < upper) return [lower, upper];
  if (minimum > 0) return [0, minimum];
  if (minimum < 0) return [minimum, 0];
  return [-1, 1];
}

function zeroAnchoredDomain(values: number[]): [number, number] {
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  return expandedDomain(minimum, maximum);
}

/** Props for the {@link LineChart} component. */
export interface LineChartProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartColorSchemeProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  series: Series[];
  curved?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xType?: 'category' | 'time' | 'linear';
}

/**
 * Renders a multi-series line chart with optional area fill and interactive dots.
 *
 * @param props - See {@link LineChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const LineChart = memo(function LineChart({
  series,
  curved,
  showDots,
  showArea = false,
  xAxisLabel,
  yAxisLabel,
  xType = 'category',
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  legend = true,
  animate,
  responsive = true,
  colors,
  colorScheme,
  tooltip,
  margin = DEFAULT_MARGIN,
  compact,
  compactMode,
  autoCompact,
  compactBreakpoint,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientScope = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, showDots, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const { show: showTooltip, hide: hideTooltip, tooltipProps } = useChartTooltip();
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;
  const finiteSeries = useMemo(() => series.map((currentSeries) => ({
    ...currentSeries,
    data: currentSeries.data.filter((point) => validPoint(point, xType)),
  })), [series, xType]);
  const pointCount = finiteSeries.reduce((count, currentSeries) => count + currentSeries.data.length, 0);
  const summary = {
    caption: title ? `${title} data summary` : 'Line chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: finiteSeries.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };
  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {finiteSeries.map((s, i) => (
        <div key={`${s.name}-${i}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 3, backgroundColor: s.color ?? lineColor(palette, i), display: 'inline-block' }} />
          <span data-part="legend-label">{s.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const svg = select(svgNode);
    svg.selectAll('*').interrupt().remove();

    const safeChartWidth = Number.isFinite(chartWidth) ? Math.max(0, chartWidth) : 0;
    const safeChartHeight = Number.isFinite(chartHeight) ? Math.max(0, chartHeight) : 0;
    svg.attr('width', safeChartWidth).attr('height', safeChartHeight);

    const allPoints = finiteSeries.flatMap((currentSeries) => currentSeries.data);
    const innerWidth = Math.max(0, safeChartWidth - margin.left - margin.right);
    const innerHeight = Math.max(0, safeChartHeight - margin.top - margin.bottom);
    if (allPoints.length === 0 || innerWidth === 0 || innerHeight === 0) {
      hideTooltip();
      return;
    }

    const g = svg
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('data-x-type', xType)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale -- the type union is necessary because D3's scale factories return
    // incompatible types; the helper `getX` below unifies access with type guards.
    let x: ScalePoint<string> | ScaleTime<number, number> | ScaleLinear<number, number>;

    if (xType === 'time') {
      const timestamps = allPoints.map((point) => timeValue(point.x) as number);
      const [minimum, maximum] = expandedDomain(Math.min(...timestamps), Math.max(...timestamps));
      x = scaleTime()
        .domain([new Date(minimum), new Date(maximum)])
        .range([0, innerWidth]);
    } else if (xType === 'linear') {
      const xValues = allPoints.map((point) => point.x as number);
      x = scaleLinear()
        .domain(expandedDomain(Math.min(...xValues), Math.max(...xValues)))
        .range([0, innerWidth]);
    } else {
      const categories = [...new Set(allPoints.map((d) => String(d.x)))];
      x = scalePoint().domain(categories).range([0, innerWidth]);
    }

    const y = scaleLinear()
      .domain(zeroAnchoredDomain(allPoints.map((point) => point.y)))
      .nice()
      .range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('data-part', 'grid-line')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.domain').node();
    if (domainEl) select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x as any).ticks(tickCount))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    g.append('g')
      .call(axisLeft(y).ticks(tickCount))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    // Polymorphic accessor that narrows the scale type so each data point is
    // projected through the correct scale without casting at every call site.
    const getX = (d: (typeof allPoints)[0]): number => {
      if (xType === 'time') return (x as ScaleTime<number, number>)(new Date(d.x as string | number | Date));
      if (xType === 'linear') return (x as ScaleLinear<number, number>)(d.x as number);
      return (x as ScalePoint<string>)(String(d.x)) ?? 0;
    };

    // Curve selection is personality-driven: "step" for discrete status charts,
    // monotoneX for smooth data with guaranteed no overshoot, linear as default.
    const curveType =
      chartPersonality.lineMode === 'step'
        ? curveStepAfter
        : chartPersonality.curved
          ? curveMonotoneX
          : curveLinear;

    // Each series is rendered as its own path (not a single multi-path) so that
    // individual stroke colors, area fills, and tooltip dot sets stay independent.
    finiteSeries.forEach((s, i) => {
      if (s.data.length === 0) return;
      const color = s.color ?? lineColor(palette, i);
      const gradientId = `line-chart-${gradientScope}-area-${i}`;

      // Area fill: when gradient mode is active, a top-to-bottom linearGradient
      // fades from 32% opacity to 4%, giving depth without obscuring grid lines.
      if (showArea) {
        if (chartPersonality.useGradientFill) {
          const gradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

          gradient
            .append('stop')
            .attr('data-part', 'gradient-stop')
            .attr('offset', '0%')
            .attr('stop-color', color)
            .attr('stop-opacity', 0.32);

          gradient
            .append('stop')
            .attr('data-part', 'gradient-stop')
            .attr('offset', '100%')
            .attr('stop-color', color)
            .attr('stop-opacity', 0.04);
        }

        const lineArea = area<(typeof s.data)[0]>()
          .x((d) => getX(d))
          .y0(y(0))
          .y1((d) => y(d.y))
          .curve(curveType);

        g.append('path')
          .datum(s.data)
          .attr('data-part', 'area')
          .attr('fill', chartPersonality.useGradientFill ? `url(#${gradientId})` : color)
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : 0.15)
          .attr('d', lineArea);
      }

      // Line
      const linePath = line<(typeof s.data)[0]>()
        .x((d) => getX(d))
        .y((d) => y(d.y))
        .curve(curveType);

      const path = g
        .append('path')
        .datum(s.data)
        .attr('data-part', 'series-line')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', linePath);

      // "Drawing" animation using the stroke-dashoffset trick: start with the
      // entire path hidden behind a dash gap, then animate the offset to zero.
      // getTotalLength guard handles JSDOM/test environments where SVG methods
      // may not exist.
      if (chartPersonality.animate) {
        const pathNode = path.node() as SVGPathElement | null;
        const totalLength =
          pathNode && typeof pathNode.getTotalLength === 'function'
            ? pathNode.getTotalLength()
            : 0;

        if (totalLength > 0) {
          path
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(chartPersonality.animationDuration)
            .attr('stroke-dashoffset', 0);
        }
      }

      // Dots
      if (chartPersonality.showDots) {
        g
          .selectAll(`.dot-${i}`)
          .data(s.data)
          .enter()
          .append('circle')
          .attr('data-part', 'series-point')
          .attr('cx', (d) => getX(d))
          .attr('cy', (d) => y(d.y))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke-width', 2);
      }
    });

    // Unified crosshair + tooltip: one full-plot hit target tracks the mouse,
    // snaps to the nearest x (category tick, or nearest point's x in time/
    // linear mode), and shows every series' value at that x -- replacing the
    // per-dot native <title> tooltip so hover feedback is consistent with
    // every other chart in the family.
    if (chartPersonality.tooltip) {
      const crosshair = createChartCrosshair(g, innerWidth, innerHeight);
      const snapCandidates: Array<{ value: string | number | Date; px: number }> =
        xType === 'category'
          ? (x as ScalePoint<string>).domain().map((cat) => ({ value: cat, px: (x as ScalePoint<string>)(cat) ?? 0 }))
          : allPoints.map((d) => ({ value: d.x, px: getX(d) }));

      g.append('rect')
        .attr('class', 'chart-hover-overlay')
        .attr('data-part', 'interaction-overlay')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .style('pointer-events', 'all')
        .on('mousemove', (event: MouseEvent) => {
          const local = plotLocalPointerPosition(event, svgRef.current, margin);
          if (!local) return;
          const idx = nearestIndexByPixel(local.x, snapCandidates.map((c) => c.px));
          const snapped = arrayValueAt(snapCandidates, idx);
          if (!snapped) return;

          const focusPoints: Array<{ y: number; color: string }> = [];
          const rows: Array<{ name: string; value: number; color: string }> = [];
          finiteSeries.forEach((s, i) => {
            const color = s.color ?? lineColor(palette, i);
            const match = s.data.find((d) => sameXValue(d.x, snapped.value, xType));
            if (!match) return;
            focusPoints.push({ y: y(match.y), color });
            rows.push({ name: s.name, value: match.y, color });
          });

          if (rows.length === 0) {
            crosshair.hide();
            hideTooltip();
            return;
          }

          crosshair.show(snapped.px, focusPoints, focusPoints.length === 1 ? focusPoints[0].y : undefined);

          const pos = pointerToContainerPosition(event, containerRef.current);
          if (!pos) return;
          showTooltip(
            pos.x,
            pos.y,
            <TooltipSeries
              title={compactState.compactTooltip ? undefined : String(snapped.value)}
              items={rows.map((row) => ({ name: compactState.compactTooltip ? '' : row.name, value: row.value, color: row.color }))}
            />
          );
        })
        .on('mouseleave', () => {
          crosshair.hide();
          hideTooltip();
        });
    }

    // Axis labels
    if (xAxisLabel) {
      svg
        .append('text')
        .attr('data-part', 'axis-label')
        .attr('data-axis', 'x')
        .attr('x', safeChartWidth / 2)
        .attr('y', safeChartHeight - 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg
        .append('text')
        .attr('data-part', 'axis-label')
        .attr('data-axis', 'y')
        .attr('transform', 'rotate(-90)')
        .attr('x', -safeChartHeight / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(yAxisLabel);
    }

    svg.selectAll('.domain').attr('data-part', 'axis-domain');
    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');

    // Data/dimension changes rebuild the svg from scratch (selectAll('*').remove()
    // above), which would otherwise leave a stale React-side tooltip pointing at
    // removed nodes.
    return () => {
      svg.selectAll('*').interrupt();
      hideTooltip();
    };
  }, [finiteSeries, chartWidth, chartHeight, showArea, xType, chartPersonality, palette, margin, xAxisLabel, yAxisLabel, tickCount, compactState.compactTooltip, showTooltip, hideTooltip, gradientScope]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-line', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Line chart'}
      ariaDescription={describeChart('Line chart', pointCount, subtitle, [
        xAxisLabel ? `X axis: ${xAxisLabel}.` : null,
        yAxisLabel ? `Y axis: ${yAxisLabel}.` : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      overlay={<ChartTooltip {...tooltipProps} variant={chartPersonality.tooltipStyle} />}
    />
  );
});
