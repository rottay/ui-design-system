'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps, DataPoint } from '../types';
import { DEFAULT_COLORS } from '../types';
import { useChartDimensions } from '../hooks';

export interface PieChartProps extends ChartBaseProps {
  data: DataPoint[];
  donut?: boolean;
  innerRadius?: number;
  showLabels?: boolean;
  showPercentage?: boolean;
}

export function PieChart({
  data,
  donut = false,
  innerRadius = 0.6,
  showLabels = true,
  showPercentage = false,
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
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 400;
  const chartHeight = height;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
    const inner = donut ? radius * innerRadius : 0;

    const g = svg
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .append('g')
      .attr('transform', `translate(${chartWidth / 2},${chartHeight / 2})`);

    const pie = d3
      .pie<DataPoint>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(inner)
      .outerRadius(radius);

    const labelArc = d3
      .arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const total = d3.sum(data, (d) => d.value);

    const slices = g
      .selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    const paths = slices
      .append('path')
      .attr('fill', (d, i) => d.data.color ?? colors[i % colors.length])
      .attr('stroke', 'var(--ds-color-bg-primary)')
      .attr('stroke-width', 2);

    if (tooltip) {
      paths.append('title').text((d) => {
        const pct = ((d.data.value / total) * 100).toFixed(1);
        return `${d.data.label}: ${d.data.value} (${pct}%)`;
      });
    }

    if (animate) {
      paths
        .transition()
        .duration(800)
        .attrTween('d', (d) => {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return (t) => arc(interpolate(t) as d3.PieArcDatum<DataPoint>) ?? '';
        });
    } else {
      paths.attr('d', arc);
    }

    // Labels
    if (showLabels) {
      slices
        .append('text')
        .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', 'var(--ds-color-text-primary)')
        .style('font-size', '11px')
        .style('pointer-events', 'none')
        .text((d) => {
          if (showPercentage) {
            return `${((d.data.value / total) * 100).toFixed(0)}%`;
          }
          return d.data.label;
        });
    }
  }, [data, chartWidth, chartHeight, donut, innerRadius, showLabels, showPercentage, animate, colors, tooltip]);

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
        <div style={{ marginBottom: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ds-color-text-primary)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: 'var(--ds-color-text-secondary)' }}>{subtitle}</div>}
        </div>
      )}
      <svg ref={svgRef} />
      {legend && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
          {data.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: d.color ?? colors[i % colors.length], display: 'inline-block' }} />
              <span style={{ color: 'var(--ds-color-text-secondary)' }}>{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
