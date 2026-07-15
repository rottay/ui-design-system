'use client';

/**
 * @fileoverview BarChart -- D3-backed categorical bar chart supporting vertical and horizontal
 * orientations, plus multi-series grouped and stacked modes.
 *
 * Single-series: pass `data` -- uses `scaleBand` for the category axis and `scaleLinear` for
 * the value axis. Bars animate with a staggered grow-from-baseline effect.
 *
 * Multi-series: pass `series` -- renders grouped bars (side-by-side via inner `scaleBand`) or
 * stacked bars (cumulative segments via `d3.stack()`). Each series gets a distinct color from
 * the personality palette, with legend and tooltips showing series names.
 *
 * @example
 * // Single-series
 * <BarChart
 *   data={[{ label: 'Q1', value: 120 }, { label: 'Q2', value: 340 }]}
 *   orientation="vertical"
 *   showValues
 *   height={300}
 *   title="Quarterly Revenue"
 * />
 *
 * @example
 * // Multi-series grouped
 * <BarChart
 *   series={[
 *     { name: 'Q1', data: [{ x: 'Jan', y: 10 }, { x: 'Feb', y: 20 }] },
 *     { name: 'Q2', data: [{ x: 'Jan', y: 15 }, { x: 'Feb', y: 25 }] },
 *   ]}
 *   height={300}
 *   title="Quarterly Comparison"
 * />
 *
 * @example
 * // Multi-series stacked
 * <BarChart
 *   series={[
 *     { name: 'Revenue', data: [{ x: 'Jan', y: 100 }, { x: 'Feb', y: 200 }] },
 *     { name: 'Costs', data: [{ x: 'Jan', y: 60 }, { x: 'Feb', y: 90 }] },
 *   ]}
 *   stacked
 *   height={300}
 *   title="Revenue vs Costs"
 * />
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import {
  axisBottom,
  axisLeft,
  scaleBand,
  scaleLinear,
  select,
  stack,
  stackOffsetDiverging,
  type Selection,
} from 'd3';
import { arrayValueAt } from '@/_internal/utils/collections';

import type {
  ChartBaseProps,
  ChartCartesianCompactConfig,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartCompactProps,
  ChartLegendProps,
  ChartMarginProps,
  DataPoint,
  Series,
} from '../Charts.types';
import { DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartCompact, useChartTooltip } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';
import { ChartTooltip, TooltipSeries, TooltipValue } from '../tooltip';

const FALLBACK_BAR_COLOR = 'var(--ds-color-primary)';

function resolvePaletteColor(palette: readonly string[], index: number): string {
  const paletteIndex = palette.length > 0 ? index % palette.length : 0;
  return arrayValueAt(palette, paletteIndex) ?? FALLBACK_BAR_COLOR;
}

function readStackedValue(row: Record<string, unknown>, key: string): number {
  return Number(Reflect.get(row, key)) || 0;
}

function isFiniteSeriesPoint(point: Series['data'][number]): boolean {
  if (!Number.isFinite(point.y)) return false;
  if (point.x instanceof Date) return Number.isFinite(point.x.getTime());
  if (typeof point.x === 'number') return Number.isFinite(point.x);
  return true;
}

/** A non-degenerate quantitative domain that always keeps zero visible. */
function valueDomain(values: readonly number[]): [number, number] {
  let minimum = 0;
  let maximum = 0;
  let hasFiniteValue = false;
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    hasFiniteValue = true;
    if (value < minimum) minimum = value;
    if (value > maximum) maximum = value;
  }
  if (!hasFiniteValue) return [0, 1];
  return minimum === maximum ? [0, 1] : [minimum, maximum];
}

function barGeometry(scale: (value: number) => number, value: number): {
  position: number;
  size: number;
} {
  const baseline = scale(0);
  const endpoint = scale(value);
  return {
    position: Math.min(baseline, endpoint),
    size: Math.abs(endpoint - baseline),
  };
}

