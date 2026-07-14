'use client';

/**
 * @fileoverview AreaChart -- D3-backed multi-series area chart with optional stacking via
 * `d3.stack()`. Uses `scalePoint` for categories and `scaleLinear` for values. Stacked mode
 * applies `stackOffsetNone` / `stackOrderNone` to preserve insertion order. Non-stacked series
 * each receive an independent baseline at `y=0`. Gradient fills and stroke-dashoffset animations
 * are personality-driven.
 *
 * @example
 * <AreaChart
 *   series={[
 *     { name: 'Desktop', data: [{ x: 'Jan', y: 80 }, { x: 'Feb', y: 120 }] },
 *     { name: 'Mobile', data: [{ x: 'Jan', y: 40 }, { x: 'Feb', y: 90 }] },
 *   ]}
 *   stacked
 *   curved
 *   height={350}
 *   title="Traffic by Device"
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
  line,
  max,
  scaleLinear,
  scalePoint,
  select,
  stack,
  stackOffsetNone,
  stackOrderNone,
  sum,
} from 'd3';

import type { ChartBaseProps, Series } from '../Charts.types';
import { DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';
import { ChartTooltip, TooltipSeries } from '../tooltip';
import { createChartCrosshair, nearestIndexByPixel, plotLocalPointerPosition, pointerToContainerPosition } from '../tooltip/crosshair';

/** Props for the {@link AreaChart} component. */
export interface AreaChartProps extends ChartBaseProps {
  series: Series[];
  curved?: boolean;
  stacked?: boolean;
  opacity?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Renders a multi-series area chart with optional D3 stacking and gradient fills.
 *
 * @param props - See {@link AreaChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const AreaChart = memo(function AreaChart({
  series,
  curved,
  stacked = false,
  opacity = 0.3,
  xAxisLabel,
  yAxisLabel,
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
}: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const { show: showTooltip, hide: hideTooltip, tooltipProps } = useChartTooltip();
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;
  const pointCount = series.reduce((count, currentSeries) => count + currentSeries.data.length, 0);
  const summary = {
    caption: title ? `${title} data summary` : 'Area chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: series.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };
  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {series.map((s, i) => (
        <div key={s.name} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: s.color ?? palette[i % palette.length], opacity, display: 'inline-block' }} />
          <span data-part="legend-label" style={{ color: 'var(--ds-color-text-secondary)' }}>{s.name}</span>
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
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allPoints = series.flatMap((s) => s.data);
    const categories = [...new Set(allPoints.map((d) => String(d.x)))];

    const x = scalePoint().domain(categories).range([0, innerWidth]);

    // In stacked mode the y-axis must accommodate the summed values at each
    // category, not just the individual maximums, to avoid clipping.
    const yMax = stacked
      ? max(categories, (cat) =>
          sum(series, (s) => {
            const pt = s.data.find((d) => String(d.x) === cat);
            return pt?.y ?? 0;
          }),
        ) ?? 0
      : max(allPoints, (d) => d.y) ?? 0;

    const y = scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('data-part', 'grid-line')
      .style('stroke', 'var(--ds-color-border-secondary)')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.grid .domain, g > .domain').node();
    if (domainEl) select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    g.append('g')
      .call(axisLeft(y).ticks(tickCount))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    const curveType =
      chartPersonality.lineMode === 'step'
        ? curveStepAfter
        : chartPersonality.curved
          ? curveMonotoneX
          : curveLinear;

    if (stacked) {
      // Build a row-per-category matrix that d3.stack expects: each row is an
      // object { x, seriesA, seriesB, ... } with numeric values per series.
      const stackData = categories.map((cat) => {
        const row: Record<string, number | string> = { x: cat };
        series.forEach((s) => {
          const pt = s.data.find((d) => String(d.x) === cat);
          row[s.name] = pt?.y ?? 0;
        });
        return row;
      });

      // stackOrderNone keeps series in their original order (first series at bottom),
      // stackOffsetNone starts from zero baseline -- both ensure predictable stacking.
      const stackedSeries = stack()
        .keys(series.map((s) => s.name))
        .order(stackOrderNone)
        .offset(stackOffsetNone);

      const stacked = stackedSeries(stackData as any);

      // Each layer contains [y0, y1] pairs; y0 is the cumulative baseline from
      // lower layers, y1 is the top of the current layer's contribution.
      stacked.forEach((layer, i) => {
        const color = series[i]?.color ?? palette[i % palette.length];
        const gradientId = `area-chart-stack-${i}`;

        if (chartPersonality.useGradientFill) {
          const gradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

          gradient.append('stop').attr('data-part', 'gradient-stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.36);
          gradient.append('stop').attr('data-part', 'gradient-stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.08);
        }

        const stackedArea = area<any>()
          .x((d) => x(String(d.data.x)) ?? 0)
          .y0((d) => y(d[0]))
          .y1((d) => y(d[1]))
          .curve(curveType);

        g.append('path')
          .datum(layer)
          .attr('data-part', 'area')
          .attr('fill', chartPersonality.useGradientFill ? `url(#${gradientId})` : color)
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : opacity)
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('d', stackedArea);
      });
    } else {
      // Non-stacked: each series is an independent area from y=0 to d.y, layered
      // with opacity so overlapping regions remain visible underneath.
      series.forEach((s, i) => {
        const color = s.color ?? palette[i % palette.length];
        const gradientId = `area-chart-series-${i}`;

        if (chartPersonality.useGradientFill) {
          const gradient = svg
            .append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

          gradient.append('stop').attr('data-part', 'gradient-stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.36);
          gradient.append('stop').attr('data-part', 'gradient-stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.08);
        }

        const seriesArea = area<(typeof s.data)[0]>()
          .x((d) => x(String(d.x)) ?? 0)
          .y0(innerHeight)
          .y1((d) => y(d.y))
          .curve(curveType);

        const seriesLine = line<(typeof s.data)[0]>()
          .x((d) => x(String(d.x)) ?? 0)
          .y((d) => y(d.y))
          .curve(curveType);

        g.append('path')
          .datum(s.data)
          .attr('data-part', 'area')
          .attr('fill', chartPersonality.useGradientFill ? `url(#${gradientId})` : color)
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : opacity)
          .attr('d', seriesArea);

        const path = g
          .append('path')
          .datum(s.data)
          .attr('data-part', 'series-line')
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', seriesLine);

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

      });
    }

    // Unified crosshair + tooltip (shared by stacked and non-stacked mode):
    // one full-plot hit target snaps to the nearest category and shows every
    // series' value at that x. Stacked mode places each focus dot at the
    // segment's cumulative height (where its layer boundary actually draws)
    // while the tooltip still reports each series' own contribution, not the
    // running total.
    if (chartPersonality.tooltip) {
      const crosshair = createChartCrosshair(g, innerWidth, innerHeight);
      const categoryPositions = categories.map((cat) => x(cat) ?? 0);

      g.append('rect')
        .attr('class', 'chart-hover-overlay')
        .attr('data-part', 'interaction-overlay')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .style('pointer-events', 'all')
        .on('mousemove', (event: MouseEvent) => {
          const local = plotLocalPointerPosition(event, svgRef.current, margin);
          if (!local) return;
          const idx = nearestIndexByPixel(local.x, categoryPositions);
          const cat = categories[idx];
          if (cat === undefined) return;
          const catX = categoryPositions[idx];

          const focusPoints: Array<{ y: number; color: string }> = [];
          const rows: Array<{ name: string; value: number; color: string }> = [];
          let cumulative = 0;
          series.forEach((s, i) => {
            const color = s.color ?? palette[i % palette.length];
            const point = s.data.find((d) => String(d.x) === cat);
            if (!point) return;
            cumulative += stacked ? point.y : 0;
            focusPoints.push({ y: stacked ? y(cumulative) : y(point.y), color });
            rows.push({ name: s.name, value: point.y, color });
          });

          if (rows.length === 0) {
            crosshair.hide();
            hideTooltip();
            return;
          }

          crosshair.show(catX, focusPoints, focusPoints.length === 1 ? focusPoints[0].y : undefined);

          const pos = pointerToContainerPosition(event, containerRef.current);
          if (!pos) return;
          showTooltip(
            pos.x,
            pos.y,
            <TooltipSeries
              title={compactState.compactTooltip ? undefined : cat}
              items={rows.map((row) => ({ name: compactState.compactTooltip ? '' : row.name, value: row.value, color: row.color }))}
            />
          );
        })
        .on('mouseleave', () => {
          crosshair.hide();
          hideTooltip();
        });
    }

    if (xAxisLabel) {
      svg.append('text').attr('data-part', 'axis-label').attr('data-axis', 'x').attr('x', chartWidth / 2).attr('y', chartHeight - 4).attr('text-anchor', 'middle').style('fill', 'var(--ds-color-text-secondary)').style('font-size', '12px').text(xAxisLabel);
    }
    if (yAxisLabel) {
      svg.append('text').attr('data-part', 'axis-label').attr('data-axis', 'y').attr('transform', 'rotate(-90)').attr('x', -chartHeight / 2).attr('y', 14).attr('text-anchor', 'middle').style('fill', 'var(--ds-color-text-secondary)').style('font-size', '12px').text(yAxisLabel);
    }

    svg.selectAll('.domain').attr('data-part', 'axis-domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');

    // Data/dimension changes rebuild the svg from scratch (selectAll('*').remove()
    // above), which would otherwise leave a stale React-side tooltip pointing at
    // removed nodes.
    return () => {
      hideTooltip();
    };
  }, [series, chartWidth, chartHeight, stacked, opacity, chartPersonality, palette, margin, xAxisLabel, yAxisLabel, tickCount, compactState.compactTooltip, showTooltip, hideTooltip]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-area', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Area chart'}
      ariaDescription={describeChart('Area chart', pointCount, subtitle, [
        stacked ? 'Stacked series.' : 'Independent series.',
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
