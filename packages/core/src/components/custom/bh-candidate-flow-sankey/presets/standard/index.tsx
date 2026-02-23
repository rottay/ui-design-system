'use client';

/**
 * BhCandidateFlowSankey - Standard Preset
 * Pure SVG Sankey diagram with cubic bezier link paths, proportional node
 * sizing, hover tooltips, and entrance animation.
 *
 * No D3 dependency — all layout calculations are inline.
 * Colors sourced exclusively from design tokens.
 */

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhCandidateFlowSankeyProps, SankeyNode, SankeyLink } from '../../core';

/* ------------------------------------------------------------------ */
/*  Types for computed layout                                          */
/* ------------------------------------------------------------------ */

interface LayoutNode {
  id: string;
  label: string;
  value: number;
  color: string;
  level: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutLink {
  source: string;
  target: string;
  value: number;
  color: string;
  sourceName: string;
  targetName: string;
  path: string;
  thickness: number;
}

/* ------------------------------------------------------------------ */
/*  Token color palette for auto-assignment                            */
/* ------------------------------------------------------------------ */

function getNodeColorPalette(t: PresetContext['tokens']): string[] {
  return [
    t.colors.primaryScale[500],
    t.colors.secondaryScale[500],
    t.colors.successScale[500],
    t.colors.warningScale[500],
    t.colors.infoScale[500],
    t.colors.primaryScale[400],
    t.colors.secondaryScale[400],
    t.colors.successScale[400],
    t.colors.warningScale[400],
    t.colors.infoScale[400],
    t.colors.primaryScale[600],
    t.colors.secondaryScale[600],
  ];
}

/* ------------------------------------------------------------------ */
/*  Sankey layout algorithm                                            */
/* ------------------------------------------------------------------ */

function computeSankeyLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  width: number,
  height: number,
  nodeWidth: number,
  nodePadding: number,
  palette: string[],
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } {
  if (nodes.length === 0) return { layoutNodes: [], layoutLinks: [] };

  const padding = { top: 20, right: 40, bottom: 20, left: 40 };
  const drawWidth = width - padding.left - padding.right;
  const drawHeight = height - padding.top - padding.bottom;

  // Group nodes by level
  const levels = new Map<number, SankeyNode[]>();
  for (const node of nodes) {
    const lvl = levels.get(node.level) ?? [];
    lvl.push(node);
    levels.set(node.level, lvl);
  }

  const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b);
  const numLevels = sortedLevels.length;

  // Calculate horizontal positions
  const levelSpacing = numLevels > 1 ? (drawWidth - nodeWidth) / (numLevels - 1) : 0;

  // Compute total value at each level for proportional height
  const levelTotals = new Map<number, number>();
  for (const [level, levelNodes] of levels) {
    const total = levelNodes.reduce((sum, n) => sum + Math.max(n.value, 1), 0);
    levelTotals.set(level, total);
  }

  // Position nodes
  const nodeMap = new Map<string, LayoutNode>();
  let colorIdx = 0;

  for (let li = 0; li < sortedLevels.length; li++) {
    const level = sortedLevels[li];
    const levelNodes = levels.get(level)!;
    const totalValue = levelTotals.get(level)!;
    const totalPadding = (levelNodes.length - 1) * nodePadding;
    const availableHeight = drawHeight - totalPadding;

    let currentY = padding.top;
    const x = padding.left + li * levelSpacing;

    for (const node of levelNodes) {
      const nodeHeight = Math.max((node.value / totalValue) * availableHeight, 4);
      const color = node.color ?? palette[colorIdx % palette.length];
      colorIdx++;

      const layoutNode: LayoutNode = {
        id: node.id,
        label: node.label,
        value: node.value,
        color,
        level: node.level,
        x,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
      };

      nodeMap.set(node.id, layoutNode);
      currentY += nodeHeight + nodePadding;
    }
  }

  // Track vertical offsets for link attachment points
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();

  // Sort links by value (largest first) for better visual stacking
  const sortedLinks = [...links].sort((a, b) => b.value - a.value);

  // Compute links
  const layoutLinks: LayoutLink[] = [];
  const maxLinkValue = Math.max(...links.map((l) => l.value), 1);

  for (const link of sortedLinks) {
    const sourceNode = nodeMap.get(link.source);
    const targetNode = nodeMap.get(link.target);
    if (!sourceNode || !targetNode) continue;

    // Link thickness proportional to value relative to source node height
    const sourceTotal = nodes
      .filter((n) => n.id === link.source)
      .reduce((s, n) => s + n.value, 0);
    const thickness = Math.max(
      (link.value / Math.max(sourceTotal, 1)) * sourceNode.height,
      2,
    );

    // Source attachment point (right side of source node)
    const srcOffset = sourceOffsets.get(link.source) ?? 0;
    const sy = sourceNode.y + srcOffset + thickness / 2;
    sourceOffsets.set(link.source, srcOffset + thickness);

    // Target attachment point (left side of target node)
    const tgtOffset = targetOffsets.get(link.target) ?? 0;
    const ty = targetNode.y + tgtOffset + thickness / 2;
    targetOffsets.set(link.target, tgtOffset + thickness);

    const sx = sourceNode.x + sourceNode.width;
    const tx = targetNode.x;

    // Cubic bezier path
    const midX = (sx + tx) / 2;
    const path = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;

    const color = link.color ?? sourceNode.color;

    layoutLinks.push({
      source: link.source,
      target: link.target,
      value: link.value,
      color,
      sourceName: sourceNode.label,
      targetName: targetNode.label,
      path,
      thickness,
    });
  }

  return { layoutNodes: Array.from(nodeMap.values()), layoutLinks };
}

