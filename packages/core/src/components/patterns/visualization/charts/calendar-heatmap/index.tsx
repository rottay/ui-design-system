'use client';

/**
 * @fileoverview CalendarHeatMap -- a GitHub-contribution-style calendar visualization built with
 * D3 time utilities. Renders a year-long (or custom range) grid where each cell represents a single
 * day, colored by its value using `scaleQuantize` over a configurable color range. Columns represent
 * ISO weeks (Mon-Sun), rows represent days of the week. Month labels sit above the grid at month
 * boundaries, and abbreviated day-of-week labels (Mon, Wed, Fri) are rendered on the left.
 *
 * The component does NOT use an SVG axis -- the grid and labels are positioned manually via
 * `timeDay`, `timeWeek`, and `timeMonth` from d3-time for precise calendar alignment.
 *
 * @example
 * <CalendarHeatMap
 *   data={[
 *     { date: '2025-06-01', value: 3 },
 *     { date: '2025-06-02', value: 7 },
 *     { date: '2025-08-15', value: 12 },
 *   ]}
 *   title="Contribution Activity"
 *   height={180}
 * />
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import {
  color as parseColor,
  interpolateRgb,
  scaleQuantize,
  select,
  timeDay,
  timeFormat,
  timeMonday,
  timeMonth,
} from 'd3';

import type { ChartBaseProps, ChartColorSchemeProps } from '../Charts.types';
import { useChartDimensions, useChartPersonality, useChartTheme } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';
import { resolveCssColor } from '../utils/resolve-css-color';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single day data point in the calendar heatmap. */
export interface CalendarHeatMapDataPoint {
  /** ISO date string (YYYY-MM-DD) or Date object */
  date: Date | string;
  /** Numeric value for this day */
  value: number;
}

