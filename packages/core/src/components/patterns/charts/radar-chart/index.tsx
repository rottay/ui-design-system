'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps } from '../types';
import { DEFAULT_COLORS } from '../types';
import { useChartDimensions } from '../hooks';

export interface RadarChartProps extends ChartBaseProps {
  data: { axis: string; value: number }[];
  series?: { name: string; data: { axis: string; value: number }[]; color?: string }[];
  maxValue?: number;
  levels?: number;
  showLabels?: boolean;
}

export function RadarChart({
  data,
  series,
  maxValue: maxValueProp,
  levels = 5,
  showLabels = true,
  width,
  height = 400,
  className,
  style,
  loading = false,
  title,
  subtitle,
  legend = true,
  animate = true,
  responsive = true,
  colors = DEFAULT_COLORS,
  tooltip = true,
}: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 400;
  const chartHeight = height;

  useEffect(() => {
    if (!svgRef.current) return;

    const allSeries = series ?? [{ name: 'Data', data, color: colors[0] }];
    if (allSeries.length === 0) return;

    const axes = allSeries[0].data.map((d) => d.axis);
    const n = axes.length;
    if (n === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(chartWidth, chartHeight) / 2 - 40;
    const maxValue = maxValueProp ?? d3.max(allSeries.flatMap((s) => s.data.map((d) => d.value))) ?? 1;
    const angleSlice = (2 * Math.PI) / n;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`);

    const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    // Grid levels
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      const points = axes.map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number];
      });

      g.append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', 'var(--ds-color-border-secondary)')
        .attr('stroke-opacity', 0.5);
    }

    // Axis lines
    axes.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', radius * Math.cos(angle))
        .attr('y2', radius * Math.sin(angle))
        .attr('stroke', 'var(--ds-color-border-secondary)')
        .attr('stroke-opacity', 0.5);
    });

    // Axis labels
    if (showLabels) {
      axes.forEach((axis, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelR = radius + 18;
        g.append('text')
          .attr('x', labelR * Math.cos(angle))
          .attr('y', labelR * Math.sin(angle))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('fill', 'var(--ds-color-text-secondary)')
          .style('font-size', '11px')
          .text(axis);
      });
    }

    // Data polygons
    allSeries.forEach((s, si) => {
      const color = s.color ?? colors[si % colors.length];
      const points = s.data.map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = rScale(d.value);
        return [r * Math.cos(angle), r * Math.sin(angle)] as [number, number];
      });

      const polygon = g
        .append('polygon')
        .attr('points', points.map((p) => p.join(',')).join(' '))
        .attr('fill', color)
        .attr('fill-opacity', 0.2)
        .attr('stroke', color)
        .attr('stroke-width', 2);

      if (animate) {
        polygon
          .attr('opacity', 0)
          .transition()
          .duration(600)
          .delay(si * 150)
          .attr('opacity', 1);
      }

      // Dots
      s.data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = rScale(d.value);
        const dot = g
          .append('circle')
          .attr('cx', r * Math.cos(angle))
          .attr('cy', r * Math.sin(angle))
          .attr('r', 3.5)
          .attr('fill', color)
          .attr('stroke', 'var(--ds-color-bg-primary)')
          .attr('stroke-width', 1.5);

        if (tooltip) {
          dot.append('title').text(`${d.axis}: ${d.value}`);
        }
      });
    });
  }, [data, series, chartWidth, chartHeight, maxValueProp, levels, showLabels, animate, colors, tooltip]);

  if (loading) {
    return (
      <div ref={containerRef} className={className} style={{ width: width ?? '100%', height, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ds-color-text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  const allSeries = series ?? [{ name: 'Data', data, color: colors[0] }];

  return (
    <div ref={containerRef} className={className} style={{ width: width ?? '100%', ...style }}>
      {title && (
        <div style={{ marginBottom: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ds-color-text-primary)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: 'var(--ds-color-text-secondary)' }}>{subtitle}</div>}
        </div>
      )}
      <svg ref={svgRef} />
      {legend && allSeries.length > 1 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
          {allSeries.map((s, i) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: s.color ?? colors[i % colors.length], display: 'inline-block' }} />
              <span style={{ color: 'var(--ds-color-text-secondary)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
