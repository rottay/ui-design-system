'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps, Series } from '../types';
import { DEFAULT_COLORS, DEFAULT_MARGIN } from '../types';
import { useChartDimensions } from '../hooks';

export interface AreaChartProps extends ChartBaseProps {
  series: Series[];
  curved?: boolean;
  stacked?: boolean;
  opacity?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function AreaChart({
  series,
  curved = true,
  stacked = false,
  opacity = 0.3,
  xAxisLabel,
  yAxisLabel,
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
}: AreaChartProps) {
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
    const categories = [...new Set(allPoints.map((d) => String(d.x)))];

    const x = d3.scalePoint().domain(categories).range([0, innerWidth]);

    const yMax = stacked
      ? d3.max(categories, (cat) =>
          d3.sum(series, (s) => {
            const pt = s.data.find((d) => String(d.x) === cat);
            return pt?.y ?? 0;
          }),
        ) ?? 0
      : d3.max(allPoints, (d) => d.y) ?? 0;

    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .style('stroke', 'var(--ds-color-border-secondary)')
      .style('stroke-opacity', 0.5);
    const domainEl = g.selectAll('.grid .domain, g > .domain').node();
    if (domainEl) d3.select(domainEl).remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', 'var(--ds-color-text-secondary)')
      .style('font-size', '12px');

    const curveType = curved ? d3.curveMonotoneX : d3.curveLinear;

    if (stacked) {
      // Build stacked data
      const stackData = categories.map((cat) => {
        const row: Record<string, number | string> = { x: cat };
        series.forEach((s) => {
          const pt = s.data.find((d) => String(d.x) === cat);
          row[s.name] = pt?.y ?? 0;
        });
        return row;
      });

      const stack = d3
        .stack()
        .keys(series.map((s) => s.name))
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stacked = stack(stackData as any);

      stacked.forEach((layer, i) => {
        const color = series[i]?.color ?? colors[i % colors.length];

        const area = d3
          .area<any>()
          .x((d) => x(String(d.data.x)) ?? 0)
          .y0((d) => y(d[0]))
          .y1((d) => y(d[1]))
          .curve(curveType);

        g.append('path')
          .datum(layer)
          .attr('fill', color)
          .attr('fill-opacity', opacity)
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('d', area);
      });
    } else {
      series.forEach((s, i) => {
        const color = s.color ?? colors[i % colors.length];

        const area = d3
          .area<(typeof s.data)[0]>()
          .x((d) => x(String(d.x)) ?? 0)
          .y0(innerHeight)
          .y1((d) => y(d.y))
          .curve(curveType);

        const line = d3
          .line<(typeof s.data)[0]>()
          .x((d) => x(String(d.x)) ?? 0)
          .y((d) => y(d.y))
          .curve(curveType);

        g.append('path')
          .datum(s.data)
          .attr('fill', color)
          .attr('fill-opacity', opacity)
          .attr('d', area);

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

        if (tooltip) {
          g.selectAll(`.dot-area-${i}`)
            .data(s.data)
            .enter()
            .append('circle')
            .attr('cx', (d) => x(String(d.x)) ?? 0)
            .attr('cy', (d) => y(d.y))
            .attr('r', 3)
            .attr('fill', color)
            .attr('opacity', 0)
            .append('title')
            .text((d) => `${s.name}: ${d.y}`);
        }
      });
    }

    if (xAxisLabel) {
      svg.append('text').attr('x', chartWidth / 2).attr('y', chartHeight - 4).attr('text-anchor', 'middle').style('fill', 'var(--ds-color-text-secondary)').style('font-size', '12px').text(xAxisLabel);
    }
    if (yAxisLabel) {
      svg.append('text').attr('transform', 'rotate(-90)').attr('x', -chartHeight / 2).attr('y', 14).attr('text-anchor', 'middle').style('fill', 'var(--ds-color-text-secondary)').style('font-size', '12px').text(yAxisLabel);
    }

    svg.selectAll('.domain').style('stroke', 'var(--ds-color-border-primary)');
    svg.selectAll('.tick line').style('stroke', 'var(--ds-color-border-primary)');
  }, [series, chartWidth, chartHeight, curved, stacked, opacity, animate, colors, margin, tooltip, xAxisLabel, yAxisLabel]);

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
      {legend && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
          {series.map((s, i) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: s.color ?? colors[i % colors.length], opacity, display: 'inline-block' }} />
              <span style={{ color: 'var(--ds-color-text-secondary)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