/** Props for the {@link CalendarHeatMap} component. */
export interface CalendarHeatMapProps extends ChartBaseProps, ChartColorSchemeProps {
  data: CalendarHeatMapDataPoint[];
  /** Start date of the range. Default: 1 year ago from today */
  startDate?: Date | string;
  /** End date of the range. Default: today */
  endDate?: Date | string;
  /** Color range [low, high]. Default: [--ds-color-bg-tertiary, personality primary] */
  colorRange?: [string, string];
  /** Number of discrete color steps. Default: 5 */
  colorSteps?: number;
  /** Day cell size in pixels. Default: 14 */
  cellSize?: number;
  /** Gap between cells in pixels. Default: 2 */
  cellGap?: number;
  /** Show month labels above the grid. Default: true */
  showMonthLabels?: boolean;
  /** Show day-of-week labels (Mon, Wed, Fri) on the left. Default: true */
  showDayLabels?: boolean;
  /** Custom tooltip format function */
  formatTooltip?: (date: Date, value: number) => string;
  /** Click handler for individual cells */
  onCellClick?: (date: Date, value: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise a Date-or-string input to a midnight-local Date. */
function toDate(input: Date | string): Date {
  const date = input instanceof Date
    ? new Date(input)
  // Parse YYYY-MM-DD as local (not UTC) by replacing hyphens so the
  // Date constructor treats it as a local date string.
    : new Date(input.replace(/-/g, '/'));
  if (Number.isFinite(date.getTime())) date.setHours(0, 0, 0, 0);
  return date;
}

/** Format a Date as YYYY-MM-DD for use as a lookup key. */
const fmtKey = timeFormat('%Y-%m-%d');

/** Abbreviated month labels for the top axis. */
const fmtMonth = timeFormat('%b');

/** Day-of-week labels rendered on the left side (Mon = index 0). */
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const DEFAULT_LOW_COLOR = 'var(--ds-color-bg-tertiary)';
const LOW_COLOR_FALLBACK = '#e5e7eb';
const HIGH_COLOR_FALLBACK = '#0072b2';
const DEFAULT_COLOR_STEPS = 5;
const MAX_COLOR_STEPS = 256;

function resolveD3Color(
  value: string,
  owner: HTMLElement | SVGElement | null,
  fallback: string,
): string {
  const resolved = resolveCssColor(value, owner, fallback);
  return parseColor(resolved)?.formatRgb() ?? fallback;
}

function normalizeColorSteps(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_COLOR_STEPS;
  return Math.min(MAX_COLOR_STEPS, Math.max(2, Math.floor(value)));
}

function normalizePositiveSize(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeGap(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 2;
}

function quantizeDomain(values: number[]): [number, number] {
  if (values.length === 0) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum !== maximum) return [minimum, maximum];
  if (minimum > 0) return [0, minimum];
  if (minimum < 0) return [minimum, 0];
  return [-1, 0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a GitHub-contribution-style calendar heatmap using D3 time utilities.
 *
 * The grid is an SVG with one `<rect>` per day. Days without data are rendered in a subtle
 * background color. Days with data are colored by a quantize scale that maps the value range
 * to a configurable number of discrete color steps between `colorRange[0]` and `colorRange[1]`.
 *
 * @param props - See {@link CalendarHeatMapProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table.
 */
export const CalendarHeatMap = memo(function CalendarHeatMap({
  data,
  startDate: startDateProp,
  endDate: endDateProp,
  colorRange,
  colorScheme,
  colorSteps = 5,
  cellSize = 14,
  cellGap = 2,
  showMonthLabels = true,
  showDayLabels = true,
  formatTooltip,
  onCellClick,
  width,
  height: heightProp = 180,
  className,
  style,
  loading = false,
  title,
  subtitle,
  animate = true,
  responsive = true,
  tooltip = true,
}: CalendarHeatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, heightProp);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  // Keep imperative paint reactive to the owning provider rather than to a
  // document-global theme. Passing the ref (not ref.current) also covers the
  // normal null-first-render lifecycle.
  const chartTheme = useChartTheme(containerRef);
  const resolvedColorRange = useMemo<[string, string]>(() => (
    colorRange ?? [DEFAULT_LOW_COLOR, chartPersonality.colors[0] ?? 'var(--ds-color-primary-500)']
  ), [chartPersonality.colors, colorRange]);

  // Resolve date range -------------------------------------------------
  const endDate = useMemo(() => {
    if (endDateProp) {
      const parsed = toDate(endDateProp);
      if (Number.isFinite(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [endDateProp]);

  const startDate = useMemo(() => {
    if (startDateProp) {
      const parsed = toDate(startDateProp);
      if (Number.isFinite(parsed.getTime())) return parsed;
    }
    const d = new Date(endDate);
    d.setFullYear(d.getFullYear() - 1);
    d.setDate(d.getDate() + 1); // exactly 365/366 days
    return d;
  }, [startDateProp, endDate]);

  // Build lookup map: YYYY-MM-DD -> value ----------------------------
  const valueMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const point of data) {
      const date = toDate(point.date);
      if (!Number.isFinite(date.getTime()) || !Number.isFinite(point.value)) continue;
      const key = fmtKey(date);
      const nextValue = (map.get(key) ?? 0) + point.value;
      if (Number.isFinite(nextValue)) map.set(key, nextValue);
    }
    return map;
  }, [data]);

  // Generate every day in the range ----------------------------------
  const allDays = useMemo(() => {
    return timeDay.range(startDate, timeDay.offset(endDate, 1));
  }, [startDate, endDate]);

  // Accessible summary table -----------------------------------------
  const summary = useMemo(() => {
    const recordedDays = allDays.flatMap((date) => {
      const key = fmtKey(date);
      const value = valueMap.get(key);
      return value == null || !Number.isFinite(value)
        ? []
        : [{ date: key, value }];
    });

    return {
      caption: title ? `${title} data summary` : 'Calendar heatmap data summary',
      headers: ['Date', 'Value'],
      rows: recordedDays.slice(0, 50).map((d) => [d.date, d.value]),
    };
  }, [allDays, valueMap, title]);

  // Layout constants --------------------------------------------------
  const dayLabelWidth = showDayLabels ? 32 : 0;
  const monthLabelHeight = showMonthLabels ? 18 : 0;
  const resolvedCellSize = normalizePositiveSize(cellSize, 14);
  const resolvedCellGap = normalizeGap(cellGap);
  const resolvedColorSteps = normalizeColorSteps(colorSteps);
  const step = resolvedCellSize + resolvedCellGap;

  // Render D3 ---------------------------------------------------------
  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const svg = select(svgNode);
    svg.selectAll('*').interrupt().remove();
    if (allDays.length === 0) {
      svg.attr('width', 0).attr('height', 0);
      return;
    }

    // Compute grid bounds
    const firstMonday = timeMonday.floor(startDate);
    const totalWeeks = Math.ceil(
      (timeDay.count(firstMonday, endDate) + 1) / 7,
    );
    const gridWidth = totalWeeks * step;
    const gridHeight = 7 * step;
    const measuredWidth = Number.isFinite(dimensions.width) ? Math.max(0, dimensions.width) : 0;
    const svgWidth = responsive
      ? Math.max(measuredWidth, gridWidth + dayLabelWidth + 8)
      : gridWidth + dayLabelWidth + 8;
    const svgHeight = gridHeight + monthLabelHeight + 4;

    svg.attr('width', svgWidth).attr('height', svgHeight);

    const values = [...valueMap.values()].filter((value) => Number.isFinite(value));

    // Build discrete color steps via quantize scale
    const colorOwner = containerRef.current ?? svgNode;
    const lowColor = resolveD3Color(resolvedColorRange[0], colorOwner, LOW_COLOR_FALLBACK);
    const highColor = resolveD3Color(resolvedColorRange[1], colorOwner, HIGH_COLOR_FALLBACK);
    const colorInterpolator = interpolateRgb(lowColor, highColor);
    const stepColors: string[] = [];
    for (let i = 0; i < resolvedColorSteps; i++) {
      stepColors.push(colorInterpolator(i / (resolvedColorSteps - 1)));
    }
    // The first color is reserved for dates with no observation. Recorded
    // negative and zero values still receive a deterministic filled color.
    const filledStepColors = stepColors.slice(1);
    const colorScale = scaleQuantize<string>()
      .domain(quantizeDomain(values))
      .range(filledStepColors);

    const g = svg
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${dayLabelWidth}, ${monthLabelHeight})`);

    // Day-of-week labels (Mon, Wed, Fri) on left side
    if (showDayLabels) {
      const labelG = svg
        .append('g')
        .attr('data-part', 'day-labels')
        .attr('transform', `translate(0, ${monthLabelHeight})`);

      DAY_LABELS.forEach((label, i) => {
        if (!label) return;
        labelG
          .append('text')
          .attr('data-part', 'day-label')
          .attr('x', dayLabelWidth - 6)
          .attr('y', i * step + step / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end')
          .style('font-size', '10px')
          .text(label);
      });
    }

    // Month labels above the grid at month boundaries
    if (showMonthLabels) {
      const months = timeMonth.range(
        timeMonth.ceil(startDate),
        timeDay.offset(endDate, 1),
      );

      const labelG = svg.append('g').attr('data-part', 'month-labels');

      months.forEach((monthDate) => {
        const weekOffset = Math.floor(
          timeDay.count(firstMonday, monthDate) / 7,
        );
        labelG
          .append('text')
          .attr('data-part', 'month-label')
          .attr('x', dayLabelWidth + weekOffset * step)
          .attr('y', monthLabelHeight - 4)
          .attr('text-anchor', 'start')
          .style('font-size', '10px')
          .text(fmtMonth(monthDate));
      });
    }

    // Render day cells
    const cells = g
      .selectAll('.cal-cell')
      .data(allDays)
      .enter()
      .append('rect')
      .attr('class', 'cal-cell')
      .attr('data-part', 'cell')
      .attr('data-state', (d) => {
        const value = valueMap.get(fmtKey(d));
        return value == null || !Number.isFinite(value) ? 'empty' : 'filled';
      })
      .attr('x', (d) => {
        const weekOffset = Math.floor(timeDay.count(firstMonday, d) / 7);
        return weekOffset * step;
      })
      .attr('y', (d) => {
        // getDay(): 0=Sun ... 6=Sat -> remap to Mon=0 ... Sun=6
        const dow = (d.getDay() + 6) % 7;
        return dow * step;
      })
      .attr('width', resolvedCellSize)
      .attr('height', resolvedCellSize)
      .attr('rx', 'var(--ds-radius-sm, 2)')
      .attr('ry', 'var(--ds-radius-sm, 2)')
      .attr('fill', (d) => {
        const val = valueMap.get(fmtKey(d));
        if (val == null || !Number.isFinite(val)) return lowColor;
        return colorScale(val) ?? lowColor;
      })
      .style('cursor', onCellClick ? 'pointer' : 'default');

    // Tooltips
    if (chartPersonality.tooltip) {
      cells.append('title').text((d) => {
        const rawValue = valueMap.get(fmtKey(d));
        const hasValue = rawValue != null && Number.isFinite(rawValue);
        const val = hasValue ? rawValue : 0;
        if (formatTooltip) return formatTooltip(d, val);
        const dateStr = fmtKey(d);
        return hasValue ? `${dateStr}: ${val}` : `${dateStr}: No activity`;
      });
    }

    // Click handler
    if (onCellClick) {
      cells.on('click', (_event, d) => {
        const rawValue = valueMap.get(fmtKey(d));
        const val = rawValue != null && Number.isFinite(rawValue) ? rawValue : 0;
        onCellClick(d, val);
      });
    }

    // Fade-in animation
    if (chartPersonality.animate) {
      cells
        .attr('opacity', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 0.5)
        .attr('opacity', 1);
    }

    return () => {
      svg.selectAll('*').interrupt();
    };
  }, [
    allDays,
    valueMap,
    startDate,
    endDate,
    resolvedColorRange,
    resolvedColorSteps,
    resolvedCellSize,
    resolvedCellGap,
    step,
    showMonthLabels,
    showDayLabels,
    dayLabelWidth,
    monthLabelHeight,
    responsive,
    dimensions.width,
    chartPersonality.animate,
    chartPersonality.animationDuration,
    chartPersonality.tooltip,
    chartTheme,
    formatTooltip,
    onCellClick,
  ]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={heightProp}
      className={['ds-chart-calendar-heatmap', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Calendar heatmap'}
      ariaDescription={describeChart(
        'Calendar heatmap',
        allDays.length,
        subtitle,
        `Date range: ${fmtKey(startDate)} to ${fmtKey(endDate)}.`,
      )}
      summary={summary}
    />
  );
});
