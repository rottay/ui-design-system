'use client';

/**
 * @fileoverview NetworkGraph -- D3 force-directed graph using `forceSimulation` with four
 * cooperating forces: `forceLink` (spring-like edge attraction), `forceManyBody` (electrostatic
 * node repulsion at -200 strength), `forceCenter` (gravity toward the viewport centre), and
 * `forceCollide` (radius-based overlap prevention). Nodes are draggable via `d3.drag()`.
 * When animation is disabled the simulation is fast-forwarded 300 ticks synchronously to reach
 * a settled layout without visual motion.
 *
 * @example
 * <NetworkGraph
 *   nodes={[
 *     { id: 'a', label: 'Auth', group: 'core' },
 *     { id: 'b', label: 'Users', group: 'core' },
 *     { id: 'c', label: 'Billing', group: 'payments' },
 *   ]}
 *   links={[
 *     { source: 'a', target: 'b' },
 *     { source: 'b', target: 'c', value: 3 },
 *   ]}
 *   directed
 *   height={500}
 *   title="Service Dependencies"
 * />
 */

import { memo, useEffect, useRef } from 'react';
import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  type SimulationNodeDatum,
} from 'd3';

import type { ChartBaseProps } from '../Charts.types';
import { DEFAULT_COLORS } from '../Charts.types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

/** A node in the network graph. `group` drives automatic colour assignment. */
export interface NetworkNode {
  id: string;
  label?: string;
  color?: string;
  size?: number;
  group?: string;
}

/** An edge connecting two nodes. `value` scales the stroke width (defaults to 1). */
export interface NetworkLink {
  source: string;
  target: string;
  value?: number;
  label?: string;
}

/** Props for the {@link NetworkGraph} component. */
export interface NetworkGraphProps extends ChartBaseProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  directed?: boolean;
}

/**
 * Renders a force-directed network graph with draggable nodes and optional directed edges.
 *
 * @param props - See {@link NetworkGraphProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped SVG with accessible summary table and optional legend.
 */
export const NetworkGraph = memo(function NetworkGraph({
  nodes,
  links,
  directed = false,
  width,
  height = 500,
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
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const summary = {
    caption: title ? `${title} data summary` : 'Network graph data summary',
    headers: ['Kind', 'Primary', 'Secondary'],
    rows: [
      ...nodes.map((node) => ['Node', node.label ?? node.id, node.group ?? '']),
      ...links.map((link) => ['Link', link.source, link.target]),
    ],
  };

  useEffect(() => {
    if (!svgRef.current || !nodes || nodes.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', chartWidth).attr('height', chartHeight).attr('data-variant', directed ? 'directed' : 'undirected');

    // Stable group-to-colour mapping: groups are collected in insertion order
    // so the same group always maps to the same palette index across renders.
    const groups = [...new Set(nodes.map((n) => n.group).filter(Boolean))] as string[];
    const groupColor = (group?: string) => {
      if (!group) return colors[0];
      const idx = groups.indexOf(group);
      return colors[idx % colors.length];
    };

    // SVG marker definition for directed edge arrows. refX=20 offsets the tip
    // so it does not overlap the target node's circle (radius ~8px + padding).
    if (directed) {
      svg
        .append('defs')
        .attr('data-part', 'definitions')
        .append('marker')
        .attr('data-part', 'edge-marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('data-part', 'edge-marker-path')
        .attr('d', 'M0,-5L10,0L0,5');
    }

    // Clone input data so D3's simulation can mutate x/y/vx/vy without side
    // effects on the consumer's data structures.
    const simNodes: (NetworkNode & SimulationNodeDatum)[] = nodes.map((n) => ({ ...n }));
    const simLinks = links.map((l) => ({ ...l }));

    // Four forces cooperate: links pull connected nodes together, charge
    // pushes all nodes apart (like electrons), center keeps the graph from
    // drifting off-screen, and collision prevents node overlap.
    const simulation = forceSimulation(simNodes as any)
      .force(
        'link',
        forceLink(simLinks as any)
          .id((d: any) => d.id)
          .distance(80),
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(chartWidth / 2, chartHeight / 2))
      .force('collision', forceCollide().radius(20));

    const linkElements = svg
      .selectAll('.link')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('data-part', 'edge')
      .attr('data-state', 'idle')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value ?? 1));

    if (directed) {
      linkElements.attr('marker-end', 'url(#arrow)');
    }

    // Drag behaviour: on start, fix the node in place and reheat the simulation
    // (alphaTarget > 0). On end, release the node (fx/fy = null) and cool down.
    const nodeElements = svg
      .selectAll('.node')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('data-part', 'node')
      .attr('data-state', 'idle')
      .call(
        drag<SVGGElement, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any,
      );

    nodeElements
      .append('circle')
      .attr('data-part', 'node-mark')
      .attr('r', (d) => d.size ?? 8)
      .attr('fill', (d) => d.color ?? groupColor(d.group))
      .attr('stroke-width', 2);

    if (chartPersonality.tooltip) {
      nodeElements.append('title').text((d) => d.label ?? d.id);
    }

    // Labels
    nodeElements
      .append('text')
      .attr('data-part', 'node-label')
      .attr('dx', 12)
      .attr('dy', 4)
      .style('font-size', '11px')
      .style('pointer-events', 'none')
      .text((d) => d.label ?? d.id);

    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // When animation is disabled, run the simulation synchronously to its
    // settled position (300 ticks is enough for most graph topologies).
    if (!chartPersonality.animate) {
      simulation.stop();
      for (let i = 0; i < 300; i++) simulation.tick();
      simulation.on('tick', null);

      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, chartWidth, chartHeight, directed, chartPersonality.animate, colors, chartPersonality.tooltip]);

  const groups = [...new Set(nodes.map((n) => n.group).filter(Boolean))] as string[];
  const legendNode = legend && groups.length > 0 ? (
    <div data-part="legend" data-variant={directed ? 'directed' : 'undirected'} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {groups.map((group, i) => (
        <div key={group} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: colors[i % colors.length], display: 'inline-block' }} />
          <span data-part="legend-label">{group}</span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <ChartScaffold
      containerRef={containerRef}
      svgRef={svgRef}
      width={width}
      height={height}
      className={['ds-chart-network-graph', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Network graph'}
      ariaDescription={describeChart('Network graph', nodes.length + links.length, subtitle, directed ? 'Directed edges are shown with arrows.' : undefined)}
      summary={summary}
      legend={legendNode}
    />
  );
});
