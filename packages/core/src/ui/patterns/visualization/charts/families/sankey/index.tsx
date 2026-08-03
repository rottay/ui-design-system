'use client';

/**
 * @fileoverview SankeyChart -- D3-backed flow diagram that visualizes directed
 * flows between a set of nodes arranged in columns. Nodes are positioned via a
 * simplified topological-sort layout (no d3-sankey dependency). Links are drawn
 * as cubic bezier paths whose width encodes flow volume.
 *
 * The imperative d3 body is a Class-H wrap: it keeps its custom layout and link
 * paths but draws INSIDE the shared `ChartImperativePlot` bridge, so the stable
 * `ChartRendererSurface` owns the SVG element, its accessible `<title>/<desc>`,
 * the tooltip anchor variables, and the `data-empty` stamp. The `ChartScaffold`
 * still owns the heading, accessible summary table, legend, and lifecycle states
 * so the public family contract is preserved.
 *
 * The headline use case is candidate-pipeline visualization (e.g. BitHire:
 * Applied -> Screening -> Interview -> Offer -> Hired, with branches for
 * Rejected / Withdrawn at each stage), but the component is fully
 * domain-agnostic and works for any directed acyclic flow.
 *
 * Layout algorithm (simplified sankey):
 * 1. Compute node depth (column) via topological sort from source nodes.
 * 2. Size each node rectangle by the maximum of its total inflow / outflow.
 * 3. Position nodes within each column, distributing vertical space by value.
 * 4. Route links as horizontal cubic beziers whose stroke-width equals the
 *    proportional flow value.
 *
 * @example
 * ```tsx
 * <SankeyChart
 *   nodes={[
 *     { id: 'applied', label: 'Applied' },
 *     { id: 'screening', label: 'Screening' },
 *     { id: 'interview', label: 'Interview' },
 *     { id: 'offer', label: 'Offer' },
 *     { id: 'hired', label: 'Hired' },
 *     { id: 'rejected', label: 'Rejected' },
 *   ]}
 *   links={[
 *     { source: 'applied', target: 'screening', value: 500 },
 *     { source: 'screening', target: 'interview', value: 300 },
 *     { source: 'screening', target: 'rejected', value: 200 },
 *     { source: 'interview', target: 'offer', value: 180 },
 *     { source: 'interview', target: 'rejected', value: 120 },
 *     { source: 'offer', target: 'hired', value: 150 },
 *     { source: 'offer', target: 'rejected', value: 30 },
 *   ]}
 *   height={400}
 *   title="Candidate Pipeline"
 * />
 * ```
 */

import { memo, useCallback, useMemo, useRef } from 'react';
import { scaleLinear, select } from 'd3';

import type {
  ChartBaseProps,
  ChartColorsProps,
  ChartLegendProps,
  ChartMarginProps,
  ChartStateProps,
} from '../../contracts';
import { useChartPersonality } from '../../runtime';
import { ChartScaffold, describeChart } from '../../presentation/scaffold';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  ChartImperativePlot,
  type ChartImperativePlotDraw,
} from '../../runtime/chart-engine/presentation/react/renderers/imperative';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** A node in the sankey diagram. */
export interface SankeyNode {
  /** Unique identifier used by links to reference this node. */
  id: string;
  /** Human-readable label rendered beside the node rectangle. */
  label: string;
  /** Optional color override. Falls back to the palette cycle. */
  color?: string;
}

/** A directed flow between two nodes. */
export interface SankeyLink {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Flow volume -- determines link path width. */
  value: number;
  /** Optional color override. Falls back to the source node color with opacity. */
  color?: string;
}

/** Layout, presentation, and callback options for {@link SankeyChart}. */
export interface SankeyChartOwnProps
  extends ChartBaseProps, ChartLegendProps, ChartColorsProps, ChartMarginProps {
  /** The set of nodes displayed as rectangles in the diagram. */
  nodes: SankeyNode[];
  /** Directed flows between nodes, rendered as curved paths. */
  links: SankeyLink[];
  /** Width of each node rectangle in pixels. @default 20 */
  nodeWidth?: number;
  /** Vertical padding between nodes within the same column in pixels. @default 16 */
  nodePadding?: number;
  /** Base opacity for link paths. @default 0.4 */
  linkOpacity?: number;
  /** Opacity applied to a link path on hover. @default 0.7 */
  linkHoverOpacity?: number;
  /** Horizontal alignment strategy for node columns. @default 'justify' */
  align?: 'left' | 'right' | 'center' | 'justify';
  /** Whether to render value labels on link paths. @default false */
  showLinkValues?: boolean;
  /** Whether to render labels beside node rectangles. @default true */
  showNodeLabels?: boolean;
  /** Custom value formatter for labels and tooltips. */
  formatValue?: (value: number) => string;
  /** Callback when a node rectangle is clicked. */
  onNodeClick?: (node: SankeyNode) => void;
  /** Callback when a link path is clicked. */
  onLinkClick?: (link: SankeyLink) => void;
  /** Render the loading state as placeholder bars instead of a centered label. */
  skeleton?: boolean;
}

