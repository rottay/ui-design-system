'use client';

/**
 * Compatibility family for the public GanttChart contract.
 *
 * The chart-engine now owns pure time-axis lane geometry and React/SVG marks.
 * This adapter preserves the established family props, scaffold, and accessible
 * summary. It validates and parses raw tasks, then delegates all SVG ownership
 * to the renderer.
 */

import { memo, useMemo, useRef } from 'react';

import type { ChartBaseProps, ChartColorsProps, ChartMarginProps, ChartStateProps } from '../../contracts';
import { DEFAULT_MARGIN } from '../../foundation/geometry';
import { ChartScaffold, describeChart, resolveChartScaffoldState } from '../../presentation/scaffold';
import { useChartPersonality } from '../../runtime';
import type { SvgGanttTask } from '../../runtime/chart-engine/foundation/renderers/geometry';
import { SvgGanttRenderer } from '../../runtime/chart-engine/presentation/react/renderers/gantt';

/** A single task in the Gantt timeline. Dates accept ISO strings or `Date` objects. */
export interface GanttTask {
  id: string;
  name: string;
  start: Date | string;
  end: Date | string;
  progress?: number;
  color?: string;
  group?: string;
}

/** Own props for the {@link GanttChart} component (state copy is composed below). */
interface GanttChartOwnProps extends ChartBaseProps, ChartColorsProps, ChartMarginProps {
  tasks: GanttTask[];
  showProgress?: boolean;
  showToday?: boolean;
}

/** Props for the {@link GanttChart} component. */
export type GanttChartProps = GanttChartOwnProps & ChartStateProps;

const DEFAULT_GANTT_MARGIN = { ...DEFAULT_MARGIN, bottom: 30, left: 150 };

/**
 * Public GanttChart compatibility adapter. All SVG ownership is delegated to
 * {@link SvgGanttRenderer}; the family contract remains unchanged.
 */
export const GanttChart = memo(function GanttChart({
  tasks,
  showProgress = true,
  showToday = true,
  width,
  height = 400,
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
  colors,
  tooltip = true,
  margin = DEFAULT_GANTT_MARGIN,
}: GanttChartProps) {
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const parsedTasks = useMemo<SvgGanttTask[]>(() => {
    const seenIds = new Set<string>();
    return tasks.flatMap((task) => {
      const start = new Date(task.start);
      const end = new Date(task.end);
      if (
        typeof task.id !== 'string'
        || task.id.length === 0
        || seenIds.has(task.id)
        || !Number.isFinite(start.getTime())
        || !Number.isFinite(end.getTime())
        || end < start
      ) {
        return [];
      }
      seenIds.add(task.id);
      return [{
        id: task.id,
        name: task.name,
        start,
        end,
        progress: task.progress == null || !Number.isFinite(task.progress)
          ? undefined
          : Math.min(100, Math.max(0, task.progress)),
        ...(task.color === undefined ? {} : { color: task.color }),
      }];
    });
  }, [tasks]);

  const baseHeight = Number.isFinite(height) ? Math.max(0, height) : 400;
  const verticalMargin = margin.top + margin.bottom;
  const requiredHeight = Number.isFinite(verticalMargin)
    ? parsedTasks.length * 36 + verticalMargin
    : baseHeight;
  // Grow the chart height so every task gets a readable row; the minimum stays
  // at the consumer-supplied `height` to avoid collapse.
  const dynamicHeight = Math.max(baseHeight, requiredHeight);

  const summary = {
    caption: title ? `${title} data summary` : 'Gantt chart data summary',
    headers: ['Task', 'Start', 'End', 'Progress'],
    rows: parsedTasks.map((task) => [
      task.name,
      task.start.toISOString().slice(0, 10),
      task.end.toISOString().slice(0, 10),
      task.progress ?? 'N/A',
    ]),
  };

  const resolvedState = resolveChartScaffoldState({
    state,
    loading,
    dataCount: parsedTasks.length,
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
      height={dynamicHeight}
      className={['ds-chart-gantt', className].filter(Boolean).join(' ')}
      style={style}
      {...stateProps}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Gantt chart'}
      ariaDescription={describeChart('Gantt chart', parsedTasks.length, subtitle, showToday ? 'Includes a marker for today when it falls inside the visible date range.' : undefined)}
      summary={summary}
      plot={({ descriptionId }) => (
        <SvgGanttRenderer
          tasks={parsedTasks}
          ariaLabel={title ?? 'Gantt chart'}
          ariaDescribedBy={descriptionId}
          width={width}
          height={dynamicHeight}
          responsive={responsive}
          animate={chartPersonality.animate}
          margin={margin}
          showProgress={showProgress}
          showToday={showToday}
          colors={palette}
          showTitles={chartPersonality.tooltip}
        />
      )}
    />
  );
});
