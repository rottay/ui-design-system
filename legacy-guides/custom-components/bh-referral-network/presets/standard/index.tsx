'use client';

/**
 * BhReferralNetwork - Standard Preset
 * Pure SVG force-directed graph with simplified spring-physics simulation.
 * Computes stable node positions via iterative charge repulsion, spring
 * attraction, center gravity, and velocity damping, then renders static SVG.
 *
 * No D3 dependency — all physics calculations are inline.
 * Colors sourced exclusively from design tokens.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhReferralNetworkProps, NetworkNode, NetworkEdge } from '../../core';

/* ------------------------------------------------------------------ */
/*  Physics simulation types                                           */
/* ------------------------------------------------------------------ */

interface SimNode {
  id: string;
  label: string;
  type: NetworkNode['type'];
  size: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  metadata?: Record<string, any>;
}

interface SimEdge {
  sourceIdx: number;
  targetIdx: number;
  weight: number;
  label?: string;
  type: 'referral' | 'collaboration' | 'reporting';
}

/* ------------------------------------------------------------------ */
/*  Node color by type                                                 */
/* ------------------------------------------------------------------ */

function getNodeColor(
  type: NetworkNode['type'],
  t: PresetContext['tokens'],
): string {
  switch (type) {
    case 'person':
      return t.colors.primaryScale[500];
    case 'team':
      return t.colors.secondaryScale[500];
    case 'department':
      return t.colors.infoScale[500];
    case 'company':
      return t.colors.warningScale[500];
    default:
      return t.colors.primaryScale[500];
  }
}

/* ------------------------------------------------------------------ */
/*  Force-directed simulation                                          */
/* ------------------------------------------------------------------ */

function runSimulation(
  nodes: SimNode[],
  edges: SimEdge[],
  width: number,
  height: number,
  chargeStrength: number,
  linkDistance: number,
  iterations: number = 120,
): SimNode[] {
  if (nodes.length === 0) return [];

  // Clone nodes to avoid mutating input
  const simNodes = nodes.map((n) => ({ ...n }));

  const centerX = width / 2;
  const centerY = height / 2;
  const centerGravity = 0.05;
  const damping = 0.92;
  const maxVelocity = 10;

  for (let iter = 0; iter < iterations; iter++) {
    // Cooling factor - reduces force over iterations
    const alpha = 1 - iter / iterations;
    const cooledCharge = chargeStrength * alpha;

    // 1. Charge repulsion (Coulomb's law approximation)
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const dx = simNodes[j].x - simNodes[i].x;
        const dy = simNodes[j].y - simNodes[i].y;
        const distSq = Math.max(dx * dx + dy * dy, 100); // min distance to prevent explosion
        const dist = Math.sqrt(distSq);
        const force = cooledCharge / distSq;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        simNodes[i].vx -= fx;
        simNodes[i].vy -= fy;
        simNodes[j].vx += fx;
        simNodes[j].vy += fy;
      }
    }

    // 2. Spring attraction (Hooke's law) along edges
    for (const edge of edges) {
      const source = simNodes[edge.sourceIdx];
      const target = simNodes[edge.targetIdx];
      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const displacement = dist - linkDistance;
      const springConstant = 0.05 * edge.weight * alpha;
      const force = displacement * springConstant;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    // 3. Center gravity
    for (const node of simNodes) {
      node.vx += (centerX - node.x) * centerGravity * alpha;
      node.vy += (centerY - node.y) * centerGravity * alpha;
    }

    // 4. Apply velocity with damping and clamp
    const padding = 30;
    for (const node of simNodes) {
      node.vx *= damping;
      node.vy *= damping;

      // Clamp velocity
      node.vx = Math.max(-maxVelocity, Math.min(maxVelocity, node.vx));
      node.vy = Math.max(-maxVelocity, Math.min(maxVelocity, node.vy));

      node.x += node.vx;
      node.y += node.vy;

      // Keep within bounds
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    }
  }

  return simNodes;
}

/* ------------------------------------------------------------------ */
/*  Edge style helpers                                                 */
/* ------------------------------------------------------------------ */

function getEdgeDashArray(type: 'referral' | 'collaboration' | 'reporting'): string {
  switch (type) {
    case 'collaboration':
      return '6 3';
    case 'reporting':
      return '2 3';
    case 'referral':
    default:
      return 'none';
  }
}

