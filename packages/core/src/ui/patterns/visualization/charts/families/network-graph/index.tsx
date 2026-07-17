'use client';

/**
 * @fileoverview NetworkGraph -- D3 force-directed graph using `forceSimulation` with four
 * cooperating forces: `forceLink` (spring-like edge attraction), `forceManyBody` (electrostatic
 * node repulsion at -200 strength), `forceCenter` (gravity toward the viewport centre), and
 * `forceCollide` (radius-based overlap prevention). Nodes are draggable via `d3.drag()`.
 * When animation is disabled the simulation uses a calibrated, bounded synchronous pass to reach
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

import { memo, useEffect, useId, useMemo, useRef } from 'react';
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

import type { ChartBaseProps, ChartColorsProps, ChartLegendProps } from '../../contracts';
import { useChartDimensions, useChartPersonality } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';

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
export interface NetworkGraphProps extends ChartBaseProps, ChartLegendProps, ChartColorsProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  directed?: boolean;
}

type NetworkSimulationNode = NetworkNode & SimulationNodeDatum;

interface NetworkPosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

type NetworkDataValidation =
  | {
      ok: true;
      nodes: NetworkNode[];
      links: NetworkLink[];
    }
  | {
      ok: false;
      code: 'INVALID_DATA';
      message: string;
    };

const STATIC_LAYOUT_TICKS = 120;
const NETWORK_INVALID_DATA_MESSAGE = 'The network data contains invalid nodes or links.';

/** Reject malformed topology and geometry before D3 can mutate its simulation copies. */
function validateNetworkData(
  nodes: NetworkNode[] | null | undefined,
  links: NetworkLink[] | null | undefined,
): NetworkDataValidation {
  if (!Array.isArray(nodes) || !Array.isArray(links)) {
    return { ok: false, code: 'INVALID_DATA', message: NETWORK_INVALID_DATA_MESSAGE };
  }

  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (
      !node
      || typeof node.id !== 'string'
      || node.id.trim().length === 0
      || nodeIds.has(node.id)
      || (node.size !== undefined && (!Number.isFinite(node.size) || node.size <= 0))
    ) {
      return { ok: false, code: 'INVALID_DATA', message: NETWORK_INVALID_DATA_MESSAGE };
    }
    nodeIds.add(node.id);
  }

  for (const link of links) {
    if (
      !link
      || typeof link.source !== 'string'
      || typeof link.target !== 'string'
      || !nodeIds.has(link.source)
      || !nodeIds.has(link.target)
      || (link.value !== undefined && (!Number.isFinite(link.value) || link.value <= 0))
    ) {
      return { ok: false, code: 'INVALID_DATA', message: NETWORK_INVALID_DATA_MESSAGE };
    }
  }

  return { ok: true, nodes, links };
}

