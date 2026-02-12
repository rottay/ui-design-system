'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { ChartBaseProps } from '../types';
import { DEFAULT_COLORS } from '../types';
import { useChartDimensions } from '../hooks';

export interface TreeMapNode {
  name: string;
  value: number;
  children?: TreeMapNode[];
}

export interface TreeMapProps extends ChartBaseProps {
  data: TreeMapNode[];
  showLabels?: boolean;
  padding?: number;
}

export function TreeMap({
  data,
  showLabels = true,
  padding = 2,
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
}: TreeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', chartWidth).attr('height', chartHeight);

    const root = d3
      .hierarchy<TreeMapNode>({ name: 'root', value: 0, children: data })
      .sum((d) => d.value)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.treemap<TreeMapNode>().size([chartWidth, chartHeight]).padding(padding).round(true)(root);

    const leaves = root.leaves();

    const nodes = svg
      .selectAll('.node')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    const rects = nodes
      .append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (_, i) => colors[i % colors.length])
      .attr('rx', 3)
      .attr('stroke', 'var(--ds-color-bg-primary)')
      .attr('stroke-width', 1);

    if (animate) {
      rects.attr('opacity', 0).transition().duration(600).delay((_, i) => i * 30).attr('opacity', 1);
    }

    if (tooltip) {
      rects.append('title').text((d) => `${d.data.name}: ${d.value}`);
    }

    if (showLabels) {
      nodes
        .append('text')
        .attr('x', 4)
        .attr('y', 14)
        .style('fill', '#fff')
        .style('font-size', '11px')
        .style('font-weight', '500')
        .style('pointer-events', 'none')
        .each(function (d: any) {
          const rectWidth = d.x1 - d.x0;
          const text = d3.select(this);
          if (rectWidth > 40 && d.y1 - d.y0 > 20) {
            text.text(d.data.name);
          }
        });

      nodes
        .append('text')
        .attr('x', 4)
        .attr('y', 26)
        .style('fill', 'rgba(255,255,255,0.7)')
        .style('font-size', '10px')
        .style('pointer-events', 'none')
        .each(function (d: any) {
          const rectWidth = d.x1 - d.x0;
          if (rectWidth > 40 && d.y1 - d.y0 > 32) {
            d3.select(this).text(d.value ?? '');
          }
        });
    }
  }, [data, chartWidth, chartHeight, showLabels, padding, animate, colors, tooltip]);

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
          {data.map((d, i) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: colors[i % colors.length], display: 'inline-block' }} />
              <span style={{ color: 'var(--ds-color-text-secondary)' }}>{d.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