/* ------------------------------------------------------------------ */
/*  Tooltip types                                                      */
/* ------------------------------------------------------------------ */

interface TooltipInfo {
  x: number;
  y: number;
  title: string;
  lines: string[];
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const StandardBhReferralNetwork = createPreset<BhReferralNetworkProps>({
  name: 'BhReferralNetwork.Standard',
  render: (ctx: PresetContext<BhReferralNetworkProps>) => {
    const { props, tokens: t } = ctx;

    const {
      data,
      width = 600,
      height = 400,
      animate = true,
      onNodeClick,
      onEdgeClick,
      showLabels = true,
      chargeStrength = -120,
      linkDistance = 80,
      className,
      style,
    } = props;

    const inputNodes = data?.nodes ?? [];
    const inputEdges = data?.edges ?? [];

    const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [hoveredEdgeIdx, setHoveredEdgeIdx] = useState<number | null>(null);
    const [animationReady, setAnimationReady] = useState(!animate);

    // Entrance animation
    useEffect(() => {
      if (!animate) {
        setAnimationReady(true);
        return;
      }
      const timer = setTimeout(() => setAnimationReady(true), 50);
      return () => clearTimeout(timer);
    }, [animate]);

    // Default node size range
    const defaultSize = 8;
    const maxNodeRadius = 18;
    const minNodeRadius = 6;

    // Run simulation
    const { simNodes, simEdges } = useMemo(() => {
      if (inputNodes.length === 0) return { simNodes: [], simEdges: [] };

      // Create index map for edge lookup
      const idxMap = new Map<string, number>();
      inputNodes.forEach((n, i) => idxMap.set(n.id, i));

      // Initialize node positions in a circle
      const initialNodes: SimNode[] = inputNodes.map((n, i) => {
        const angle = (2 * Math.PI * i) / inputNodes.length;
        const radius = Math.min(width, height) * 0.3;
        return {
          id: n.id,
          label: n.label,
          type: n.type,
          size: n.size ?? defaultSize,
          color: n.color ?? getNodeColor(n.type, t),
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          metadata: n.metadata,
        };
      });

      // Map edges to index-based
      const edgesList: SimEdge[] = [];
      for (const edge of inputEdges) {
        const si = idxMap.get(edge.source);
        const ti = idxMap.get(edge.target);
        if (si !== undefined && ti !== undefined) {
          edgesList.push({
            sourceIdx: si,
            targetIdx: ti,
            weight: Math.max(edge.weight, 0.1),
            label: edge.label,
            type: edge.type ?? 'referral',
          });
        }
      }

      const result = runSimulation(
        initialNodes,
        edgesList,
        width,
        height,
        chargeStrength,
        linkDistance,
      );

      return { simNodes: result, simEdges: edgesList };
    }, [inputNodes, inputEdges, width, height, chargeStrength, linkDistance, t]);

    // Compute node radii
    const nodeRadii = useMemo(() => {
      if (simNodes.length === 0) return new Map<string, number>();
      const sizes = simNodes.map((n) => n.size);
      const minSize = Math.min(...sizes);
      const maxSize = Math.max(...sizes);
      const range = maxSize - minSize || 1;

      const map = new Map<string, number>();
      for (const node of simNodes) {
        const normalized = (node.size - minSize) / range;
        const r = minNodeRadius + normalized * (maxNodeRadius - minNodeRadius);
        map.set(node.id, r);
      }
      return map;
    }, [simNodes]);

    // Max edge weight for thickness scaling
    const maxEdgeWeight = useMemo(
      () => Math.max(...simEdges.map((e) => e.weight), 1),
      [simEdges],
    );

    const handleNodeEnter = useCallback(
      (node: SimNode, e: React.MouseEvent) => {
        setHoveredNodeId(node.id);
        const lines: string[] = [`Type: ${node.type}`];
        if (node.metadata) {
          Object.entries(node.metadata).forEach(([k, v]) => {
            lines.push(`${k}: ${String(v)}`);
          });
        }
        setTooltip({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          title: node.label,
          lines,
        });
      },
      [],
    );

    const handleEdgeEnter = useCallback(
      (edgeIdx: number, e: React.MouseEvent) => {
        setHoveredEdgeIdx(edgeIdx);
        const edge = simEdges[edgeIdx];
        if (!edge) return;

        const source = simNodes[edge.sourceIdx];
        const target = simNodes[edge.targetIdx];
        const lines: string[] = [
          `Weight: ${edge.weight}`,
          `Type: ${edge.type}`,
        ];
        if (edge.label) lines.push(edge.label);

        setTooltip({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          title: `${source?.label ?? '?'} \u2192 ${target?.label ?? '?'}`,
          lines,
        });
      },
      [simEdges, simNodes],
    );

    const handleLeave = useCallback(() => {
      setHoveredNodeId(null);
      setHoveredEdgeIdx(null);
      setTooltip(null);
    }, []);

    const handleNodeClick = useCallback(
      (node: SimNode) => {
        if (!onNodeClick) return;
        onNodeClick({
          id: node.id,
          label: node.label,
          type: node.type,
          size: node.size,
          color: node.color,
          metadata: node.metadata,
        });
      },
      [onNodeClick],
    );

    const handleEdgeClick = useCallback(
      (edgeIdx: number) => {
        if (!onEdgeClick) return;
        const edge = simEdges[edgeIdx];
        if (!edge) return;
        const source = simNodes[edge.sourceIdx];
        const target = simNodes[edge.targetIdx];
        onEdgeClick({
          source: source?.id ?? '',
          target: target?.id ?? '',
          weight: edge.weight,
          label: edge.label,
          type: edge.type,
        });
      },
      [onEdgeClick, simEdges, simNodes],
    );

    // Set of node IDs connected to hovered node for highlighting
    const connectedIds = useMemo(() => {
      if (!hoveredNodeId) return new Set<string>();
      const ids = new Set<string>();
      ids.add(hoveredNodeId);
      for (const edge of simEdges) {
        const source = simNodes[edge.sourceIdx];
        const target = simNodes[edge.targetIdx];
        if (source?.id === hoveredNodeId) ids.add(target?.id ?? '');
        if (target?.id === hoveredNodeId) ids.add(source?.id ?? '');
      }
      return ids;
    }, [hoveredNodeId, simEdges, simNodes]);

    /* -- Legend items ------------------------------------------------ */
    const legendItems = useMemo(() => {
      const types = Array.from(new Set(inputNodes.map((n) => n.type)));
      return types.map((type) => ({
        type,
        color: getNodeColor(type, t),
        label: type.charAt(0).toUpperCase() + type.slice(1),
      }));
    }, [inputNodes, t]);

    /* -- Empty state ------------------------------------------------ */
    if (simNodes.length === 0) {
      return (
        <svg
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="No network data"
          style={{ display: 'block', ...style }}
        >
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill={t.colors.neutral[400]}
            fontSize={t.typography.fontSize.sm}
          >
            No data available
          </text>
        </svg>
      );
    }

    return (
      <div style={{ position: 'relative', display: 'inline-block', ...style }}>
        <svg
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Network graph: ${simNodes.length} nodes, ${simEdges.length} edges`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Edges */}
          {simEdges.map((edge, i) => {
            const source = simNodes[edge.sourceIdx];
            const target = simNodes[edge.targetIdx];
            if (!source || !target) return null;

            const isHovered = hoveredEdgeIdx === i;
            const isConnected =
              hoveredNodeId !== null &&
              (source.id === hoveredNodeId || target.id === hoveredNodeId);

            const baseOpacity =
              hoveredNodeId !== null
                ? isConnected
                  ? 0.7
                  : 0.1
                : hoveredEdgeIdx !== null
                  ? isHovered
                    ? 0.8
                    : 0.15
                  : 0.4;

            const thickness = 1 + (edge.weight / maxEdgeWeight) * 3;
            const dashArray = getEdgeDashArray(edge.type);

            return (
              <line
                key={`edge-${i}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={t.colors.neutral[400]}
                strokeWidth={isHovered ? thickness + 1 : thickness}
                strokeOpacity={baseOpacity}
                strokeDasharray={dashArray}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-opacity 0.2s ease, stroke-width 0.15s ease',
                  cursor: onEdgeClick ? 'pointer' : 'default',
                  opacity: animationReady ? 1 : 0,
                }}
                onMouseEnter={(e) => handleEdgeEnter(i, e)}
                onMouseMove={(e) =>
                  setTooltip((prev) =>
                    prev
                      ? {
                          ...prev,
                          x: e.nativeEvent.offsetX,
                          y: e.nativeEvent.offsetY,
                        }
                      : null,
                  )
                }
                onMouseLeave={handleLeave}
                onClick={() => handleEdgeClick(i)}
              />
            );
          })}

          {/* Nodes */}
          {simNodes.map((node, i) => {
            const r = nodeRadii.get(node.id) ?? defaultSize;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedIds.has(node.id);

            const baseOpacity =
              hoveredNodeId !== null
                ? isConnected
                  ? 1
                  : 0.25
                : 1;

            return (
              <g
                key={node.id}
                style={{
                  cursor: onNodeClick ? 'pointer' : 'default',
                  opacity: animationReady ? baseOpacity : 0,
                  transition: animate
                    ? `opacity 0.5s ease ${i * 0.03}s`
                    : 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => handleNodeEnter(node, e)}
                onMouseMove={(e) =>
                  setTooltip((prev) =>
                    prev
                      ? {
                          ...prev,
                          x: e.nativeEvent.offsetX,
                          y: e.nativeEvent.offsetY,
                        }
                      : null,
                  )
                }
                onMouseLeave={handleLeave}
                onClick={() => handleNodeClick(node)}
              >
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? r + 2 : r}
                  fill={node.color}
                  stroke={isHovered ? t.colors.neutral[800] : t.colors.common.white}
                  strokeWidth={isHovered ? 2.5 : 2}
                  style={{
                    transition: 'r 0.15s ease, stroke-width 0.15s ease',
                  }}
                />

                {/* Label */}
                {showLabels && (
                  <text
                    x={node.x}
                    y={node.y + r + 14}
                    textAnchor="middle"
                    fill={t.colors.neutral[700]}
                    fontSize={t.typography.fontSize.xs}
                    fontWeight={t.typography.fontWeight.medium}
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Legend */}
          {legendItems.length > 1 && (
            <g transform={`translate(${width - 120}, 10)`}>
              {legendItems.map((item, i) => (
                <g key={item.type} transform={`translate(0, ${i * 18})`}>
                  <circle cx={6} cy={6} r={5} fill={item.color} />
                  <text
                    x={16}
                    y={6}
                    dominantBaseline="central"
                    fill={t.colors.neutral[600]}
                    fontSize={t.typography.fontSize.xs}
                  >
                    {item.label}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Edge type legend */}
          {simEdges.length > 0 && (
            <g transform={`translate(10, ${height - 50})`}>
              <line
                x1={0}
                y1={0}
                x2={20}
                y2={0}
                stroke={t.colors.neutral[400]}
                strokeWidth={1.5}
              />
              <text
                x={24}
                y={0}
                dominantBaseline="central"
                fill={t.colors.neutral[500]}
                fontSize={t.typography.fontSize.xs}
              >
                Referral
              </text>

              <line
                x1={0}
                y1={16}
                x2={20}
                y2={16}
                stroke={t.colors.neutral[400]}
                strokeWidth={1.5}
                strokeDasharray="6 3"
              />
              <text
                x={24}
                y={16}
                dominantBaseline="central"
                fill={t.colors.neutral[500]}
                fontSize={t.typography.fontSize.xs}
              >
                Collaboration
              </text>

              <line
                x1={0}
                y1={32}
                x2={20}
                y2={32}
                stroke={t.colors.neutral[400]}
                strokeWidth={1.5}
                strokeDasharray="2 3"
              />
              <text
                x={24}
                y={32}
                dominantBaseline="central"
                fill={t.colors.neutral[500]}
                fontSize={t.typography.fontSize.xs}
              >
                Reporting
              </text>
            </g>
          )}
        </svg>

        {/* Tooltip overlay */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x + 14,
              top: tooltip.y - 16,
              backgroundColor: t.colors.neutral[800],
              color: t.colors.common.white,
              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              fontSize: t.typography.fontSize.xs,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: t.shadows.md,
            }}
          >
            <div
              style={{
                fontWeight: t.typography.fontWeight.semibold,
                marginBottom: 2,
              }}
            >
              {tooltip.title}
            </div>
            {tooltip.lines.map((line, i) => (
              <div
                key={i}
                style={{ color: t.colors.neutral[300] }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
