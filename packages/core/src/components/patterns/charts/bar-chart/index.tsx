'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps, DataPoint, Series } from '../types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../types';
import { useChartDimensions } from '../hooks';

export interface BarChartProps extends ChartBaseProps {
  data: DataPoint[];
  orientation?: 'vertical' | 'horizontal';
  stacked?: boolean;
  grouped?: boolean;
  series?: Series[];
  barRadius?: number;
  barGap?: number;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function BarChart({
  data,
  orientation = 'vertical',
  stacked = false,
  grouped = false,
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
  animate = true,
  responsive = true,
  colors = DEFAULT_COLORS,
  tooltip = true,
  margin = DEFAULT_MARGIN,
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (orientation === 'vertical') {
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, innerWidth])
        .padding(barGap);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) ?? 0])
        .nice()
        .range([innerHeight, 0]);

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px');

      // Y axis
      g.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px');

      // Grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
        .selectAll('line')
        .style('stroke', 'var(--ds-color-border-secondary)')
        .style('stroke-opacity', 0.5);

      g.selectAll('.grid .domain').remove();

      // Bars
      const bars = g
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.label) ?? 0)
        .attr('width', x.bandwidth())
        .attr('rx', barRadius)
        .attr('ry', barRadius)
        .attr('fill', (d, i) => d.color ?? colors[i % colors.length]);

      if (tooltip) {
        bars.append('title').text((d) => `${d.label}: ${d.value}`);
      }

      if (animate) {
        bars
          .attr('y', innerHeight)
          .attr('height', 0)
          .transition()
          .duration(800)
          .delay((_, i) => i * 50)
          .attr('y', (d) => y(d.value))
          .attr('height', (d) => innerHeight - y(d.value));
      } else {
        bars.attr('y', (d) => y(d.value)).attr('height', (d) => innerHeight - y(d.value));
      }

      // Values
      if (showValues) {
        g.selectAll('.value')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'value')
          .attr('x', (d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
          .attr('y', (d) => y(d.value) - 5)
          .attr('text-anchor', 'middle')
          .style('fill', 'var(--ds-color-text-primary)')
          .style('font-size', '11px')
          .text((d) => d.value);
      }
    } else {
      // Horizontal orientation
      const y = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([0, innerHeight])
        .padding(barGap);

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) ?? 0])
        .nice()
        .range([0, innerWidth]);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll('text')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px');

      g.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px');

      const bars = g
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', (d) => y(d.label) ?? 0)
        .attr('height', y.bandwidth())
        .attr('rx', barRadius)
        .attr('ry', barRadius)
        .attr('fill', (d, i) => d.color ?? colors[i % colors.length]);

      if (tooltip) {
        bars.append('title').text((d) => `${d.label}: ${d.value}`);
      }

      if (animate) {
        bars
          .attr('x', 0)
          .attr('width', 0)
          .transition()
          .duration(800)
          .delay((_, i) => i * 50)
          .attr('width', (d) => x(d.value));
      } else {
        bars.attr('x', 0).attr('width', (d) => x(d.value));
      }

      if (showValues) {
        g.selectAll('.value')
          .data(data)
          .enter()
          .append('text')
          .attr('class', 'value')
          .attr('x', (d) => x(d.value) + 5)
          .attr('y', (d) => (y(d.label) ?? 0) + y.bandwidth() / 2)
          .attr('dominant-baseline', 'middle')
          .style('fill', 'var(--ds-color-text-primary)')
          .style('font-size', '11px')
          .text((d) => d.value);
      }
    }

    // Axis labels
    if (xAxisLabel) {
      svg
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight - 4)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', 14)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--ds-color-text-secondary)')
        .style('font-size', '12px')
        .text(yAxisLabel);
    }

    // Style axis lines
    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [data, chartWidth, chartHeight, orientation, barRadius, barGap, showValues, animate, colors, margin, tooltip, xAxisLabel, yAxisLabel]);

  if (loading) {
    return (
      <div ref={containerRef} className={className} style={{ width: width ?? '100%', height, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ds-color-text-secondary)' }}>
          Loading...
        </div>
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
      {legend && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
          {data.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: d.color ?? colors[i % colors.length], display: 'inline-block' }} />
              <span style={{ color: 'var(--ds-color-text-secondary)' }}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
