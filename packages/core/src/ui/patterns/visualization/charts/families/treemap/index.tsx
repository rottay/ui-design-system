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

import { memo, useEffect, useMemo, useRef } from 'react';
import { hierarchy, select, treemap } from 'd3';

import type {
  ChartBaseProps,
  ChartColorSchemeProps,
  ChartColorsProps,
  ChartLegendProps,
} from '../../contracts';
import { useChartDimensions, useChartPersonality } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';

/** A single node in the treemap hierarchy. Nested `children` create sub-groups. */
export interface TreeMapNode {
  name: string;
  value: number;
  children?: TreeMapNode[];
}

/** Props for the {@link TreeMap} component. */
export interface TreeMapProps
  extends ChartBaseProps, ChartLegendProps, ChartColorsProps, ChartColorSchemeProps {
  data: TreeMapNode[];
  showLabels?: boolean;
  padding?: number;
}

function normalizeTreeNode(node: TreeMapNode): TreeMapNode | null {
  const children = (node.children ?? [])
    .map(normalizeTreeNode)
    .filter((child): child is TreeMapNode => child !== null);
  const value = Number.isFinite(node.value) && node.value > 0 ? node.value : 0;
  if (children.length === 0 && value === 0) return null;
  return {
    ...node,
    value,
    ...(children.length > 0 ? { children } : { children: undefined }),
  };
}

function treeLeaves(nodes: readonly TreeMapNode[]): TreeMapNode[] {
  return nodes.flatMap((node) => node.children?.length
    ? treeLeaves(node.children)
    : [node]);
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
  const normalizedData = useMemo(
    () => data.map(normalizeTreeNode).filter((node): node is TreeMapNode => node !== null),
    [data],
  );
  const leavesForSummary = useMemo(() => treeLeaves(normalizedData), [normalizedData]);
  const summary = {
    caption: title ? `${title} data summary` : 'Treemap data summary',
    headers: ['Name', 'Value'],
    rows: leavesForSummary.map((item) => [item.name, item.value]),
  };
  const legendNode = legend ? (
    <div data-part="legend" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {normalizedData.map((d, i) => (
        <div key={d.name} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: palette[i % palette.length] ?? 'var(--ds-color-primary)', display: 'inline-block' }} />
          <span data-part="legend-label">{d.name}</span>
        </div>
      ))}
    </div>
  ) : null;

  useEffect(() => {
    const svgNode = svgRef.current;
    if (!svgNode) return;

    const svg = select(svgNode);
    svg.selectAll('*').interrupt().remove();
    if (normalizedData.length === 0) return;

    svg.attr('width', chartWidth).attr('height', chartHeight);

    // Wrap the flat data array in a synthetic root node so d3.hierarchy can
    // process it. Sort descending so the largest tiles appear top-left.
    const root = hierarchy<TreeMapNode>({ name: 'root', value: 0, children: normalizedData })
      .sum((d) => d.children?.length ? 0 : d.value)
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
      .attr('data-part', 'tile')
      .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

    // Tile rects are stroked with the background colour to create a visual gap
    // between adjacent tiles without relying on the treemap padding alone.
    const rects = nodes
      .append('rect')
      .attr('data-part', 'tile-surface')
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (_, i) => palette[i % palette.length] ?? 'var(--ds-color-primary)')
      .attr('rx', 3)
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
        .attr('data-part', 'tile-label')
        .attr('x', 4)
        .attr('y', 14)
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
        .attr('data-part', 'tile-value')
        .attr('x', 4)
        .attr('y', 26)
        .style('font-size', '10px')
        .style('pointer-events', 'none')
        .each(function (d: any) {
          const rectWidth = d.x1 - d.x0;
          if (rectWidth > 40 && d.y1 - d.y0 > 32) {
            select(this).text(d.value ?? '');
          }
      });
    }
    return () => {
      svg.selectAll('*').interrupt();
    };
  }, [
    normalizedData,
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
      className={['ds-chart-treemap', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Treemap'}
      ariaDescription={describeChart('Treemap', leavesForSummary.length, subtitle)}
      summary={summary}
      legend={legendNode}
    />
  );
});
