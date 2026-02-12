'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps } from '../types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../types';
import { useChartDimensions } from '../hooks';

export interface GanttTask {
  id: string;
  name: string;
  start: Date | string;
  end: Date | string;
  progress?: number;
  color?: string;
  group?: string;
}

export interface GanttChartProps extends ChartBaseProps {
  tasks: GanttTask[];
  showProgress?: boolean;
  showToday?: boolean;
}

export function GanttChart({
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
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 800;
  const dynamicHeight = Math.max(height, tasks.length * 36 + margin.top + margin.bottom);

  useEffect(() => {
    if (!svgRef.current || !tasks || tasks.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = dynamicHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', dynamicHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parsedTasks = tasks.map((t) => ({
      ...t,
      start: new Date(t.start),
      end: new Date(t.end),
    }));

    const x = d3
      .scaleTime()
      .domain([d3.min(parsedTasks, (d) => d.start)!, d3.max(parsedTasks, (d) => d.end)!])
      .range([0, innerWidth])
      .nice();

    const y = d3
      .scaleBand()
      .domain(parsedTasks.map((d) => d.id))
      .range([0, innerHeight])
      .padding(0.3);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '11px');

    // Task names
    g.append('g')
      .call(d3.axisLeft(y).tickFormat((id) => parsedTasks.find((t) => t.id === id)?.name ?? id))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    // Grid
    g.append('g')
      .call(d3.axisBottom(x).ticks(6).tickSize(innerHeight).tickFormat(() => ''))
      .attr('opacity', 0.15)
      .selectAll('line')
      .style('stroke', 'var(--ds-color-border-secondary)');
    g.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');

    // Bars
    const bars = g
      .selectAll('.task')
      .data(parsedTasks)
      .enter()
      .append('g')
      .attr('class', 'task');

    // Background bar
    const rects = bars
      .append('rect')
      .attr('x', (d) => x(d.start))
      .attr('y', (d) => y(d.id) ?? 0)
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', (d, i) => d.color ?? colors[i % colors.length])
      .attr('opacity', 0.25);

    if (animate) {
      rects
        .attr('width', 0)
        .transition()
        .duration(600)
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
        .attr('x', (d) => x(d.start))
        .attr('y', (d) => y(d.id) ?? 0)
        .attr('height', y.bandwidth())
        .attr('rx', 4)
        .attr('fill', (d, i) => d.color ?? colors[i % colors.length]);

      if (animate) {
        progressBars
          .attr('width', 0)
          .transition()
          .duration(600)
          .delay((_, i) => i * 50)
          .attr('width', (d) => Math.max(0, (x(d.end) - x(d.start)) * ((d.progress ?? 0) / 100)));
      } else {
        progressBars.attr('width', (d) => Math.max(0, (x(d.end) - x(d.start)) * ((d.progress ?? 0) / 100)));
      }
    }

    if (tooltip) {
      bars.append('title').text((d) => {
        const fmt = d3.timeFormat('%b %d, %Y');
        const progress = d.progress != null ? ` (${d.progress}%)` : '';
        return `${d.name}: ${fmt(d.start)} - ${fmt(d.end)}${progress}`;
      });
    }

    // Today line
    if (showToday) {
      const now = new Date();
      if (now >= x.domain()[0] && now <= x.domain()[1]) {
        g.append('line')
          .attr('x1', x(now))
          .attr('x2', x(now))
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', 'var(--ds-color-error-500)')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3');

        g.append('text')
          .attr('x', x(now))
          .attr('y', -6)
          .attr('text-anchor', 'middle')
          .style('fill', 'var(--ds-color-error-500)')
          .style('font-size', '10px')
          .text('Today');
      }
    }

    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [tasks, chartWidth, dynamicHeight, showProgress, showToday, animate, colors, margin, tooltip]);

  if (loading) {
    return (
      <div ref={containerRef} className={className} style={{ width: width ?? '100%', height, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ds-color-text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ width: width ?? '100%', ...style }}>
      {title && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ds-color-text-primary)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: 'var(--ds-color-text-secondary)' }}>{subtitle}</div>}
        </div>
      )}
      <svg ref={svgRef} />
    </div>
  );
}
