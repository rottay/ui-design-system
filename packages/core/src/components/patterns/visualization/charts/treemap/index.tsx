'use client';

/**
 * @fileoverview TreeMap -- D3-backed hierarchical treemap using `d3.treemap()` with the default
 * squarified tiling algorithm. Input is a flat array of nodes wrapped in a synthetic root via
 * `d3.hierarchy()`. Leaf tiles are sorted descending by value so the largest appear top-left.
 * Labels are conditionally rendered only when a tile exceeds minimum width/height thresholds
 * to prevent illegible clipped text.
 *
 * @example
 * <TreeMap
 *   data={[
 *     { name: 'Engineering', value: 45 },
 *     { name: 'Design', value: 20 },
 *     { name: 'Marketing', value: 15 },
 *     { name: 'Sales', value: 20 },
 *   ]}
 *   showLabels
 *   height={350}
 *   title="Team Allocation"
 * />
 */

import { memo, useEffect, useRef } from 'react';
import { hierarchy, select, treemap } from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** A single node in the treemap hierarchy. Nested `children` create sub-groups. */
export interface TreeMapNode {
  name: string;
  value: number;
  children?: TreeMapNode[];
}

/** Props for the {@link TreeMap} component. */
export interface TreeMapProps extends ChartBaseProps {
  data: TreeMapNode[];
  showLabels?: boolean;
  padding?: number;
}

/**
 * Renders a hierarchical treemap using D3's squarified tiling layout.
 *
 * @param props - See {@link TreeMapProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const TreeMap = memo(function TreeMap({
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
  colors,
  colorScheme,
  tooltip = true,
}: TreeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip, colorScheme });
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const summary = {
    caption: title ? `${title} data summary` : 'Treemap data summary',
    headers: ['Name', 'Value'],
    rows: data.map((item) => [item.name, item.value]),
  };
  const legendNode = legend ? (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {data.map((d, i) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: palette[i % palette.length], display: 'inline-block' }} />
          <span style={{ color: 'var(--ds-color-text-secondary)' }}>{d.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', chartWidth).attr('height', chartHeight);

    // Wrap the flat data array in a synthetic root node so d3.hierarchy can
    // process it. Sort descending so the largest tiles appear top-left.
    const root = hierarchy<TreeMapNode>({ name: 'root', value: 0, children: data })
      .sum((d) => d.value)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    treemap<TreeMapNode>().size([chartWidth, chartHeight]).padding(padding).round(true)(root);

    const leaves = root.leaves();

    // Each leaf is rendered as a <g> translated to its top-left corner (x0, y0).
    // This local coordinate system simplifies child positioning (rect + text).
    const nodes = svg
      .selectAll('.node')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Tile rects are stroked with the background colour to create a visual gap
    // between adjacent tiles without relying on the treemap padding alone.
    const rects = nodes
      .append('rect')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (_, i) => palette[i % palette.length])
      .attr('rx', 3)
      .attr('stroke', 'var(--ds-color-bg-primary)')
      .attr('stroke-width', 1);

    if (chartPersonality.animate) {
      rects
        .attr('opacity', 0)
        .transition()
        .duration(chartPersonality.animationDuration)
        .delay((_, i) => i * 30)
        .attr('opacity', 1);
    }

    if (chartPersonality.tooltip) {
      rects.append('title').text((d) => `${d.data.name}: ${d.value}`);
    }

    if (showLabels) {
      // Labels are only rendered when the tile is large enough to be legible;
      // small tiles would just show clipped text that hurts readability.
      nodes
        .append('text')
        .attr('x', 4)
        .attr('y', 14)
        .style('fill', 'var(--ds-color-text-on-primary, var(--ds-color-white))')
        .style('font-size', '11px')
        .style('font-weight', '500')
        .style('pointer-events', 'none')
        .each(function (d: any) {
          const rectWidth = d.x1 - d.x0;
          const text = select(this);
          if (rectWidth > 40 && d.y1 - d.y0 > 20) {
            text.text(d.data.name);
          }
        });

      nodes
        .append('text')
        .attr('x', 4)
        .attr('y', 26)
        .style('fill', 'color-mix(in srgb, var(--ds-color-text-on-primary, var(--ds-color-white)) 70%, transparent)')
        .style('font-size', '10px')
        .style('pointer-events', 'none')
        .each(function (d: any) {
          const rectWidth = d.x1 - d.x0;
          if (rectWidth > 40 && d.y1 - d.y0 > 32) {
            select(this).text(d.value ?? '');
          }
        });
    }
  }, [
    data,
    chartWidth,
    chartHeight,
    showLabels,
    padding,
    chartPersonality.animate,
    chartPersonality.animationDuration,
    palette,
    chartPersonality.tooltip,
  ]);

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Treemap'}
      ariaDescription={describeChart('Treemap', data.length, subtitle)}
      summary={summary}
      legend={legendNode}
    />
  );
});
