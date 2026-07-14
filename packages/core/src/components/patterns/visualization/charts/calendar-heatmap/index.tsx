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
  interpolateRgb,
  scaleQuantize,
  select,
  timeDay,
  timeFormat,
  timeMonday,
  timeMonth,
} from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

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
export interface CalendarHeatMapProps extends ChartBaseProps {
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
  if (input instanceof Date) return input;
  // Parse YYYY-MM-DD as local (not UTC) by replacing hyphens so the
  // Date constructor treats it as a local date string.
  return new Date(input.replace(/-/g, '/'));
}

/** Format a Date as YYYY-MM-DD for use as a lookup key. */
const fmtKey = timeFormat('%Y-%m-%d');

/** Abbreviated month labels for the top axis. */
const fmtMonth = timeFormat('%b');

/** Day-of-week labels rendered on the left side (Mon = index 0). */
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

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
  const resolvedColorRange =
    colorRange ?? ['var(--ds-color-bg-tertiary)', chartPersonality.colors[0] ?? 'var(--ds-color-primary-500)'];

  // Resolve date range -------------------------------------------------
  const endDate = useMemo(() => {
    if (endDateProp) return toDate(endDateProp);
    return new Date();
  }, [endDateProp]);

  const startDate = useMemo(() => {
    if (startDateProp) return toDate(startDateProp);
    const d = new Date(endDate);
    d.setFullYear(d.getFullYear() - 1);
    d.setDate(d.getDate() + 1); // exactly 365/366 days
    return d;
  }, [startDateProp, endDate]);

  // Build lookup map: YYYY-MM-DD -> value ----------------------------
  const valueMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const point of data) {
      const key = fmtKey(toDate(point.date));
      map.set(key, (map.get(key) ?? 0) + point.value);
    }
    return map;
  }, [data]);

  // Generate every day in the range ----------------------------------
  const allDays = useMemo(() => {
    return timeDay.range(startDate, timeDay.offset(endDate, 1));
  }, [startDate, endDate]);

  // Accessible summary table -----------------------------------------
  const summary = useMemo(() => {
    const nonZero = allDays
      .map((d) => ({ date: fmtKey(d), value: valueMap.get(fmtKey(d)) ?? 0 }))
      .filter((d) => d.value > 0);

    return {
      caption: title ? `${title} data summary` : 'Calendar heatmap data summary',
      headers: ['Date', 'Value'],
      rows: nonZero.slice(0, 50).map((d) => [d.date, d.value]),
    };
  }, [allDays, valueMap, title]);

  // Layout constants --------------------------------------------------
  const dayLabelWidth = showDayLabels ? 32 : 0;
  const monthLabelHeight = showMonthLabels ? 18 : 0;
  const step = cellSize + cellGap;

  // Render D3 ---------------------------------------------------------
  useEffect(() => {
    if (!svgRef.current || allDays.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    // Compute grid bounds
    const firstMonday = timeMonday.floor(startDate);
    const totalWeeks = Math.ceil(
      (timeDay.count(firstMonday, endDate) + 1) / 7,
    );
    const gridWidth = totalWeeks * step;
    const gridHeight = 7 * step;
    const svgWidth = responsive
      ? Math.max(dimensions.width, gridWidth + dayLabelWidth + 8)
      : gridWidth + dayLabelWidth + 8;
    const svgHeight = gridHeight + monthLabelHeight + 4;

    svg.attr('width', svgWidth).attr('height', svgHeight);

    // Value domain (only positive values for quantize)
    const values = [...valueMap.values()];
    const maxVal = values.length > 0 ? Math.max(...values) : 1;
    const minVal = 0;

    // Build discrete color steps via quantize scale
    const colorInterpolator = interpolateRgb(resolvedColorRange[0], resolvedColorRange[1]);
    const stepColors: string[] = [];
    for (let i = 0; i < colorSteps; i++) {
      stepColors.push(colorInterpolator(i / (colorSteps - 1)));
    }
    const colorScale = scaleQuantize<string>()
      .domain([minVal + 0.001, maxVal]) // ensure 0 is below domain
      .range(stepColors);

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
        return value == null || value === 0 ? 'empty' : 'filled';
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
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 'var(--ds-radius-sm, 2)')
      .attr('ry', 'var(--ds-radius-sm, 2)')
      .attr('fill', (d) => {
        const val = valueMap.get(fmtKey(d));
        if (val == null || val === 0) return resolvedColorRange[0];
        return colorScale(val) ?? resolvedColorRange[0];
      })
      .style('cursor', onCellClick ? 'pointer' : 'default');

    // Tooltips
    if (chartPersonality.tooltip) {
      cells.append('title').text((d) => {
        const val = valueMap.get(fmtKey(d)) ?? 0;
        if (formatTooltip) return formatTooltip(d, val);
        const dateStr = fmtKey(d);
        return val === 0
          ? `${dateStr}: No activity`
          : `${dateStr}: ${val}`;
      });
    }

    // Click handler
    if (onCellClick) {
      cells.on('click', (_event, d) => {
        const val = valueMap.get(fmtKey(d)) ?? 0;
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
  }, [
    allDays,
    valueMap,
    startDate,
    endDate,
    resolvedColorRange,
    colorSteps,
    cellSize,
    cellGap,
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
