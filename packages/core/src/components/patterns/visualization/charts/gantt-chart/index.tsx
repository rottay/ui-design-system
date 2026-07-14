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

import { memo, useEffect, useRef } from 'react';
import { axisBottom, axisLeft, max, min, scaleBand, scaleTime, select, timeFormat } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

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
export interface GanttChartProps extends ChartBaseProps {
  tasks: GanttTask[];
  showProgress?: boolean;
  showToday?: boolean;
}

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
  legend = false,
  animate = true,
  responsive = true,
  colors = DEFAULT_COLORS,
  tooltip = true,
  margin = { top: 20, right: 20, bottom: 30, left: 150 },
}: GanttChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 800;
  // Dynamically grow the chart height so every task gets a readable row;
  // the minimum stays at the consumer-supplied `height` to avoid collapse.
  const dynamicHeight = Math.max(height, tasks.length * 36 + margin.top + margin.bottom);
  const summary = {
    caption: title ? `${title} data summary` : 'Gantt chart data summary',
    headers: ['Task', 'Start', 'End', 'Progress'],
    rows: tasks.map((task) => [
      task.name,
      new Date(task.start).toISOString().slice(0, 10),
      new Date(task.end).toISOString().slice(0, 10),
      task.progress ?? 'N/A',
    ]),
  };

  useEffect(() => {
    if (!svgRef.current || !tasks || tasks.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = dynamicHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', dynamicHeight)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parsedTasks = tasks.map((t) => ({
      ...t,
      start: new Date(t.start),
      end: new Date(t.end),
    }));

    // scaleTime maps the full date span (earliest start -> latest end) to pixel
    // width; .nice() rounds the domain to tidy date boundaries (e.g. month start).
    const x = scaleTime()
      .domain([min(parsedTasks, (d) => d.start)!, max(parsedTasks, (d) => d.end)!])
      .range([0, innerWidth])
      .nice();

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
      .attr('fill', (d, i) => d.color ?? colors[i % colors.length])
      .attr('opacity', 0.25);

    if (chartPersonality.animate) {
      rects
        .attr('width', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 50)
        .attr('width', (d) => Math.max(0, x(d.end) - x(d.start)));
    } else {
      rects.attr('width', (d) => Math.max(0, x(d.end) - x(d.start)));
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
        .attr('fill', (d, i) => d.color ?? colors[i % colors.length]);

      if (chartPersonality.animate) {
        progressBars
          .attr('width', 0)
          .transition()
          .duration(chartPersonality.animationDuration)
          .delay((_, i) => i * 50)
          .attr('width', (d) => Math.max(0, (x(d.end) - x(d.start)) * ((d.progress ?? 0) / 100)));
      } else {
        progressBars.attr('width', (d) => Math.max(0, (x(d.end) - x(d.start)) * ((d.progress ?? 0) / 100)));
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
  }, [
    tasks,
    chartWidth,
    dynamicHeight,
    showProgress,
    showToday,
    chartPersonality.animate,
    chartPersonality.animationDuration,
    colors,
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
      ariaDescription={describeChart('Gantt chart', tasks.length, subtitle, showToday ? 'Includes a marker for today when it falls inside the visible date range.' : undefined)}
      summary={summary}
    />
  );
});
