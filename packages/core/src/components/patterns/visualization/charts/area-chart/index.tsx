'use client';

/**
 * @fileoverview AreaChart -- D3-backed multi-series area chart with optional stacking via
 * `d3.stack()`. Uses `scalePoint` for categories and `scaleLinear` for values. Stacked mode
 * applies `stackOffsetDiverging` / `stackOrderNone` to preserve signed values and insertion order. Non-stacked series
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

import { memo, useEffect, useId, useMemo, useRef } from 'react';
import { arrayValueAt } from '@/_internal/utils/collections';
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
  select,
  stack,
  stackOffsetDiverging,
  stackOrderNone,
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
} from '../Charts.types';
import { DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';
import { ChartTooltip, TooltipSeries } from '../tooltip';
import { createChartCrosshair, nearestIndexByPixel, plotLocalPointerPosition, pointerToContainerPosition } from '../tooltip/crosshair';

type AreaPoint = Series['data'][number];
const FALLBACK_AREA_COLOR = 'var(--ds-color-primary)';

function areaColor(palette: readonly string[], index: number): string {
  return arrayValueAt(palette, palette.length > 0 ? index % palette.length : 0) ?? FALLBACK_AREA_COLOR;
}

function validPoint(point: AreaPoint): boolean {
  if (!Number.isFinite(point.y)) return false;
  if (point.x instanceof Date) return Number.isFinite(point.x.getTime());
  if (typeof point.x === 'number') return Number.isFinite(point.x);
  return typeof point.x === 'string';
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

/** Props for the {@link AreaChart} component. */
export interface AreaChartProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartColorSchemeProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
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
  compactMode,
  autoCompact,
  compactBreakpoint,
}: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientScope = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, curved, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const { show: showTooltip, hide: hideTooltip, tooltipProps } = useChartTooltip();
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;
  const resolvedOpacity = Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.3;
  const finiteSeries = useMemo(() => series.map((currentSeries) => ({
    ...currentSeries,
    data: currentSeries.data.filter(validPoint),
  })), [series]);
  const stackOverflow = useMemo(() => {
    if (!stacked) return false;
    const totals = new Map<string, { positive: number; negative: number }>();
    for (const currentSeries of finiteSeries) {
      const seenCategories = new Set<string>();
      for (const point of currentSeries.data) {
        const category = String(point.x);
        if (seenCategories.has(category)) continue;
        seenCategories.add(category);
        const current = totals.get(category) ?? { positive: 0, negative: 0 };
        const key = point.y < 0 ? 'negative' : 'positive';
        const next = current[key] + point.y;
        if (!Number.isFinite(next)) return true;
        current[key] = next;
        totals.set(category, current);
      }
    }
    return false;
  }, [finiteSeries, stacked]);
  const pointCount = finiteSeries.reduce((count, currentSeries) => count + currentSeries.data.length, 0);
  const summary = {
    caption: title ? `${title} data summary` : 'Area chart data summary',
    headers: ['Series', 'X', 'Y'],
    rows: finiteSeries.flatMap((currentSeries) =>
      currentSeries.data.map((point) => [currentSeries.name, String(point.x), point.y])
    ),
  };
  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {finiteSeries.map((s, i) => (
        <div key={`${s.name}-${i}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: s.color ?? areaColor(palette, i), opacity: resolvedOpacity, display: 'inline-block' }} />
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

    const innerWidth = Math.max(0, safeChartWidth - margin.left - margin.right);
    const innerHeight = Math.max(0, safeChartHeight - margin.top - margin.bottom);
    const allPoints = finiteSeries.flatMap((currentSeries) => currentSeries.data);
    if (stackOverflow || allPoints.length === 0 || innerWidth === 0 || innerHeight === 0) {
      hideTooltip();
      return;
    }

    const g = svg
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const categories = [...new Set(allPoints.map((d) => String(d.x)))];
    const x = scalePoint().domain(categories).range([0, innerWidth]);
    const drawableSeries = finiteSeries
      .map((currentSeries, index) => ({
        currentSeries,
        index,
        key: `series-${index}`,
      }))
      .filter(({ currentSeries }) => currentSeries.data.length > 0);

    // Internal keys keep duplicate display names independent. Diverging offset
    // accumulates positive and negative contributions on opposite sides of zero.
    const stackData = categories.map((category) => {
      const row: Record<string, number | string> = { x: category };
      drawableSeries.forEach(({ currentSeries, key }) => {
        row[key] = currentSeries.data.find((point) => String(point.x) === category)?.y ?? 0;
      });
      return row;
    });
    const stackedLayers = stacked
      ? stack()
          .keys(drawableSeries.map(({ key }) => key))
          .order(stackOrderNone)
          .offset(stackOffsetDiverging)(stackData as any)
      : [];
    const domainValues = stacked
      ? stackedLayers.flatMap((layer) => layer.flatMap((segment) => [segment[0], segment[1]]))
      : allPoints.map((point) => point.y);
    const y = scaleLinear()
      .domain(zeroAnchoredDomain(domainValues))
      .nice()
      .range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('data-part', 'grid-line')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.grid .domain, g > .domain').node();
    if (domainEl) select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    g.append('g')
      .call(axisLeft(y).ticks(tickCount))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    const curveType =
      chartPersonality.lineMode === 'step'
        ? curveStepAfter
        : chartPersonality.curved
          ? curveMonotoneX
          : curveLinear;

    if (stacked) {
      // Each layer contains [y0, y1] pairs; y0 is the cumulative baseline from
      // the same-sign layers, y1 is the edge of the current contribution.
      stackedLayers.forEach((layer, layerIndex) => {
        const descriptor = drawableSeries[layerIndex];
        if (!descriptor) return;
        const { currentSeries, index } = descriptor;
        const color = currentSeries.color ?? areaColor(palette, index);
        const gradientId = `area-chart-${gradientScope}-stack-${index}`;

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
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : resolvedOpacity)
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('d', stackedArea);
      });
    } else {
      // Non-stacked: each series is an independent area from y=0 to d.y, layered
      // with opacity so overlapping regions remain visible underneath.
      finiteSeries.forEach((s, i) => {
        if (s.data.length === 0) return;
        const color = s.color ?? areaColor(palette, i);
        const gradientId = `area-chart-${gradientScope}-series-${i}`;

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
          .y0(y(0))
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
          .attr('fill-opacity', chartPersonality.useGradientFill ? 1 : resolvedOpacity)
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
          let positiveCumulative = 0;
          let negativeCumulative = 0;
          finiteSeries.forEach((s, i) => {
            const color = s.color ?? areaColor(palette, i);
            const point = s.data.find((d) => String(d.x) === cat);
            if (!point) return;
            let boundary = point.y;
            if (stacked && point.y > 0) {
              positiveCumulative += point.y;
              boundary = positiveCumulative;
            } else if (stacked && point.y < 0) {
              negativeCumulative += point.y;
              boundary = negativeCumulative;
            } else if (stacked) {
              boundary = 0;
            }
            focusPoints.push({ y: y(boundary), color });
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
      svg.append('text').attr('data-part', 'axis-label').attr('data-axis', 'x').attr('x', safeChartWidth / 2).attr('y', safeChartHeight - 4).attr('text-anchor', 'middle').style('font-size', '12px').text(xAxisLabel);
    }
    if (yAxisLabel) {
      svg.append('text').attr('data-part', 'axis-label').attr('data-axis', 'y').attr('transform', 'rotate(-90)').attr('x', -safeChartHeight / 2).attr('y', 14).attr('text-anchor', 'middle').style('font-size', '12px').text(yAxisLabel);
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
  }, [finiteSeries, chartWidth, chartHeight, stacked, resolvedOpacity, stackOverflow, chartPersonality, palette, margin, xAxisLabel, yAxisLabel, tickCount, compactState.compactTooltip, showTooltip, hideTooltip, gradientScope]);

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
        stackOverflow ? 'Stacked values exceed the finite numeric range.' : null,
        xAxisLabel ? `X axis: ${xAxisLabel}.` : null,
        yAxisLabel ? `Y axis: ${yAxisLabel}.` : null,
      ].filter(Boolean).join(' '))}
      summary={summary}
      legend={legendNode}
      hideLegend={compactState.hideLegend}
      minHeight={compactState.isCompact ? compactState.minHeight : undefined}
      overlay={(
        <>
          {stackOverflow ? (
            <div
              data-part="data-fallback"
              data-error-code="NUMERIC_OVERFLOW"
              role="status"
              style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center', pointerEvents: 'none' }}
            >
              Stacked values exceed the finite numeric range.
            </div>
          ) : null}
          <ChartTooltip {...tooltipProps} variant={chartPersonality.tooltipStyle} />
        </>
      )}
    />
  );
});
