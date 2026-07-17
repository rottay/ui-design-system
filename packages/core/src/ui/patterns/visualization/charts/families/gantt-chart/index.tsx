'use client';

/**
 * @fileoverview GanttChart -- D3-backed Gantt timeline using `scaleTime` for the horizontal date
 * axis and `scaleBand` for vertical task rows. Each task has a translucent background bar
 * showing the full planned duration and an opaque progress overlay proportional to completion.
 * Height auto-grows to fit the task count so rows remain readable. A dashed "Today" line is
 * drawn when the current date falls within the visible domain.
 *
 * @example
 * <GanttChart
 *   tasks={[
 *     { id: '1', name: 'Design', start: '2026-01-01', end: '2026-02-15', progress: 80 },
 *     { id: '2', name: 'Build',  start: '2026-02-01', end: '2026-04-01', progress: 30 },
 *   ]}
 *   showProgress
 *   showToday
 *   title="Project Timeline"
 * />
 */

import { memo, useEffect, useMemo, useRef } from 'react';
import { axisBottom, axisLeft, max, min, scaleBand, scaleTime, select, timeFormat } from 'd3';

import type { ChartBaseProps, ChartColorsProps, ChartMarginProps } from '../../contracts';
import { DEFAULT_MARGIN } from '../../foundation/geometry';
import { useChartDimensions, useChartPersonality } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';

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

/** Props for the {@link GanttChart} component. */
export interface GanttChartProps extends ChartBaseProps, ChartColorsProps, ChartMarginProps {
  tasks: GanttTask[];
  showProgress?: boolean;
  showToday?: boolean;
}

const DEFAULT_GANTT_MARGIN = { ...DEFAULT_MARGIN, bottom: 30, left: 150 };