function stackGeometry(
  scale: (value: number) => number,
  start: number,
  end: number,
): { position: number; size: number } {
  const startPosition = scale(start);
  const endPosition = scale(end);
  return {
    position: Math.min(startPosition, endPosition),
    size: Math.abs(endPosition - startPosition),
  };
}
import { createChartCrosshair, pointerToContainerPosition } from '../tooltip/crosshair';

/** Props for the {@link BarChart} component. */
export interface BarChartProps
  extends ChartBaseProps,
    ChartLegendProps,
    ChartColorsProps,
    ChartColorSchemeProps,
    ChartMarginProps,
    ChartCompactProps<ChartCartesianCompactConfig> {
  /** Single-series data. Ignored when `series` is provided. */
  data?: DataPoint[];
  orientation?: 'vertical' | 'horizontal';
  /** Stack bars on top of each other (multi-series only). */
  stacked?: boolean;
  /** Multi-series data. When provided, `data` is ignored. */
  series?: Series[];
  barRadius?: number;
  barGap?: number;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Renders a categorical bar chart powered by D3's `scaleBand` + `scaleLinear`.
 * Supports single-series (`data`), grouped multi-series, and stacked multi-series.
 *
 * @param props - See {@link BarChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const BarChart = memo(function BarChart({
  data,
  orientation = 'vertical',
  stacked = false,
  series,
  barRadius = 4,
  barGap = 0.2,
  showValues = false,
  xAxisLabel,
  yAxisLabel,
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
  colors,
  colorScheme,
  tooltip,
  margin = DEFAULT_MARGIN,
  compact,
  compactMode,
  autoCompact,
  compactBreakpoint,
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const compactState = useChartCompact({ compact, compactMode, autoCompact, compactBreakpoint, containerWidth: dimensions.width });
  const { show: showTooltip, hide: hideTooltip, tooltipProps } = useChartTooltip();
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = compactState.isCompact ? Math.max(height, compactState.minHeight) : height;
  const tickCount = compactState.isCompact ? compactState.maxTicks : 5;
  const resolvedBarRadius = Number.isFinite(barRadius) ? Math.max(0, barRadius) : 4;
  const resolvedBarGap = Number.isFinite(barGap) ? Math.min(0.95, Math.max(0, barGap)) : 0.2;

  // Determine rendering mode: multi-series (grouped/stacked) vs single-series.
  const isMultiSeries = series != null && series.length > 0;
  const singleData = useMemo(
    () => (data ?? []).filter((point) => Number.isFinite(point.value)),
    [data],
  );
  const renderSeries = useMemo(
    () => (series ?? []).map((currentSeries) => ({
      ...currentSeries,
      data: currentSeries.data.filter(isFiniteSeriesPoint),
    })),
    [series],
  );

  // For multi-series, extract the unique category labels across all series.
  // Each series point uses `x` for the category key (matching the Series type).
  const categories = useMemo(() => {
    if (!isMultiSeries) return singleData.map((d) => d.label);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const s of renderSeries) {
      for (const pt of s.data) {
        const key = String(pt.x);
        if (!seen.has(key)) {
          seen.add(key);
          result.push(key);
        }
      }
    }
    return result;
  }, [isMultiSeries, singleData, renderSeries]);

  // Resolve the color for each series entry.
  const seriesColors = useMemo(() => {
    if (!isMultiSeries) return [];
    return renderSeries.map((s, i) => s.color ?? resolvePaletteColor(palette, i));
  }, [isMultiSeries, renderSeries, palette]);

  // Build summary table for accessibility.
  const summary = useMemo(() => {
    if (isMultiSeries) {
      return {
        caption: title ? `${title} data summary` : 'Bar chart data summary',
        headers: ['Category', ...renderSeries.map((s) => s.name)],
        rows: categories.map((cat) => {
          const values = renderSeries.map((s) => {
            const pt = s.data.find((d) => String(d.x) === cat);
            return pt ? pt.y : 0;
          });
          return [cat, ...values];
        }),
      };
    }
    return {
      caption: title ? `${title} data summary` : 'Bar chart data summary',
      headers: ['Label', 'Value'],
      rows: singleData.map((item) => [item.label, item.value]),
    };
  }, [isMultiSeries, title, renderSeries, categories, singleData]);

  // Build legend node.
  const legendNode = legend ? (
    isMultiSeries ? (
      <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
        {renderSeries.map((s, i) => (
          <div key={`${s.name}-${i}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: arrayValueAt(seriesColors, i), display: 'inline-block' }} />
            <span data-part="legend-label">{s.name}</span>
          </div>
        ))}
      </div>
    ) : (
      <div data-part="legend" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
        {singleData.map((d, i) => (
          <div key={`${d.label}-${i}`} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: d.color ?? resolvePaletteColor(palette, i), display: 'inline-block' }} />
            <span data-part="legend-label">{d.label}</span>
          </div>
        ))}
      </div>
    )
  ) : null;

  // ── D3 rendering ──────────────────────────────────────────────────────────
  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const svg = select(svgNode);
    svg.selectAll('*').interrupt().remove();

    const safeChartWidth = Number.isFinite(chartWidth) ? Math.max(0, chartWidth) : 0;
    const safeChartHeight = Number.isFinite(chartHeight) ? Math.max(0, chartHeight) : 0;
    svg.attr('width', safeChartWidth).attr('height', safeChartHeight);

    if (!isMultiSeries && singleData.length === 0) return;
    if (isMultiSeries && categories.length === 0) return;

    const rawInnerWidth = safeChartWidth - margin.left - margin.right;
    const rawInnerHeight = safeChartHeight - margin.top - margin.bottom;
    const innerWidth = Number.isFinite(rawInnerWidth) ? Math.max(0, rawInnerWidth) : 0;
    const innerHeight = Number.isFinite(rawInnerHeight) ? Math.max(0, rawInnerHeight) : 0;
    if (innerWidth === 0 || innerHeight === 0) return;

    const g = svg
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Crosshair is created once every bar is drawn (assigned at the bottom of
    // this effect) so it paints on top of the bars; `attachBarHover` closures
    // over the `let` below and only reads it at hover time, once it is set.
    let crosshair: ReturnType<typeof createChartCrosshair> | null = null;

    // Per-bar hover: crosshair (vertical guide through the bar's center +
    // horizontal guide at its value) plus the shared tooltip. Attached
    // directly to each bar (not a continuous mousemove-tracked overlay, the
    // line/area approach) since bars are discrete marks -- there is no
    // "in-between" position worth snapping to. `extract`'s datum stays `any`
    // to match this file's existing casts for the grouped branches, where
    // `.each()` rebinds each bar's datum to an ad-hoc {category, value,
    // seriesName} shape D3's static typing does not track.
    const attachBarHover = (
      selection: Selection<SVGRectElement, any, any, unknown>,
      extract: (d: any) => { cx: number; cy: number; label: string; value: number; seriesName?: string },
    ): void => {
      if (!chartPersonality.tooltip) return;
      selection
        .style('cursor', 'pointer')
        .on('mouseenter mousemove', (event: MouseEvent, d: any) => {
          const { cx, cy, label, value, seriesName } = extract(d);
          const color = String(select(event.currentTarget as SVGRectElement).attr('fill'));

          crosshair?.show(cx, [{ y: cy, color }], cy);

          const pos = pointerToContainerPosition(event, containerRef.current);
          if (!pos) return;
          const compact = compactState.compactTooltip;
          showTooltip(
            pos.x,
            pos.y,
            seriesName ? (
              <TooltipSeries
                title={compact ? undefined : label}
                items={[{ name: compact ? '' : seriesName, value, color }]}
              />
            ) : (
              <TooltipValue label={compact ? '' : label} value={value} color={color} />
            )
          );
        })
        .on('mouseleave', () => {
          crosshair?.hide();
          hideTooltip();
        });
    };

    // ── Multi-series rendering (grouped or stacked) ─────────────────────────
    if (isMultiSeries) {
      const seriesNames = renderSeries.map((s) => s.name);
      const seriesKeys = renderSeries.map((_, index) => `series-${index}`);

      // D3 needs unique keys even when two consumer-facing series names match.
      // Display names remain untouched for legends, summaries and tooltips.
      const rowMap = new Map<string, Record<string, number>>();
      for (const cat of categories) {
        const row: Record<string, number> = {};
        for (const [seriesIndex, s] of renderSeries.entries()) {
          const pt = s.data.find((d) => String(d.x) === cat);
          const seriesKey = arrayValueAt(seriesKeys, seriesIndex);
          if (seriesKey) row[seriesKey] = pt ? pt.y : 0;
        }
        rowMap.set(cat, row);
      }
      const tableRows = categories.map((cat) => ({ __category: cat, ...rowMap.get(cat)! }));

      if (orientation === 'vertical') {
        // Outer band maps categories to horizontal position.
        const x0 = scaleBand()
          .domain(categories)
          .range([0, innerWidth])
          .padding(resolvedBarGap);

        if (stacked) {
          // ── Vertical stacked ────────────────────────────────────────────────
          const stackGen = stack<Record<string, unknown>>()
            .keys(seriesKeys)
            .offset(stackOffsetDiverging);
          const stackedData = stackGen(tableRows).map((layer) =>
            layer.filter((segment) => Number.isFinite(segment[0]) && Number.isFinite(segment[1])),
          );
          const stackedValues = stackedData.flatMap((layer) =>
            layer.flatMap((segment) => [segment[0], segment[1]]),
          );
          const y = scaleLinear()
            .domain(valueDomain(stackedValues))
            .nice()
            .range([innerHeight, 0]);

          // Axes
          g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(axisBottom(x0))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          g.append('g')
            .call(axisLeft(y).ticks(tickCount))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          // Grid
          g.append('g')
            .attr('class', 'grid')
            .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
            .selectAll('line')
            .attr('data-part', 'grid-line')
            .style('stroke-opacity', 0.5);
          g.selectAll('.grid .domain').remove();

          // Render each stacked layer as a group of rects.
          stackedData.forEach((layer, layerIdx) => {
            const color = arrayValueAt(seriesColors, layerIdx) ?? resolvePaletteColor(palette, layerIdx);
            const seriesName = arrayValueAt(seriesNames, layerIdx) ?? '';
            const seriesKey = arrayValueAt(seriesKeys, layerIdx) ?? '';

            const bars = g.selectAll(`.bar-stack-${layerIdx}`)
              .data(layer)
              .enter()
              .append('rect')
              .attr('class', `bar-stack-${layerIdx}`)
              .attr('data-part', 'bar')
              .attr('data-orientation', 'vertical')
              .attr('data-layout', 'stacked')
              .attr('x', (d) => x0((d.data as Record<string, string>).__category) ?? 0)
              .attr('width', x0.bandwidth())
              .attr('rx', layerIdx === stackedData.length - 1 ? resolvedBarRadius : 0)
              .attr('ry', layerIdx === stackedData.length - 1 ? resolvedBarRadius : 0)
              .attr('fill', color);

            attachBarHover(bars, (d) => {
              const cat = (d.data as Record<string, string>).__category;
              const value = readStackedValue(d.data as Record<string, unknown>, seriesKey);
              return {
                cx: (x0(cat) ?? 0) + x0.bandwidth() / 2,
                cy: y(value >= 0 ? d[1] : d[0]),
                label: cat,
                value,
                seriesName,
              };
            });

            if (chartPersonality.animate) {
              bars
                .attr('y', y(0))
                .attr('height', 0)
                .transition()
                .duration(chartPersonality.animationDuration)
                .delay((_, i) => i * 50)
                .attr('y', (d) => stackGeometry(y, d[0], d[1]).position)
                .attr('height', (d) => stackGeometry(y, d[0], d[1]).size);
            } else {
              bars
                .attr('y', (d) => stackGeometry(y, d[0], d[1]).position)
                .attr('height', (d) => stackGeometry(y, d[0], d[1]).size);
            }

            if (showValues) {
              g.selectAll(`.value-stack-${layerIdx}`)
                .data(layer)
                .enter()
                .append('text')
                .attr('class', `value-stack-${layerIdx}`)
                .attr('data-part', 'value-label')
                .attr('x', (d) => (x0((d.data as Record<string, string>).__category) ?? 0) + x0.bandwidth() / 2)
                .attr('y', (d) => y(d[1]) + (y(d[0]) - y(d[1])) / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .style('font-size', '10px')
                .text((d) => readStackedValue(d.data as Record<string, unknown>, seriesKey));
            }
          });
        } else {
          // ── Vertical grouped ────────────────────────────────────────────────
          // Inner band subdivides each category slot for side-by-side bars.
          const x1 = scaleBand()
            .domain(seriesKeys)
            .range([0, x0.bandwidth()])
            .padding(0.05);

          const y = scaleLinear()
            .domain(valueDomain(renderSeries.flatMap((s) => s.data.map((d) => d.y))))
            .nice()
            .range([innerHeight, 0]);

          // Axes
          g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(axisBottom(x0))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          g.append('g')
            .call(axisLeft(y).ticks(tickCount))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          // Grid
          g.append('g')
            .attr('class', 'grid')
            .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
            .selectAll('line')
            .attr('data-part', 'grid-line')
            .style('stroke-opacity', 0.5);
          g.selectAll('.grid .domain').remove();

          // For each category, draw one bar per series.
          const categoryGroups = g.selectAll('.category-group')
            .data(categories)
            .enter()
            .append('g')
            .attr('class', 'category-group')
            .attr('transform', (cat) => `translate(${x0(cat) ?? 0},0)`);

          renderSeries.forEach((s, sIdx) => {
            const color = arrayValueAt(seriesColors, sIdx) ?? resolvePaletteColor(palette, sIdx);
            const seriesKey = arrayValueAt(seriesKeys, sIdx) ?? '';

            const bars = categoryGroups
              .append('rect')
              .attr('class', `bar-grouped-${sIdx}`)
              .attr('data-part', 'bar')
              .attr('data-orientation', 'vertical')
              .attr('data-layout', 'grouped')
              .attr('x', x1(seriesKey) ?? 0)
              .attr('width', x1.bandwidth())
              .attr('rx', resolvedBarRadius)
              .attr('ry', resolvedBarRadius)
              .attr('fill', color)
              // Attach the value for this series at this category.
              .each(function (_cat) {
                const pt = s.data.find((d) => String(d.x) === _cat);
                select(this).datum({ category: _cat, value: pt ? pt.y : 0, seriesKey, seriesName: s.name });
              });

            attachBarHover(bars, (d: any) => ({
              cx: (x0(d.category) ?? 0) + (x1(d.seriesKey) ?? 0) + x1.bandwidth() / 2,
              cy: y(d.value),
              label: d.category,
              value: d.value,
              seriesName: d.seriesName,
            }));

            if (chartPersonality.animate) {
              bars
                .attr('y', y(0))
                .attr('height', 0)
                .transition()
                .duration(chartPersonality.animationDuration)
                .delay((_, i) => (i * seriesNames.length + sIdx) * 30)
                .attr('y', (d: any) => barGeometry(y, d.value).position)
                .attr('height', (d: any) => barGeometry(y, d.value).size);
            } else {
              bars
                .attr('y', (d: any) => barGeometry(y, d.value).position)
                .attr('height', (d: any) => barGeometry(y, d.value).size);
            }

            if (showValues) {
              categoryGroups
                .append('text')
                .attr('class', `value-grouped-${sIdx}`)
                .attr('data-part', 'value-label')
                .attr('x', (x1(seriesKey) ?? 0) + x1.bandwidth() / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .each(function (_cat) {
                  const pt = s.data.find((d) => String(d.x) === _cat);
                  const val = pt ? pt.y : 0;
                  select(this)
                    .attr('y', y(val) + (val >= 0 ? -4 : 12))
                    .text(val);
                });
            }
          });
        }
      } else {
        // ── Horizontal multi-series ───────────────────────────────────────────
        const y0 = scaleBand()
          .domain(categories)
          .range([0, innerHeight])
          .padding(resolvedBarGap);

        if (stacked) {
          // ── Horizontal stacked ──────────────────────────────────────────────
          const stackGen = stack<Record<string, unknown>>()
            .keys(seriesKeys)
            .offset(stackOffsetDiverging);
          const stackedData = stackGen(tableRows).map((layer) =>
            layer.filter((segment) => Number.isFinite(segment[0]) && Number.isFinite(segment[1])),
          );
          const stackedValues = stackedData.flatMap((layer) =>
            layer.flatMap((segment) => [segment[0], segment[1]]),
          );
          const x = scaleLinear()
            .domain(valueDomain(stackedValues))
            .nice()
            .range([0, innerWidth]);

          g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(axisBottom(x).ticks(tickCount))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          g.append('g')
            .call(axisLeft(y0))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          stackedData.forEach((layer, layerIdx) => {
            const color = arrayValueAt(seriesColors, layerIdx) ?? resolvePaletteColor(palette, layerIdx);
            const seriesName = arrayValueAt(seriesNames, layerIdx) ?? '';
            const seriesKey = arrayValueAt(seriesKeys, layerIdx) ?? '';

            const bars = g.selectAll(`.bar-hstack-${layerIdx}`)
              .data(layer)
              .enter()
              .append('rect')
              .attr('class', `bar-hstack-${layerIdx}`)
              .attr('data-part', 'bar')
              .attr('data-orientation', 'horizontal')
              .attr('data-layout', 'stacked')
              .attr('y', (d) => y0((d.data as Record<string, string>).__category) ?? 0)
              .attr('height', y0.bandwidth())
              .attr('rx', layerIdx === stackedData.length - 1 ? resolvedBarRadius : 0)
              .attr('ry', layerIdx === stackedData.length - 1 ? resolvedBarRadius : 0)
              .attr('fill', color);

            attachBarHover(bars, (d) => {
              const cat = (d.data as Record<string, string>).__category;
              const value = readStackedValue(d.data as Record<string, unknown>, seriesKey);
              return {
                cx: x(value >= 0 ? d[1] : d[0]),
                cy: (y0(cat) ?? 0) + y0.bandwidth() / 2,
                label: cat,
                value,
                seriesName,
              };
            });

            if (chartPersonality.animate) {
              bars
                .attr('x', x(0))
                .attr('width', 0)
                .transition()
                .duration(chartPersonality.animationDuration)
                .delay((_, i) => i * 50)
                .attr('x', (d) => stackGeometry(x, d[0], d[1]).position)
                .attr('width', (d) => stackGeometry(x, d[0], d[1]).size);
            } else {
              bars
                .attr('x', (d) => stackGeometry(x, d[0], d[1]).position)
                .attr('width', (d) => stackGeometry(x, d[0], d[1]).size);
            }
          });
        } else {
          // ── Horizontal grouped ──────────────────────────────────────────────
          const y1 = scaleBand()
            .domain(seriesKeys)
            .range([0, y0.bandwidth()])
            .padding(0.05);

          const x = scaleLinear()
            .domain(valueDomain(renderSeries.flatMap((s) => s.data.map((d) => d.y))))
            .nice()
            .range([0, innerWidth]);

          g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(axisBottom(x).ticks(tickCount))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          g.append('g')
            .call(axisLeft(y0))
            .selectAll('text')
            .attr('data-part', 'axis-tick-label')
            .style('font-size', '12px');

          const categoryGroups = g.selectAll('.category-group')
            .data(categories)
            .enter()
            .append('g')
            .attr('class', 'category-group')
            .attr('transform', (cat) => `translate(0,${y0(cat) ?? 0})`);

          renderSeries.forEach((s, sIdx) => {
            const color = arrayValueAt(seriesColors, sIdx) ?? resolvePaletteColor(palette, sIdx);
            const seriesKey = arrayValueAt(seriesKeys, sIdx) ?? '';

            const bars = categoryGroups
              .append('rect')
              .attr('class', `bar-hgrouped-${sIdx}`)
              .attr('data-part', 'bar')
              .attr('data-orientation', 'horizontal')
              .attr('data-layout', 'grouped')
              .attr('y', y1(seriesKey) ?? 0)
              .attr('height', y1.bandwidth())
              .attr('rx', resolvedBarRadius)
              .attr('ry', resolvedBarRadius)
              .attr('fill', color)
              .each(function (_cat) {
                const pt = s.data.find((d) => String(d.x) === _cat);
                select(this).datum({ category: _cat, value: pt ? pt.y : 0, seriesKey, seriesName: s.name });
              });

            attachBarHover(bars, (d: any) => ({
              cx: x(d.value),
              cy: (y0(d.category) ?? 0) + (y1(d.seriesKey) ?? 0) + y1.bandwidth() / 2,
              label: d.category,
              value: d.value,
              seriesName: d.seriesName,
            }));

            if (chartPersonality.animate) {
              bars
                .attr('x', x(0))
                .attr('width', 0)
                .transition()
                .duration(chartPersonality.animationDuration)
                .delay((_, i) => (i * seriesNames.length + sIdx) * 30)
                .attr('x', (d: any) => barGeometry(x, d.value).position)
                .attr('width', (d: any) => barGeometry(x, d.value).size);
            } else {
              bars
                .attr('x', (d: any) => barGeometry(x, d.value).position)
                .attr('width', (d: any) => barGeometry(x, d.value).size);
            }
          });
        }
      }
    } else {
      // ── Single-series rendering (original logic) ──────────────────────────
      if (orientation === 'vertical') {
        const x = scaleBand()
          .domain(singleData.map((d) => d.label))
          .range([0, innerWidth])
          .padding(resolvedBarGap);

        const y = scaleLinear()
          .domain(valueDomain(singleData.map((d) => d.value)))
          .nice()
          .range([innerHeight, 0]);

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

        g.append('g')
          .attr('class', 'grid')
          .call(axisLeft(y).ticks(tickCount).tickSize(-innerWidth).tickFormat(() => ''))
          .selectAll('line')
          .attr('data-part', 'grid-line')
          .style('stroke-opacity', 0.5);
        g.selectAll('.grid .domain').remove();

        const bars = g
          .selectAll('.bar')
          .data(singleData)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('data-part', 'bar')
          .attr('data-orientation', 'vertical')
          .attr('data-layout', 'single')
          .attr('x', (d) => x(d.label) ?? 0)
          .attr('width', x.bandwidth())
          .attr('rx', resolvedBarRadius)
          .attr('ry', resolvedBarRadius)
          .attr('fill', (d, i) => d.color ?? resolvePaletteColor(palette, i));

        attachBarHover(bars, (d) => ({
          cx: (x(d.label) ?? 0) + x.bandwidth() / 2,
          cy: y(d.value),
          label: d.label,
          value: d.value,
        }));

        if (chartPersonality.animate) {
          bars
            .attr('y', y(0))
            .attr('height', 0)
            .transition()
            .duration(chartPersonality.animationDuration)
            .delay((_, i) => i * 50)
            .attr('y', (d) => barGeometry(y, d.value).position)
            .attr('height', (d) => barGeometry(y, d.value).size);
        } else {
          bars
            .attr('y', (d) => barGeometry(y, d.value).position)
            .attr('height', (d) => barGeometry(y, d.value).size);
        }

        if (showValues) {
          g.selectAll('.value')
            .data(singleData)
            .enter()
            .append('text')
            .attr('class', 'value')
            .attr('data-part', 'value-label')
            .attr('x', (d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
            .attr('y', (d) => y(d.value) + (d.value >= 0 ? -5 : 14))
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .text((d) => d.value);
        }
      } else {
        const y = scaleBand()
          .domain(singleData.map((d) => d.label))
          .range([0, innerHeight])
          .padding(resolvedBarGap);

        const x = scaleLinear()
          .domain(valueDomain(singleData.map((d) => d.value)))
          .nice()
          .range([0, innerWidth]);

        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(axisBottom(x).ticks(tickCount))
          .selectAll('text')
          .attr('data-part', 'axis-tick-label')
          .style('font-size', '12px');

        g.append('g')
          .call(axisLeft(y))
          .selectAll('text')
          .attr('data-part', 'axis-tick-label')
          .style('font-size', '12px');

        const bars = g
          .selectAll('.bar')
          .data(singleData)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('data-part', 'bar')
          .attr('data-orientation', 'horizontal')
          .attr('data-layout', 'single')
          .attr('y', (d) => y(d.label) ?? 0)
          .attr('height', y.bandwidth())
          .attr('rx', resolvedBarRadius)
          .attr('ry', resolvedBarRadius)
          .attr('fill', (d, i) => d.color ?? resolvePaletteColor(palette, i));

        attachBarHover(bars, (d) => ({
          cx: x(d.value),
          cy: (y(d.label) ?? 0) + y.bandwidth() / 2,
          label: d.label,
          value: d.value,
        }));

        if (chartPersonality.animate) {
          bars
            .attr('x', x(0))
            .attr('width', 0)
            .transition()
            .duration(chartPersonality.animationDuration)
            .delay((_, i) => i * 50)
            .attr('x', (d) => barGeometry(x, d.value).position)
            .attr('width', (d) => barGeometry(x, d.value).size);
        } else {
          bars
            .attr('x', (d) => barGeometry(x, d.value).position)
            .attr('width', (d) => barGeometry(x, d.value).size);
        }

        if (showValues) {
          g.selectAll('.value')
            .data(singleData)
            .enter()
            .append('text')
            .attr('class', 'value')
            .attr('data-part', 'value-label')
            .attr('x', (d) => x(d.value) + (d.value >= 0 ? 5 : -5))
            .attr('text-anchor', (d) => d.value >= 0 ? 'start' : 'end')
            .attr('y', (d) => (y(d.label) ?? 0) + y.bandwidth() / 2)
            .attr('dominant-baseline', 'middle')
            .style('font-size', '11px')
            .text((d) => d.value);
        }
      }
    }

    // Axis labels are appended to the root SVG (not the inner <g>) so they
    // sit outside the margin-based plotting area and stay positioned correctly.
    if (xAxisLabel) {
      svg
        .append('text')
        .attr('data-part', 'axis-label')
        .attr('data-axis', 'x')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight - 4)
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
        .attr('x', -chartHeight / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(yAxisLabel);
    }

    // Style axis lines
    svg.selectAll('.domain').attr('data-part', 'axis-domain');
    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');

    // Assigned last so the crosshair paints on top of every bar; the
    // `attachBarHover` closures above only read `crosshair` at hover time.
    if (chartPersonality.tooltip) {
      crosshair = createChartCrosshair(g, innerWidth, innerHeight);
    }

    // Data/dimension changes rebuild the svg from scratch (selectAll('*').remove()
    // above), which would otherwise leave a stale React-side tooltip pointing at
    // removed nodes.
    return () => {
      svg.selectAll('*').interrupt();
      hideTooltip();
    };
  }, [isMultiSeries, singleData, renderSeries, categories, seriesColors, stacked, chartWidth, chartHeight, orientation, resolvedBarRadius, resolvedBarGap, showValues, chartPersonality, palette, margin, xAxisLabel, yAxisLabel, tickCount, compactState.compactTooltip, showTooltip, hideTooltip]);

  const itemCount = isMultiSeries
    ? renderSeries.reduce((n, s) => n + s.data.length, 0)
    : singleData.length;

  const modeDescriptor = isMultiSeries
    ? stacked ? 'Stacked multi-series.' : 'Grouped multi-series.'
    : '';

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-bar', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Bar chart'}
      ariaDescription={describeChart('Bar chart', itemCount, subtitle, [
        orientation === 'horizontal' ? 'Horizontal orientation.' : 'Vertical orientation.',
        modeDescriptor || null,
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