function finiteCoordinate(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? value! : fallback;
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
  colors,
  tooltip = true,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const positionsRef = useRef(new Map<string, NetworkPosition>());
  const instanceId = useId();
  const instanceToken = instanceId.replace(/[^a-zA-Z0-9_-]/g, '');
  const definitionsId = `network-definitions-${instanceToken}`;
  const markerId = `network-arrow-${instanceToken}`;
  const { containerRef, dimensions } = useChartDimensions(width, height);
  const chartPersonality = useChartPersonality({ animate, tooltip });
  const chartWidth = responsive ? dimensions.width : typeof width === 'number' ? width : 600;
  const chartHeight = height;
  const validation = useMemo(() => validateNetworkData(nodes, links), [nodes, links]);
  const graphNodes = validation.ok ? validation.nodes : [];
  const graphLinks = validation.ok ? validation.links : [];
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const summary = {
    caption: title ? `${title} data summary` : 'Network graph data summary',
    headers: ['Kind', 'Primary', 'Secondary'],
    rows: [
      ...graphNodes.map((node) => ['Node', node.label ?? node.id, node.group ?? '']),
      ...graphLinks.map((link) => ['Link', link.source, link.target]),
    ],
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll('*').interrupt();
    svg.selectAll('*').remove();

    if (!validation.ok || graphNodes.length === 0) {
      positionsRef.current.clear();
      return () => {
        svg.selectAll('*').interrupt();
        svg.selectAll('*').remove();
      };
    }

    const knownNodeIds = new Set(graphNodes.map((node) => node.id));
    for (const storedId of positionsRef.current.keys()) {
      if (!knownNodeIds.has(storedId)) positionsRef.current.delete(storedId);
    }

    svg.attr('width', chartWidth).attr('height', chartHeight).attr('data-variant', directed ? 'directed' : 'undirected');

    // Stable group-to-colour mapping: groups are collected in insertion order
    // so the same group always maps to the same palette index across renders.
    const groups = [...new Set(graphNodes.map((n) => n.group).filter(Boolean))] as string[];
    const groupColor = (group?: string) => {
      if (!group) return palette[0];
      const idx = groups.indexOf(group);
      return palette[idx % palette.length];
    };

    // SVG marker definition for directed edge arrows. refX=20 offsets the tip
    // so it does not overlap the target node's circle (radius ~8px + padding).
    if (directed) {
      svg
        .append('defs')
        .attr('data-part', 'definitions')
        .attr('id', definitionsId)
        .append('marker')
        .attr('data-part', 'edge-marker')
        .attr('id', markerId)
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
    const simNodes: NetworkSimulationNode[] = graphNodes.map((node) => ({
      ...node,
      ...positionsRef.current.get(node.id),
    }));
    const simLinks = graphLinks.map((link) => ({ ...link }));

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
      .attr('stroke-width', (d: any) => (
        Number.isFinite(d.value) && d.value > 0 ? Math.sqrt(d.value) : 1
      ));

    if (directed) {
      linkElements.attr('marker-end', `url(#${markerId})`);
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
      .attr('r', (d) => Number.isFinite(d.size) && d.size! > 0 ? d.size! : 8)
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

    const persistPositions = () => {
      for (const node of simNodes) {
        if (Number.isFinite(node.x) && Number.isFinite(node.y)) {
          positionsRef.current.set(node.id, {
            x: node.x!,
            y: node.y!,
            vx: Number.isFinite(node.vx) ? node.vx : 0,
            vy: Number.isFinite(node.vy) ? node.vy : 0,
          });
        }
      }
    };

    const renderPositions = () => {
      linkElements
        .attr('x1', (d: any) => finiteCoordinate(d.source?.x, chartWidth / 2))
        .attr('y1', (d: any) => finiteCoordinate(d.source?.y, chartHeight / 2))
        .attr('x2', (d: any) => finiteCoordinate(d.target?.x, chartWidth / 2))
        .attr('y2', (d: any) => finiteCoordinate(d.target?.y, chartHeight / 2));

      nodeElements
        .attr('data-node-id', (d) => d.id)
        .attr('transform', (d) => `translate(${finiteCoordinate(d.x, chartWidth / 2)},${finiteCoordinate(d.y, chartHeight / 2)})`);
      persistPositions();
    };

    simulation.on('tick', renderPositions);
    renderPositions();

    // When animation is disabled, run the simulation synchronously to its
    // settled position. A calibrated alpha decay reaches alphaMin in 120 ticks
    // instead of blocking the main thread for D3's default ~300-tick schedule.
    if (!chartPersonality.animate) {
      simulation.stop();
      simulation.alphaDecay(
        1 - Math.pow(simulation.alphaMin(), 1 / STATIC_LAYOUT_TICKS),
      );
      simulation.tick(STATIC_LAYOUT_TICKS);
      simulation.on('tick', null);
      renderPositions();
    }

    return () => {
      persistPositions();
      simulation.on('tick', null).on('end', null);
      simulation.alphaTarget(0).stop();
      nodeElements.on('.drag', null);
      svg.selectAll('*').interrupt();
      svg.selectAll('*').remove();
    };
  }, [validation, graphNodes, graphLinks, chartWidth, chartHeight, directed, definitionsId, markerId, chartPersonality.animate, palette, chartPersonality.tooltip]);

  useEffect(() => () => {
    positionsRef.current.clear();
  }, []);

  const groups = [...new Set(graphNodes.map((n) => n.group).filter(Boolean))] as string[];
  const legendNode = legend && groups.length > 0 ? (
    <div data-part="legend" data-variant={directed ? 'directed' : 'undirected'} style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {groups.map((group, i) => (
        <div key={group} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span data-part="legend-swatch" style={{ width: 12, height: 12, backgroundColor: palette[i % palette.length], display: 'inline-block' }} />
          <span data-part="legend-label">{group}</span>
        </div>
      ))}
    </div>
  ) : null;

  const fallbackNode = !validation.ok ? (
    <div
      role="status"
      data-part="chart-fallback"
      data-state="error"
      data-error-code={validation.code}
      style={{ padding: 16, textAlign: 'center' }}
    >
      <strong>{validation.code}</strong>
      <span style={{ display: 'block', marginTop: 4 }}>{validation.message}</span>
    </div>
  ) : graphNodes.length === 0 ? (
    <div
      role="status"
      data-part="chart-fallback"
      data-state="empty"
      style={{ padding: 16, textAlign: 'center' }}
    >
      No network data to display.
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
      ariaDescription={describeChart(
        'Network graph',
        graphNodes.length + graphLinks.length,
        subtitle,
        validation.ok
          ? directed ? 'Directed edges are shown with arrows.' : undefined
          : `${validation.code}. ${validation.message}`,
      )}
      summary={summary}
      legend={fallbackNode ?? legendNode}
    />
  );
});
