'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps } from '../types';
import { DEFAULT_MARGIN } from '../types';
import { useChartDimensions } from '../hooks';

export interface HeatMapProps extends ChartBaseProps {
  data: { x: string; y: string; value: number }[];
  xLabels?: string[];
  yLabels?: string[];
  colorRange?: [string, string];
  cellRadius?: number;
}

export function HeatMap({
  data,
  xLabels: xLabelsProp,
  yLabels: yLabelsProp,
  colorRange = ['#e0f2fe', 'var(--ds-color-primary-500)'],
  cellRadius = 2,
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
  tooltip = true,
  margin = { top: 20, right: 20, bottom: 60, left: 80 },
}: HeatMapProps) {
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

    const xLabels = xLabelsProp ?? [...new Set(data.map((d) => d.x))];
    const yLabels = yLabelsProp ?? [...new Set(data.map((d) => d.y))];

    const x = d3.scaleBand().domain(xLabels).range([0, innerWidth]).padding(0.05);
    const y = d3.scaleBand().domain(yLabels).range([0, innerHeight]).padding(0.05);

    const [minVal, maxVal] = d3.extent(data, (d) => d.value) as [number, number];
    const colorScale = d3.scaleSequential().domain([minVal, maxVal]).interpolator(d3.interpolateRgb(colorRange[0], colorRange[1]));

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end');

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '11px');

    const cells = g
      .selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => x(d.x) ?? 0)
      .attr('y', (d) => y(d.y) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', cellRadius)
      .attr('fill', (d) => colorScale(d.value));

    if (animate) {
      cells.attr('opacity', 0).transition().duration(500).delay((_, i) => i * 10).attr('opacity', 1);
    }

    if (tooltip) {
      cells.append('title').text((d) => `${d.x}, ${d.y}: ${d.value}`);
    }

    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [data, chartWidth, chartHeight, xLabelsProp, yLabelsProp, colorRange, cellRadius, animate, tooltip, margin]);

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
