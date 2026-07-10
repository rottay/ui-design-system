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

import { memo, useEffect, useRef } from 'react';
import {
  area,
  axisBottom,
  axisLeft,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  extent,
  line,
  max,
  scaleLinear,
  scalePoint,
  scaleTime,
  select,
  type ScaleLinear,
  type ScalePoint,
  type ScaleTime,
} from 'd3';

import type { ChartBaseProps, Series } from '../Charts.types';
import { DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';
import { ChartTooltip, TooltipSeries } from '../tooltip';
import { createChartCrosshair, nearestIndexByPixel, plotLocalPointerPosition, pointerToContainerPosition } from '../tooltip/crosshair';

/** Props for the {@link LineChart} component. */
export interface LineChartProps extends ChartBaseProps {
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
  autoCompact,
  compactBreakpoint,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, showDots, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const { show: showTooltip, hide: hideTooltip, tooltipProps } = useChartTooltip();
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;
  const pointCount = series.reduce((count, currentSeries) => count + currentSeries.data.length, 0);
  const summary = {
    caption: title ? `${title} data summary` : 'Line chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: series.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };
  const legendNode = legend ? (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {series.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ width: 12, height: 3, backgroundColor: s.color ?? palette[i % palette.length], display: 'inline-block', borderRadius: 1 }} />
          <span style={{ color: 'var(--ds-color-text-secondary)' }}>{s.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || !series || series.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allPoints = series.flatMap((s) => s.data);

    // X scale -- the type union is necessary because D3's scale factories return
    // incompatible types; the helper `getX` below unifies access with type guards.
    let x: ScalePoint<string> | ScaleTime<number, number> | ScaleLinear<number, number>;

    if (xType === 'time') {
      x = scaleTime()
        .domain(extent(allPoints, (d) => new Date(d.x as string | number | Date)) as [Date, Date])
        .range([0, innerWidth]);
    } else if (xType === 'linear') {
      x = scaleLinear()
        .domain(extent(allPoints, (d) => d.x as number) as [number, number])
        .range([0, innerWidth]);
    } else {
      const categories = [...new Set(allPoints.map((d) => String(d.x)))];
      x = scalePoint().domain(categories).range([0, innerWidth]);
    }

    const y = scaleLinear()
      .domain([0, max(allPoints, (d) => d.y) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .style('stroke', 'var(--ds-color-border-secondary)')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.domain').node();
    if (domainEl) select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x as any).ticks(tickCount))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    g.append('g')
      .call(axisLeft(y).ticks(tickCount))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
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
    series.forEach((s, i) => {
      const color = s.color ?? palette[i % palette.length];
      const gradientId = `line-chart-area-${i}`;

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
            .attr('offset', '0%')
            .attr('stop-color', color)
            .attr('stop-opacity', 0.32);

          gradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', color)
            .attr('stop-opacity', 0.04);
        }

        const lineArea = area<(typeof s.data)[0]>()
          .x((d) => getX(d))
          .y0(innerHeight)
          .y1((d) => y(d.y))
          .curve(curveType);

        g.append('path')
          .datum(s.data)
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
          .attr('cx', (d) => getX(d))
          .attr('cy', (d) => y(d.y))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', 'var(--ds-color-bg-primary)')
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
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .style('pointer-events', 'all')
        .on('mousemove', (event: MouseEvent) => {
          const local = plotLocalPointerPosition(event, svgRef.current, margin);
          if (!local) return;
          const idx = nearestIndexByPixel(local.x, snapCandidates.map((c) => c.px));
          const snapped = snapCandidates[idx];
          if (!snapped) return;

          const focusPoints: Array<{ y: number; color: string }> = [];
          const rows: Array<{ name: string; value: number; color: string }> = [];
          series.forEach((s, i) => {
            const color = s.color ?? palette[i % palette.length];
            const match = s.data.find((d) => String(d.x) === String(snapped.value));
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
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight - 4)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px')
        .text(yAxisLabel);
    }

    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');

    // Data/dimension changes rebuild the svg from scratch (selectAll('*').remove()
    // above), which would otherwise leave a stale React-side tooltip pointing at
    // removed nodes.
    return () => {
      hideTooltip();
    };
  }, [series, chartWidth, chartHeight, showArea, xType, chartPersonality, palette, margin, xAxisLabel, yAxisLabel, tickCount, compactState.compactTooltip, showTooltip, hideTooltip]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={className}
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
      overlay={<ChartTooltip {...tooltipProps} />}
    />
  );
});