/**
 * Renders a Gantt timeline using `scaleTime` (x) and `scaleBand` (y) with task progress overlays.
 *
 * @param props - See {@link GanttChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table.
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
  title,
  subtitle,
  animate = true,
  responsive = true,
  colors,
  tooltip = true,
  margin = DEFAULT_GANTT_MARGIN,
}: GanttChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 800;
  const parsedTasks = useMemo(() => {
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
        ...task,
        start,
        end,
        progress: task.progress == null || !Number.isFinite(task.progress)
          ? undefined
          : Math.min(100, Math.max(0, task.progress)),
      }];
    });
  }, [tasks]);
  const baseHeight = Number.isFinite(height) ? Math.max(0, height) : 400;
  const verticalMargin = margin.top + margin.bottom;
  const requiredHeight = Number.isFinite(verticalMargin)
    ? parsedTasks.length * 36 + verticalMargin
    : baseHeight;
  // Dynamically grow the chart height so every task gets a readable row;
  // the minimum stays at the consumer-supplied `height` to avoid collapse.
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

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const svg = select(svgNode);
    svg.selectAll('*').interrupt().remove();
    if (parsedTasks.length === 0) return;

    const safeChartWidth = Number.isFinite(chartWidth) ? Math.max(0, chartWidth) : 0;
    const rawInnerWidth = safeChartWidth - margin.left - margin.right;
    const rawInnerHeight = dynamicHeight - margin.top - margin.bottom;
    const innerWidth = Number.isFinite(rawInnerWidth) ? Math.max(0, rawInnerWidth) : 0;
    const innerHeight = Number.isFinite(rawInnerHeight) ? Math.max(0, rawInnerHeight) : 0;
    svg.attr('width', safeChartWidth).attr('height', dynamicHeight);
    if (innerWidth === 0 || innerHeight === 0) return;

    const g = svg
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // scaleTime maps the full date span (earliest start -> latest end) to pixel
    // width; .nice() rounds the domain to tidy date boundaries (e.g. month start).
    const earliestStart = min(parsedTasks, (d) => d.start)!;
    const latestEnd = max(parsedTasks, (d) => d.end)!;
    const hasConstantDomain = earliestStart.getTime() === latestEnd.getTime();
    const domainStart = hasConstantDomain
      ? new Date(earliestStart.getTime() - 12 * 60 * 60 * 1000)
      : earliestStart;
    const domainEnd = hasConstantDomain
      ? new Date(latestEnd.getTime() + 12 * 60 * 60 * 1000)
      : latestEnd;
    const x = scaleTime()
      .domain([domainStart, domainEnd])
      .range([0, innerWidth])
      .nice();
    const taskWidth = (task: (typeof parsedTasks)[number]): number =>
      Math.max(1, x(task.end) - x(task.start));

    // scaleBand assigns each task id an equal-height row with 30% padding between
    // rows for visual separation and hover affordance.
    const y = scaleBand()
      .domain(parsedTasks.map((d) => d.id))
      .range([0, innerHeight])
      .padding(0.3);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(axisBottom(x).ticks(6))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '11px');

    // Task names
    g.append('g')
      .call(axisLeft(y).tickFormat((id) => parsedTasks.find((t) => t.id === id)?.name ?? id))
      .selectAll('text')
      .attr('data-part', 'axis-tick-label')
      .style('font-size', '12px');

    // Grid
    g.append('g')
      .call(axisBottom(x).ticks(6).tickSize(innerHeight).tickFormat(() => ''))
      .attr('opacity', 0.15)
      .selectAll('line')
      .attr('data-part', 'grid-line');
    g.selectAll('.domain').attr('data-part', 'axis-domain');

    // Task bars are rendered as two overlapping rects per task: a translucent
    // background bar (full duration) and an opaque progress bar (partial width).
    const bars = g
      .selectAll('.task')
      .data(parsedTasks)
      .enter()
      .append('g')
      .attr('class', 'task')
      .attr('data-part', 'task');

    // Background bar at 25% opacity shows the full planned duration. The
    // progress overlay (below) fills a proportional width at full opacity.
    const rects = bars
      .append('rect')
      .attr('data-part', 'task-duration')
      .attr('x', (d) => x(d.start))
      .attr('y', (d) => y(d.id) ?? 0)
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', (d, i) => d.color ?? palette[i % palette.length] ?? 'var(--ds-color-primary)')
      .attr('opacity', 0.25);

    if (chartPersonality.animate) {
      rects
        .attr('width', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 50)
        .attr('width', taskWidth);
    } else {
      rects.attr('width', taskWidth);
    }

    // Progress bar
    if (showProgress) {
      const progressBars = bars
        .filter((d) => d.progress != null && d.progress > 0)
        .append('rect')
        .attr('data-part', 'task-progress')
        .attr('x', (d) => x(d.start))
        .attr('y', (d) => y(d.id) ?? 0)
        .attr('height', y.bandwidth())
        .attr('rx', 4)
        .attr('fill', (d, i) => d.color ?? palette[i % palette.length] ?? 'var(--ds-color-primary)');

      if (chartPersonality.animate) {
        progressBars
          .attr('width', 0)
          .transition()
          .duration(chartPersonality.animationDuration)
          .delay((_, i) => i * 50)
          .attr('width', (d) => Math.max(1, taskWidth(d) * ((d.progress ?? 0) / 100)));
      } else {
        progressBars.attr('width', (d) => Math.max(1, taskWidth(d) * ((d.progress ?? 0) / 100)));
      }
    }

    if (chartPersonality.tooltip) {
      bars.append('title').text((d) => {
        const fmt = timeFormat('%b %d, %Y');
        const progress = d.progress != null ? ` (${d.progress}%)` : '';
        return `${d.name}: ${fmt(d.start)} - ${fmt(d.end)}${progress}`;
      });
    }

    // "Today" marker is only drawn if the current date falls within the
    // chart's visible domain; otherwise it would render off-canvas.
    if (showToday) {
      const now = new Date();
      if (now >= x.domain()[0] && now <= x.domain()[1]) {
        g.append('line')
          .attr('data-part', 'today-marker')
          .attr('x1', x(now))
          .attr('x2', x(now))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3');

        g.append('text')
          .attr('data-part', 'today-label')
          .attr('x', x(now))
          .attr('y', -6)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .text('Today');
      }
    }

    svg.selectAll('.tick line:not([data-part])').attr('data-part', 'axis-tick');

    return () => {
      svg.selectAll('*').interrupt();
    };
  }, [
    parsedTasks,
    chartWidth,
    dynamicHeight,
    showProgress,
    showToday,
    chartPersonality.animate,
    chartPersonality.animationDuration,
    palette,
    margin,
    chartPersonality.tooltip,
  ]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={dynamicHeight}
      className={['ds-chart-gantt', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Gantt chart'}
      ariaDescription={describeChart('Gantt chart', parsedTasks.length, subtitle, showToday ? 'Includes a marker for today when it falls inside the visible date range.' : undefined)}
      summary={summary}
    />
  );
});
