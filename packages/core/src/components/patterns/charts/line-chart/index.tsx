'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps, Series } from '../types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../types';
import { useChartDimensions } from '../hooks';

export interface LineChartProps extends ChartBaseProps {
  series: Series[];
  curved?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xType?: 'category' | 'time' | 'linear';
}

export function LineChart({
  series,
  curved = true,
  showDots = true,
  showArea = false,
  xAxisLabel,
  yAxisLabel,
  xType = 'category',
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
  margin = DEFAULT_MARGIN,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;

  useEffect(() => {
    if (!svgRef.current || !series || series.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const allPoints = series.flatMap((s) => s.data);

    // X scale
    let x: d3.ScalePoint<string> | d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>;

    if (xType === 'time') {
      x = d3
        .scaleTime()
        .domain(d3.extent(allPoints, (d) => new Date(d.x as string | number | Date)) as [Date, Date])
        .range([0, innerWidth]);
    } else if (xType === 'linear') {
      x = d3
        .scaleLinear()
        .domain(d3.extent(allPoints, (d) => d.x as number) as [number, number])
        .range([0, innerWidth]);
    } else {
      const categories = [...new Set(allPoints.map((d) => String(d.x)))];
      x = d3.scalePoint().domain(categories).range([0, innerWidth]);
    }

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(allPoints, (d) => d.y) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .style('stroke', 'var(--ds-color-border-secondary)')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.domain').node();
    if (domainEl) d3.select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x as any).ticks(6))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    const getX = (d: (typeof allPoints)[0]): number => {
      if (xType === 'time') return (x as d3.ScaleTime<number, number>)(new Date(d.x as string | number | Date));
      if (xType === 'linear') return (x as d3.ScaleLinear<number, number>)(d.x as number);
      return (x as d3.ScalePoint<string>)(String(d.x)) ?? 0;
    };

    const curveType = curved ? d3.curveMonotoneX : d3.curveLinear;

    series.forEach((s, i) => {
      const color = s.color ?? colors[i % colors.length];

      // Area
      if (showArea) {
        const area = d3
          .area<(typeof s.data)[0]>()
          .x((d) => getX(d))
          .y0(innerHeight)
          .y1((d) => y(d.y))
          .curve(curveType);

        g.append('path')
          .datum(s.data)
          .attr('fill', color)
          .attr('fill-opacity', 0.15)
          .attr('d', area);
      }

      // Line
      const line = d3
        .line<(typeof s.data)[0]>()
        .x((d) => getX(d))
        .y((d) => y(d.y))
        .curve(curveType);

      const path = g
        .append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      if (animate) {
        const totalLength = (path.node() as SVGPathElement)?.getTotalLength() ?? 0;
        path
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1000)
          .attr('stroke-dashoffset', 0);
      }

      // Dots
      if (showDots) {
        const dots = g
          .selectAll(`.dot-${i}`)
          .data(s.data)
          .enter()
          .append('circle')
          .attr('cx', (d) => getX(d))
          .attr('cy', (d) => y(d.y))
          .attr('r', 4)
          .attr('fill', color)
          .attr('stroke', 'var(--ds-color-bg-primary)')
          .attr('stroke-width', 2);

        if (tooltip) {
          dots.append('title').text((d) => `${s.name}: ${d.y}`);
        }
      }
    });

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

    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [series, chartWidth, chartHeight, curved, showDots, showArea, xType, animate, colors, margin, tooltip, xAxisLabel, yAxisLabel]);

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
          {series.map((s, i) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 12, height: 3, backgroundColor: s.color ?? colors[i % colors.length], display: 'inline-block', borderRadius: 1 }} />
              <span style={{ color: 'var(--ds-color-text-secondary)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