/**
 * Props for the {@link SankeyChart} component. The caller-declared lifecycle
 * states (`state` plus typed-required empty/error copy) are threaded through the
 * shared {@link ChartStateProps} contract.
 */
export type SankeyChartProps = SankeyChartOwnProps & ChartStateProps;

// ---------------------------------------------------------------------------
// Internal layout types
// ---------------------------------------------------------------------------

interface LayoutNode {
  id: string;
  label: string;
  color: string;
  /** Column index (0-based from left). */
  depth: number;
  /** Total flow value through this node (max of inflow, outflow). */
  value: number;
  /** Layout coordinates computed during positioning. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Original input node reference. */
  source: SankeyNode;
}

interface LayoutLink {
  sourceNode: LayoutNode;
  targetNode: LayoutNode;
  value: number;
  color: string;
  /** Vertical offset at the source node (cumulative). */
  sy0: number;
  /** Vertical offset at the target node (cumulative). */
  ty0: number;
  /** Path width in pixels (proportional to value). */
  width: number;
  /** Original input link reference. */
  source: SankeyLink;
}

type SankeyDataErrorCode = 'CYCLIC_FLOW' | 'INVALID_DATA';

type SankeyDataValidation =
  | {
      ok: true;
      nodes: SankeyNode[];
      links: SankeyLink[];
    }
  | {
      ok: false;
      code: SankeyDataErrorCode;
      message: string;
    };

const SANKEY_ERROR_MESSAGES: Record<SankeyDataErrorCode, string> = {
  CYCLIC_FLOW: 'The flow contains a cycle and cannot be laid out.',
  INVALID_DATA: 'The flow data contains invalid nodes or links.',
};

/** Validate the complete graph before the layout can traverse it. */
function validateSankeyData(
  nodes: SankeyNode[] | null | undefined,
  links: SankeyLink[] | null | undefined,
): SankeyDataValidation {
  if (!Array.isArray(nodes) || !Array.isArray(links)) {
    return { ok: false, code: 'INVALID_DATA', message: SANKEY_ERROR_MESSAGES.INVALID_DATA };
  }

  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (
      !node
      || typeof node.id !== 'string'
      || node.id.trim().length === 0
      || typeof node.label !== 'string'
      || nodeIds.has(node.id)
    ) {
      return { ok: false, code: 'INVALID_DATA', message: SANKEY_ERROR_MESSAGES.INVALID_DATA };
    }
    nodeIds.add(node.id);
  }

  const incomingCount = new Map<string, number>();
  const children = new Map<string, string[]>();
  for (const id of nodeIds) {
    incomingCount.set(id, 0);
    children.set(id, []);
  }

  for (const link of links) {
    if (
      !link
      || typeof link.source !== 'string'
      || typeof link.target !== 'string'
      || !nodeIds.has(link.source)
      || !nodeIds.has(link.target)
      || !Number.isFinite(link.value)
      || link.value <= 0
    ) {
      return { ok: false, code: 'INVALID_DATA', message: SANKEY_ERROR_MESSAGES.INVALID_DATA };
    }

    const sourceChildren = children.get(link.source);
    const targetIncomingCount = incomingCount.get(link.target);
    if (!sourceChildren || targetIncomingCount === undefined) {
      return { ok: false, code: 'INVALID_DATA', message: SANKEY_ERROR_MESSAGES.INVALID_DATA };
    }
    sourceChildren.push(link.target);
    incomingCount.set(link.target, targetIncomingCount + 1);
  }

  // Kahn's algorithm both proves acyclicity and terminates in O(nodes + links).
  const queue = [...nodeIds].filter((id) => incomingCount.get(id) === 0);
  let visitedCount = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current === undefined) break;
    visitedCount += 1;
    for (const child of children.get(current) ?? []) {
      const childIncomingCount = incomingCount.get(child);
      if (childIncomingCount === undefined) {
        return { ok: false, code: 'INVALID_DATA', message: SANKEY_ERROR_MESSAGES.INVALID_DATA };
      }
      const remaining = childIncomingCount - 1;
      incomingCount.set(child, remaining);
      if (remaining === 0) queue.push(child);
    }
  }

  if (visitedCount !== nodes.length) {
    return { ok: false, code: 'CYCLIC_FLOW', message: SANKEY_ERROR_MESSAGES.CYCLIC_FLOW };
  }

  return { ok: true, nodes, links };
}

