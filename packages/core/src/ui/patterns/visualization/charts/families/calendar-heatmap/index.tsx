'use client';

/**
 * Compatibility family for the public CalendarHeatMap contract.
 *
 * The chart-engine now owns pure calendar-grid geometry and React/SVG marks.
 * This adapter preserves the established family props, scaffold, and accessible
 * summary. It shapes the raw day points into a value map and delegates all SVG
 * ownership (including provider-scoped color resolution) to the renderer.
 */

import { memo, useMemo, useRef } from 'react';

import type { ChartBaseProps, ChartColorSchemeProps, ChartStateProps } from '../../contracts';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import { useChartPersonality } from '../../runtime';
import { SvgCalendarHeatMapRenderer } from '../../runtime/chart-engine/presentation/react/renderers/calendar-heat-map';

/** A single day data point in the calendar heatmap. */
export interface CalendarHeatMapDataPoint {
  /** ISO date string (YYYY-MM-DD) or Date object */
  date: Date | string;
  /** Numeric value for this day */
  value: number;
}

/** Own props for the {@link CalendarHeatMap} component (state copy is composed below). */
interface CalendarHeatMapOwnProps extends ChartBaseProps, ChartColorSchemeProps {
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

/** Props for the {@link CalendarHeatMap} component. */
export type CalendarHeatMapProps = CalendarHeatMapOwnProps & ChartStateProps;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Normalise a Date-or-string input to a midnight-local Date. */
function toDate(input: Date | string): Date {
  const date = input instanceof Date
    ? new Date(input)
    // Parse YYYY-MM-DD as local (not UTC) by replacing hyphens.
    : new Date(input.replace(/-/g, '/'));
  if (Number.isFinite(date.getTime())) date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Format a Date as local YYYY-MM-DD. Matches the geometry's `%Y-%m-%d` key so
 * value lookups align without importing D3 into the family.
 */
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Public CalendarHeatMap compatibility adapter. All SVG ownership is delegated
 * to {@link SvgCalendarHeatMapRenderer}; the family contract remains unchanged.
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
  state,
  emptyLabel,
  emptyDescription,
  emptyAction,
  errorLabel,
  errorDescription,
  errorAction,
  title,
  subtitle,
  animate = true,
  responsive = true,
  tooltip = true,
}: CalendarHeatMapProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const resolvedColorRange = useMemo<[string, string]>(() => (
    colorRange ?? ['var(--ds-color-bg-tertiary)', chartPersonality.colors[0] ?? 'var(--ds-color-primary-500)']
  ), [chartPersonality.colors, colorRange]);

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

  const values = useMemo(() => {
    const map = new Map<string, number>();
    for (const point of data) {
      const date = toDate(point.date);
      if (!Number.isFinite(date.getTime()) || !Number.isFinite(point.value)) continue;
      const key = localDateKey(date);
      const nextValue = (map.get(key) ?? 0) + point.value;
      if (Number.isFinite(nextValue)) map.set(key, nextValue);
    }
    return map;
  }, [data]);

  const startKey = localDateKey(startDate);
  const endKey = localDateKey(endDate);
  const dayCount = Number.isFinite(startDate.getTime()) && Number.isFinite(endDate.getTime())
    ? Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1)
    : 0;

  const summary = useMemo(() => {
    const recorded = [...values.entries()]
      .filter(([key]) => key >= startKey && key <= endKey)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .slice(0, 50);
    return {
      caption: title ? `${title} data summary` : 'Calendar heatmap data summary',
      headers: ['Date', 'Value'],
      rows: recorded.map(([date, value]) => [date, value]),
    };
  }, [values, startKey, endKey, title]);

  const rendererTooltip = useMemo(
    () => (formatTooltip
      ? (dateKey: string, value: number) => formatTooltip(toDate(dateKey), value)
      : undefined),
    [formatTooltip],
  );
  const rendererClick = useMemo(
    () => (onCellClick
      ? (dateKey: string, value: number) => onCellClick(toDate(dateKey), value)
      : undefined),
    [onCellClick],
  );

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: values.size,
    emptyLabel,
  });
  // Rebuild the discriminated state contract from the resolved state so the
  // typed-required copy correlates with the active arm.
  const stateProps: ChartStateProps = resolvedState === 'error'
    ? {
      state: 'error',
      errorLabel: errorLabel ?? '',
      ...(errorDescription === undefined ? {} : { errorDescription }),
      ...(errorAction === undefined ? {} : { errorAction }),
    }
    : resolvedState === 'empty'
      ? {
        state: 'empty',
        emptyLabel: emptyLabel ?? '',
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      }
      : {
        state: resolvedState,
        ...(emptyLabel === undefined ? {} : { emptyLabel }),
        ...(emptyDescription === undefined ? {} : { emptyDescription }),
        ...(emptyAction === undefined ? {} : { emptyAction }),
      };

  return (
    <ChartScaffold
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={heightProp}
      className={['ds-chart-calendar-heatmap', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Calendar heatmap'}
      ariaDescription={describeChart(
        'Calendar heatmap',
        dayCount,
        subtitle,
        `Date range: ${startKey} to ${endKey}.`,
      )}
      summary={summary}
      plot={({ descriptionId }) => (
        <SvgCalendarHeatMapRenderer
          startDate={startDate}
          endDate={endDate}
          values={values}
          ariaLabel={title ?? 'Calendar heatmap'}
          ariaDescribedBy={descriptionId}
          width={width}
          height={heightProp}
          responsive={responsive}
          colorRange={resolvedColorRange}
          colorSteps={colorSteps}
          cellSize={cellSize}
          cellGap={cellGap}
          showMonthLabels={showMonthLabels}
          showDayLabels={showDayLabels}
          showTitles={chartPersonality.tooltip}
          {...(rendererTooltip ? { formatTooltip: rendererTooltip } : {})}
          {...(rendererClick ? { onCellClick: rendererClick } : {})}
          // The caller's style carries any provider color variables the
          // quantized range resolves against. Placing it on the renderer's own
          // owner keeps resolution correct even where a host cannot resolve an
          // inherited custom property from an ancestor scope (heat-map parity).
          style={style}
        />
      )}
    />
  );
});
