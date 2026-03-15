'use client';

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

import type { ChartBaseProps } from '../types';
import { DEFAULT_COLORS } from '../types';
import { useChartDimensions, useChartPersonality } from '../hooks';
import { ChartScaffold, describeChart } from '../chart-scaffold';

export interface NetworkNode {
  id: string;
  label?: string;
  color?: string;
  size?: number;
  group?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value?: number;
  label?: string;
}

export interface NetworkGraphProps extends ChartBaseProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  directed?: boolean;
}

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

    svg.attr('width', chartWidth).attr('height', chartHeight);

    // Group color mapping
    const groups = [...new Set(nodes.map((n) => n.group).filter(Boolean))] as string[];
    const groupColor = (group?: string) => {
      if (!group) return colors[0];
      const idx = groups.indexOf(group);
      return colors[idx % colors.length];
    };

    // Arrow marker for directed graphs
    if (directed) {
      svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', 'var(--ds-color-border-primary)');
    }

    const simNodes: (NetworkNode & SimulationNodeDatum)[] = nodes.map((n) => ({ ...n }));
    const simLinks = links.map((l) => ({ ...l }));

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
      .attr('stroke', 'var(--ds-color-border-primary)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value ?? 1));

    if (directed) {
      linkElements.attr('marker-end', 'url(#arrow)');
    }

    const nodeElements = svg
      .selectAll('.node')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
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
      .attr('r', (d) => d.size ?? 8)
      .attr('fill', (d) => d.color ?? groupColor(d.group))
      .attr('stroke', 'var(--ds-color-bg-primary)')
      .attr('stroke-width', 2);

    if (chartPersonality.tooltip) {
      nodeElements.append('title').text((d) => d.label ?? d.id);
    }

    // Labels
    nodeElements
      .append('text')
      .attr('dx', 12)
      .attr('dy', 4)
      .style('fill', 'var(--ds-color-text-secondary)')
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
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
      {groups.map((group, i) => (
        <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: colors[i % colors.length], display: 'inline-block' }} />
          <span style={{ color: 'var(--ds-color-text-secondary)' }}>{group}</span>
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
      className={className}
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