// ---------------------------------------------------------------------------
// Layout algorithm
// ---------------------------------------------------------------------------

/**
 * Compute node depths (column indices) via BFS from root nodes (nodes with
 * no incoming links). Cycles have already been rejected by validation.
 */
function computeDepths(
  nodes: SankeyNode[],
  links: SankeyLink[],
): Map<string, number> {
  const depths = new Map<string, number>();
  const children = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();

  for (const node of nodes) {
    children.set(node.id, []);
    incomingCount.set(node.id, 0);
  }

  for (const link of links) {
    const existing = children.get(link.source);
    if (existing) existing.push(link.target);
    incomingCount.set(link.target, (incomingCount.get(link.target) ?? 0) + 1);
  }

  // BFS from root nodes (zero incoming links).
  const queue: string[] = [];
  for (const node of nodes) {
    if ((incomingCount.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
      depths.set(node.id, 0);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depths.get(current) ?? 0;
    for (const child of children.get(current) ?? []) {
      const childDepth = depths.get(child);
      const newDepth = currentDepth + 1;
      if (childDepth === undefined || newDepth > childDepth) {
        depths.set(child, newDepth);
        queue.push(child);
      }
    }
  }

  // Fallback: any node not reached by BFS goes to column 0.
  for (const node of nodes) {
    if (!depths.has(node.id)) {
      depths.set(node.id, 0);
    }
  }

  return depths;
}

/**
 * Full layout pass: assigns rectangles to nodes and computes link offsets.
 */
function computeLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  innerWidth: number,
  innerHeight: number,
  nodeWidth: number,
  nodePadding: number,
  colors: string[],
  align: 'left' | 'right' | 'center' | 'justify',
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } {
  // 1. Depths
  const depthMap = computeDepths(nodes, links);
  const maxDepth = Math.max(0, ...depthMap.values());

  // 2. Build layout nodes with flow values.
  const inflowMap = new Map<string, number>();
  const outflowMap = new Map<string, number>();
  for (const link of links) {
    inflowMap.set(link.target, (inflowMap.get(link.target) ?? 0) + link.value);
    outflowMap.set(link.source, (outflowMap.get(link.source) ?? 0) + link.value);
  }

  const nodeMap = new Map<string, LayoutNode>();
  const layoutNodes: LayoutNode[] = nodes.map((n, i) => {
    const inflow = inflowMap.get(n.id) ?? 0;
    const outflow = outflowMap.get(n.id) ?? 0;
    const node: LayoutNode = {
      id: n.id,
      label: n.label,
      color: n.color ?? colors[i % colors.length],
      depth: depthMap.get(n.id) ?? 0,
      value: Math.max(inflow, outflow, 1),
      x0: 0,
      y0: 0,
      x1: 0,
      y1: 0,
      source: n,
    };
    nodeMap.set(n.id, node);
    return node;
  });

  // 3. Group nodes by column.
  const columns = new Map<number, LayoutNode[]>();
  for (const node of layoutNodes) {
    const col = columns.get(node.depth) ?? [];
    col.push(node);
    columns.set(node.depth, col);
  }

  // 4. Compute horizontal positions.
  const numColumns = maxDepth + 1;
  const columnGap = numColumns > 1
    ? (innerWidth - nodeWidth) / (numColumns - 1)
    : 0;

  for (const [depth, col] of columns) {
    let x0: number;
    if (numColumns <= 1) {
      x0 = (innerWidth - nodeWidth) / 2;
    } else if (align === 'left') {
      x0 = depth * columnGap;
    } else if (align === 'right') {
      x0 = innerWidth - nodeWidth - (maxDepth - depth) * columnGap;
    } else if (align === 'center') {
      const totalColumnsWidth = maxDepth * columnGap + nodeWidth;
      const offset = (innerWidth - totalColumnsWidth) / 2;
      x0 = offset + depth * columnGap;
    } else {
      // justify (default) -- spread columns across the full width.
      x0 = depth * columnGap;
    }

    for (const node of col) {
      node.x0 = x0;
      node.x1 = x0 + nodeWidth;
    }
  }

  // 5. Compute vertical positions within each column.
  for (const [, col] of columns) {
    const totalValue = col.reduce((sum, n) => sum + n.value, 0);
    const totalPadding = Math.max(0, (col.length - 1) * nodePadding);
    const availableHeight = innerHeight - totalPadding;
    const valueScale = totalValue > 0
      ? scaleLinear().domain([0, totalValue]).range([0, availableHeight])
      : scaleLinear().domain([0, 1]).range([0, availableHeight]);

    let y = 0;
    for (const node of col) {
      const nodeHeight = Math.max(2, valueScale(node.value) as number);
      node.y0 = y;
      node.y1 = y + nodeHeight;
      y += nodeHeight + nodePadding;
    }

    // Center vertically if there is leftover space.
    const usedHeight = y - nodePadding;
    if (usedHeight < innerHeight) {
      const offset = (innerHeight - usedHeight) / 2;
      for (const node of col) {
        node.y0 += offset;
        node.y1 += offset;
      }
    }
  }

  // 6. Build layout links with vertical offsets.
  // Track cumulative vertical offsets per node for stacking links.
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();
  for (const node of layoutNodes) {
    sourceOffsets.set(node.id, node.y0);
    targetOffsets.set(node.id, node.y0);
  }

  // Sort links by source depth, then by value descending for stable stacking.
  const sortedLinks = [...links].sort((a, b) => {
    const da = depthMap.get(a.source) ?? 0;
    const db = depthMap.get(b.source) ?? 0;
    if (da !== db) return da - db;
    return b.value - a.value;
  });

  const layoutLinks: LayoutLink[] = [];
  for (const link of sortedLinks) {
    const sn = nodeMap.get(link.source);
    const tn = nodeMap.get(link.target);
    if (!sn || !tn) continue;

    // Link width proportional to flow value relative to the source node height.
    const sourceHeight = sn.y1 - sn.y0;
    const linkWidth = sn.value > 0
      ? (link.value / sn.value) * sourceHeight
      : 1;

    const sy0 = sourceOffsets.get(link.source) ?? sn.y0;
    const ty0 = targetOffsets.get(link.target) ?? tn.y0;

    layoutLinks.push({
      sourceNode: sn,
      targetNode: tn,
      value: link.value,
      color: link.color ?? sn.color,
      sy0,
      ty0,
      width: Math.max(1, linkWidth),
      source: link,
    });

    sourceOffsets.set(link.source, sy0 + linkWidth);
    targetOffsets.set(link.target, ty0 + linkWidth);
  }

  return { layoutNodes, layoutLinks };
}

/**
 * Generate an SVG cubic bezier path for a horizontal link between two nodes.
 * The path flows from the source node's right edge to the target node's left
 * edge, using horizontal tangent control points at the midpoint.
 */
function linkPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
): string {
  const mx = (sx + tx) / 2;
  return `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a sankey (flow) diagram as an SVG with nodes arranged in columns
 * and curved links showing directed flows between them.
 *
 * @param props - See {@link SankeyChartProps} for the full option set.
 * @returns A `ChartScaffold`-wrapped imperative plot with accessible summary table and optional legend.
 */
export const SankeyChart = memo(function SankeyChart(props: SankeyChartProps) {
  const i18n = useOptionalTranslation('components');
  const {
    nodes,
    links,
    nodeWidth = 20,
    nodePadding = 16,
    linkOpacity = 0.4,
    linkHoverOpacity = 0.7,
    align = 'justify',
    showLinkValues = false,
    showNodeLabels = true,
    formatValue,
    onNodeClick,
    onLinkClick,
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
    tooltip = true,
    margin = { top: 16, right: 120, bottom: 16, left: 16 },
    skeleton,
    state,
    emptyLabel,
    emptyDescription,
    emptyAction,
    errorLabel,
    errorDescription,
    errorAction,
  } = props;
  // Forward the caller-declared lifecycle contract to the scaffold as one unit.
  // The reconstructed object carries only the state fields (no own-prop leak);
  // the cast is a downcast from the widened destructured shape to the union.
  const scaffoldStateProps = {
    state,
    emptyLabel,
    emptyDescription,
    emptyAction,
    errorLabel,
    errorDescription,
    errorAction,
  } as ChartStateProps;
  const scaffoldRef = useRef<HTMLDivElement>(null);
  const legacySvgRef = useRef<SVGSVGElement>(null);
  const chartPersonality = useChartPersonality({ animate, tooltip });

  const fmt = useCallback(
    (v: number) => (formatValue ? formatValue(v) : v.toLocaleString()),
    [formatValue],
  );

  const validation = useMemo(() => validateSankeyData(nodes, links), [nodes, links]);
  const safeNodes = validation.ok ? validation.nodes : [];
  const safeLinks = validation.ok ? validation.links : [];
  const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
  const hasRenderableData = validation.ok && validation.nodes.length > 0;
  const resolvedEmptyLabel =
    emptyLabel ??
    i18n?.tOr('chart.sankey_empty', 'No flow data to display.') ??
    'No flow data to display.';

  // Accessibility summary table.
  const summary = {
    caption: title ? `${title} data summary` : 'Sankey chart data summary',
    headers: ['Source', 'Target', 'Value'],
    rows: safeLinks.map((l) => {
      const sourceNode = safeNodes.find((n) => n.id === l.source);
      const targetNode = safeNodes.find((n) => n.id === l.target);
      return [
        sourceNode?.label ?? l.source,
        targetNode?.label ?? l.target,
        fmt(l.value),
      ];
    }),
  };

  const animationDuration = chartPersonality.animationDuration;
  const animateMount = chartPersonality.animate;
  const showTooltip = chartPersonality.tooltip;

  // Imperative draw procedure. It owns only the bridge-provided mount `<g>`; the
  // surrounding renderer surface owns the SVG element, accessible name, and
  // tooltip vars. Dimensions arrive from the bridge, so this callback is stable
  // across unrelated re-renders (data/option changes redraw; a resize redraws).
  const draw = useCallback<ChartImperativePlotDraw>((context) => {
    const { mount, width: chartWidth, height: chartHeight } = context;

    if (!validation.ok || validation.nodes.length === 0) return undefined;

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return undefined;

    const g = select(mount)
      .append('g')
      .attr('data-part', 'plot-area')
      .attr('data-variant', align)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const { layoutNodes, layoutLinks } = computeLayout(
      validation.nodes,
      validation.links,
      innerWidth,
      innerHeight,
      nodeWidth,
      nodePadding,
      palette,
      align,
    );

    // --- Links layer (rendered first so nodes sit on top) ---
    const linkGroup = g.append('g').attr('class', 'sankey-links').attr('data-part', 'links');

    const linkPaths = linkGroup
      .selectAll('.sankey-link')
      .data(layoutLinks)
      .enter()
      .append('path')
      .attr('class', 'sankey-link')
      .attr('data-part', 'link')
      .attr('data-state', 'idle')
      .attr('d', (d) => {
        const sx = d.sourceNode.x1;
        const sy = d.sy0 + d.width / 2;
        const tx = d.targetNode.x0;
        const ty = d.ty0 + d.width / 2;
        return linkPath(sx, sy, tx, ty);
      })
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-opacity', linkOpacity)
      .attr('stroke-width', (d) => d.width)
      // Links are keyboard-focusable flow regions: role/img with a composed
      // label when passive, role/button when clickable.
      .attr('tabindex', 0)
      .attr('role', onLinkClick ? 'button' : 'img')
      .attr('aria-label', (d) => `${d.sourceNode.label} -> ${d.targetNode.label}: ${fmt(d.value)}`)
      .style('cursor', onLinkClick ? 'pointer' : 'default');

    // Hover interactions for links; keyboard focus mirrors the same emphasis so
    // the highlight is never pointer-only.
    const emphasizeLink = function (this: SVGPathElement) {
      select(this).attr('data-state', 'hovered').attr('stroke-opacity', linkHoverOpacity);
    };
    const resetLink = function (this: SVGPathElement) {
      select(this).attr('data-state', 'idle').attr('stroke-opacity', linkOpacity);
    };
    linkPaths
      .on('mouseenter', emphasizeLink)
      .on('mouseleave', resetLink)
      .on('focus', emphasizeLink)
      .on('blur', resetLink);

    if (onLinkClick) {
      linkPaths.on('click', (_, d) => onLinkClick(d.source));
      linkPaths.on('keydown', (event: KeyboardEvent, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onLinkClick(d.source);
        }
      });
    }

    // Tooltip on links.
    if (showTooltip) {
      linkPaths.append('title').text((d) => {
        const sLabel = d.sourceNode.label;
        const tLabel = d.targetNode.label;
        return `${sLabel} -> ${tLabel}: ${fmt(d.value)}`;
      });
    }

    // Link value labels.
    if (showLinkValues) {
      linkGroup
        .selectAll('.sankey-link-label')
        .data(layoutLinks.filter((d) => d.width >= 8))
        .enter()
        .append('text')
        .attr('class', 'sankey-link-label')
        .attr('data-part', 'link-label')
        .attr('x', (d) => (d.sourceNode.x1 + d.targetNode.x0) / 2)
        .attr('y', (d) => {
          const sy = d.sy0 + d.width / 2;
          const ty = d.ty0 + d.width / 2;
          return (sy + ty) / 2;
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .text((d) => fmt(d.value));
    }

    // Mount animation: links draw from left to right.
    if (animateMount) {
      linkPaths.each(function () {
        const path = select(this);
        const totalLength = (this as SVGPathElement).getTotalLength?.() ?? 0;
        if (totalLength > 0) {
          path
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(animationDuration)
            .attr('stroke-dashoffset', 0)
            .on('end', function () {
              select(this)
                .attr('stroke-dasharray', null)
                .attr('stroke-dashoffset', null);
            });
        }
      });
    }

    // --- Nodes layer ---
    const nodeGroup = g.append('g').attr('class', 'sankey-nodes').attr('data-part', 'nodes');

    const nodeElements = nodeGroup
      .selectAll('.sankey-node')
      .data(layoutNodes)
      .enter()
      .append('g')
      .attr('class', 'sankey-node')
      .attr('data-part', 'node')
      .attr('data-state', 'idle')
      // Nodes are keyboard-focusable regions; connected-link highlighting
      // mirrors on focus what the pointer gets on hover.
      .attr('tabindex', 0)
      .attr('role', onNodeClick ? 'button' : 'img')
      .attr('aria-label', (d) => `${d.label}: ${fmt(d.value)}`)
      .style('cursor', onNodeClick ? 'pointer' : 'default');

    // Node rectangles.
    const nodeRects = nodeElements
      .append('rect')
      .attr('data-part', 'node-mark')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => Math.max(1, d.y1 - d.y0))
      .attr('fill', (d) => d.color)
      .attr('rx', 2)
      .attr('ry', 2);

    // Node hover/focus: highlight connected links. The same emphasis runs for
    // pointer (mouseenter/mouseleave) and keyboard (focus/blur) so the
    // connected-flow readout is never pointer-only.
    const highlightNode = function (this: SVGGElement, _: unknown, d: LayoutNode) {
      // Dim all links, then brighten connected ones.
      linkPaths.attr('stroke-opacity', (ld) =>
        ld.sourceNode.id === d.id || ld.targetNode.id === d.id
          ? linkHoverOpacity
          : linkOpacity * 0.3,
      );
      select(this).attr('data-state', 'hovered');
    };
    const resetNode = function (this: SVGGElement) {
      linkPaths.attr('stroke-opacity', linkOpacity);
      select(this).attr('data-state', 'idle');
    };
    nodeElements
      .on('mouseenter', highlightNode)
      .on('mouseleave', resetNode)
      .on('focus', highlightNode)
      .on('blur', resetNode);

    if (onNodeClick) {
      nodeElements.on('click', (_, d) => onNodeClick(d.source));
      nodeElements.on('keydown', (event: KeyboardEvent, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onNodeClick(d.source);
        }
      });
    }

    // Node tooltips.
    if (showTooltip) {
      nodeElements.append('title').text((d) => `${d.label}: ${fmt(d.value)}`);
    }

    // Node labels.
    if (showNodeLabels) {
      nodeElements
        .append('text')
        .attr('data-part', 'node-label')
        .attr('x', (d) => {
          // Place labels to the right of the node, unless the node is in the
          // last column, in which case place them to the left.
          const maxCol = Math.max(0, ...layoutNodes.map((n) => n.depth));
          return d.depth === maxCol ? d.x0 - 6 : d.x1 + 6;
        })
        .attr('y', (d) => (d.y0 + d.y1) / 2)
        .attr('text-anchor', (d) => {
          const maxCol = Math.max(0, ...layoutNodes.map((n) => n.depth));
          return d.depth === maxCol ? 'end' : 'start';
        })
        .attr('dominant-baseline', 'central')
        .text((d) => d.label);

      // Value beneath the label.
      nodeElements
        .append('text')
        .attr('data-part', 'node-value')
        .attr('x', (d) => {
          const maxCol = Math.max(0, ...layoutNodes.map((n) => n.depth));
          return d.depth === maxCol ? d.x0 - 6 : d.x1 + 6;
        })
        .attr('y', (d) => (d.y0 + d.y1) / 2 + 14)
        .attr('text-anchor', (d) => {
          const maxCol = Math.max(0, ...layoutNodes.map((n) => n.depth));
          return d.depth === maxCol ? 'end' : 'start';
        })
        .attr('dominant-baseline', 'central')
        .text((d) => fmt(d.value));
    }

    // Node mount animation: fade in with stagger.
    if (animateMount) {
      nodeRects
        .attr('opacity', 0)
        .transition()
        .duration(animationDuration * 0.6)
        .delay((_, i) => i * 60)
        .attr('opacity', 1);
    }

    // Interrupt scheduled transitions before the bridge clears the mount.
    return () => {
      select(mount).selectAll('*').interrupt();
    };
  }, [
    validation,
    nodeWidth,
    nodePadding,
    linkOpacity,
    linkHoverOpacity,
    align,
    showLinkValues,
    showNodeLabels,
    palette,
    margin,
    animateMount,
    animationDuration,
    showTooltip,
    fmt,
    onNodeClick,
    onLinkClick,
  ]);

  // Legend.
  const legendNode = legend && hasRenderableData ? (
    <div data-part="legend" data-variant="sankey" style={{ display: 'flex', gap: 'var(--ds-chart-legend-gap, 16px)', flexWrap: 'wrap', marginTop: 'var(--ds-chart-legend-margin-top, 8px)', justifyContent: 'center' }}>
      {validation.nodes.map((n, i) => (
        <div key={n.id} data-part="legend-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-chart-legend-item-gap, 6px)', fontSize: 'var(--ds-chart-legend-font-size, 12px)' }}>
          <span
            data-part="legend-swatch"
            style={{
              width: 12,
              height: 12,
              backgroundColor: n.color ?? palette[i % palette.length],
              display: 'inline-block',
            }}
          />
          <span data-part="legend-label">{n.label}</span>
        </div>
      ))}
    </div>
  ) : null;

  // INVALID-DATA and inferred-empty semantics are visible, localized states.
  // An empty imperative renderer without a companion message is a blank chart,
  // not a usable state. Caller copy wins; the catalog supplies the floor.
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
  ) : validation.nodes.length === 0 ? (
    <div
      role="status"
      data-part="chart-fallback"
      data-state="empty"
    >
      {resolvedEmptyLabel}
    </div>
  ) : null;

  return (
    <ChartScaffold
      {...scaffoldStateProps}
      containerRef={scaffoldRef}
      svgRef={legacySvgRef}
      width={width}
      height={height}
      className={['ds-chart-sankey', className].filter(Boolean).join(' ')}
      style={style}
      loading={loading}
      skeleton={skeleton}
      loadingLabel={chartPersonality.loadingLabel}
      title={title}
      subtitle={subtitle}
      ariaLabel={title ?? 'Sankey chart'}
      ariaDescription={describeChart(
        'Sankey flow diagram',
        safeNodes.length,
        subtitle,
        validation.ok
          ? `${safeLinks.length} flow ${safeLinks.length === 1 ? 'link' : 'links'} between ${safeNodes.length} ${safeNodes.length === 1 ? 'node' : 'nodes'}.`
          : `${validation.code}. ${validation.message}`,
      )}
      summary={summary}
      legend={fallbackNode ?? legendNode}
      plot={({ descriptionId }) => (
        <ChartImperativePlot
          rendererId="sankey"
          ariaLabel={title ?? 'Sankey chart'}
          ariaDescribedBy={descriptionId}
          width={typeof width === 'number' ? width : 600}
          height={height}
          responsive={responsive}
          empty={!hasRenderableData}
          draw={draw}
        />
      )}
    />
  );
});