/* ------------------------------------------------------------------ */
/*  Tooltip component                                                  */
/* ------------------------------------------------------------------ */

interface TooltipInfo {
  x: number;
  y: number;
  content: string;
  subContent?: string;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const StandardBhCandidateFlowSankey = createPreset<BhCandidateFlowSankeyProps>({
  name: 'BhCandidateFlowSankey.Standard',
  render: (ctx: PresetContext<BhCandidateFlowSankeyProps>) => {
    const { props, tokens: t } = ctx;

    const {
      data,
      width = 700,
      height = 400,
      nodeWidth = 20,
      nodePadding = 16,
      animate = true,
      onNodeClick,
      onLinkHover,
      showValues = true,
      className,
      style,
    } = props;

    const nodes = data?.nodes ?? [];
    const links = data?.links ?? [];

    const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
    const [hoveredLink, setHoveredLink] = useState<number | null>(null);
    const [animationReady, setAnimationReady] = useState(!animate);
    const svgRef = useRef<SVGSVGElement>(null);

    const palette = useMemo(() => getNodeColorPalette(t), [t]);

    const { layoutNodes, layoutLinks } = useMemo(
      () => computeSankeyLayout(nodes, links, width, height, nodeWidth, nodePadding, palette),
      [nodes, links, width, height, nodeWidth, nodePadding, palette],
    );

    // Entrance animation
    useEffect(() => {
      if (!animate) {
        setAnimationReady(true);
        return;
      }
      const timer = setTimeout(() => setAnimationReady(true), 50);
      return () => clearTimeout(timer);
    }, [animate]);

    // Determine label positions based on levels
    const sortedLevels = useMemo(() => {
      const levels = new Set(nodes.map((n) => n.level));
      return Array.from(levels).sort((a, b) => a - b);
    }, [nodes]);

    const minLevel = sortedLevels[0] ?? 0;
    const maxLevel = sortedLevels[sortedLevels.length - 1] ?? 0;

    const handleLinkEnter = useCallback(
      (link: LayoutLink, index: number, e: React.MouseEvent) => {
        setHoveredLink(index);
        setTooltip({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY - 10,
          content: `${link.sourceName} → ${link.targetName}`,
          subContent: `${link.value} candidates`,
        });
        onLinkHover?.({
          source: link.source,
          target: link.target,
          value: link.value,
          color: link.color,
        });
      },
      [onLinkHover],
    );

    const handleLinkLeave = useCallback(() => {
      setHoveredLink(null);
      setTooltip(null);
      onLinkHover?.(null);
    }, [onLinkHover]);

    const handleNodeClick = useCallback(
      (node: LayoutNode) => {
        if (!onNodeClick) return;
        onNodeClick({
          id: node.id,
          label: node.label,
          value: node.value,
          level: node.level,
        });
      },
      [onNodeClick],
    );

    // Unique IDs for gradients
    const idPrefix = useMemo(
      () => `sankey-${Math.random().toString(36).slice(2, 9)}`,
      [],
    );

    /* -- Empty state ------------------------------------------------ */
    if (layoutNodes.length === 0) {
      return (
        <svg
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="No candidate flow data"
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
          ref={svgRef}
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Candidate flow diagram: ${layoutNodes.length} stages, ${layoutLinks.length} flows`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Links */}
          {layoutLinks.map((link, i) => {
            const isHovered = hoveredLink === i;
            const opacity = hoveredLink !== null ? (isHovered ? 0.7 : 0.15) : 0.3;

            return (
              <path
                key={`link-${i}`}
                d={link.path}
                fill="none"
                stroke={link.color}
                strokeWidth={link.thickness}
                strokeOpacity={opacity}
                strokeLinecap="butt"
                style={{
                  transition: 'stroke-opacity 0.2s ease',
                  cursor: 'pointer',
                  ...(animate
                    ? {
                        strokeDasharray: animationReady ? 'none' : '2000',
                        strokeDashoffset: animationReady ? '0' : '2000',
                        ...(animationReady
                          ? {}
                          : { transition: 'stroke-dashoffset 0.8s ease-out' }),
                      }
                    : {}),
                }}
                onMouseEnter={(e) => handleLinkEnter(link, i, e)}
                onMouseMove={(e) => {
                  setTooltip((prev) =>
                    prev
                      ? {
                          ...prev,
                          x: e.nativeEvent.offsetX,
                          y: e.nativeEvent.offsetY - 10,
                        }
                      : null,
                  );
                }}
                onMouseLeave={handleLinkLeave}
              />
            );
          })}

          {/* Nodes */}
          {layoutNodes.map((node) => {
            const isFirst = node.level === minLevel;
            const isLast = node.level === maxLevel;

            return (
              <g
                key={`node-${node.id}`}
                style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
                onClick={() => handleNodeClick(node)}
              >
                {/* Node rectangle */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={node.color}
                  rx={2}
                  ry={2}
                  style={{
                    opacity: animationReady ? 1 : 0,
                    transition: 'opacity 0.4s ease-out',
                  }}
                />

                {/* Node label */}
                <text
                  x={
                    isFirst
                      ? node.x - 6
                      : isLast
                        ? node.x + node.width + 6
                        : node.x + node.width / 2
                  }
                  y={
                    isFirst || isLast
                      ? node.y + node.height / 2
                      : node.y - 6
                  }
                  textAnchor={isFirst ? 'end' : isLast ? 'start' : 'middle'}
                  dominantBaseline={
                    isFirst || isLast ? 'central' : 'auto'
                  }
                  fill={t.colors.neutral[700]}
                  fontSize={t.typography.fontSize.xs}
                  fontWeight={t.typography.fontWeight.medium}
                  style={{
                    opacity: animationReady ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.3s',
                    pointerEvents: 'none',
                  }}
                >
                  {node.label}
                </text>

                {/* Value label */}
                {showValues && node.height >= 16 && (
                  <text
                    x={
                      isFirst
                        ? node.x - 6
                        : isLast
                          ? node.x + node.width + 6
                          : node.x + node.width / 2
                    }
                    y={
                      isFirst || isLast
                        ? node.y + node.height / 2 + 14
                        : node.y - 6 + 14
                    }
                    textAnchor={isFirst ? 'end' : isLast ? 'start' : 'middle'}
                    fill={t.colors.neutral[500]}
                    fontSize={t.typography.fontSize.xs}
                    style={{
                      opacity: animationReady ? 1 : 0,
                      transition: 'opacity 0.4s ease-out 0.4s',
                      pointerEvents: 'none',
                    }}
                  >
                    {node.value.toLocaleString()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip overlay */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              backgroundColor: t.colors.neutral[800],
              color: t.colors.common.white,
              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: t.shadows.md,
            }}
          >
            <div>{tooltip.content}</div>
            {tooltip.subContent && (
              <div
                style={{
                  color: t.colors.neutral[300],
                  fontSize: t.typography.fontSize.xs,
                  marginTop: 2,
                }}
              >
                {tooltip.subContent}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
});
