'use client';

/**
 * BhRequisitionTreemap - Standard Preset
 * Pure SVG treemap with squarified layout algorithm, hover highlighting,
 * tooltips, truncated labels, and scale-in entrance animation.
 *
 * No D3 dependency — all layout calculations are inline.
 * Colors sourced exclusively from design tokens.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhRequisitionTreemapProps, TreemapNode } from '../../core';

/* ------------------------------------------------------------------ */
/*  Layout types                                                       */
/* ------------------------------------------------------------------ */

interface LayoutCell {
  id: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  metadata?: Record<string, any>;
  index: number;
}

/* ------------------------------------------------------------------ */
/*  Color palette from tokens                                          */
/* ------------------------------------------------------------------ */

function getCellColorPalette(t: PresetContext['tokens']): string[] {
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
    t.colors.primaryScale[300],
    t.colors.secondaryScale[300],
    t.colors.errorScale[400],
    t.colors.primaryScale[600],
    t.colors.secondaryScale[600],
    t.colors.successScale[600],
  ];
}

/* ------------------------------------------------------------------ */
/*  Squarified treemap layout algorithm                                */
/* ------------------------------------------------------------------ */

/**
 * Computes the worst aspect ratio for a row of items laid out
 * along the shorter side of the remaining rectangle.
 */
function worstAspectRatio(
  row: number[],
  sideLength: number,
): number {
  const total = row.reduce((a, b) => a + b, 0);
  if (total === 0 || sideLength === 0) return Infinity;

  let worst = 0;
  for (const area of row) {
    const rowWidth = total / sideLength;
    const itemHeight = area / rowWidth;
    const ratio = Math.max(rowWidth / itemHeight, itemHeight / rowWidth);
    worst = Math.max(worst, ratio);
  }
  return worst;
}

/**
 * Squarified treemap layout.
 * Divides the rectangle proportionally to each child's value,
 * choosing splits that minimize aspect ratios.
 */
function squarify(
  items: { id: string; label: string; value: number; color: string; metadata?: Record<string, any> }[],
  rect: { x: number; y: number; w: number; h: number },
  gap: number,
): LayoutCell[] {
  if (items.length === 0 || rect.w <= 0 || rect.h <= 0) return [];

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  if (totalValue <= 0) return [];

  // Scale values to areas
  const totalArea = rect.w * rect.h;
  const scaledItems = items.map((item) => ({
    ...item,
    area: (item.value / totalValue) * totalArea,
  }));

  // Sort by area descending for better squarification
  scaledItems.sort((a, b) => b.area - a.area);

  const cells: LayoutCell[] = [];
  let remaining = [...scaledItems];
  let currentRect = { ...rect };
  let cellIndex = 0;

  while (remaining.length > 0) {
    const shortSide = Math.min(currentRect.w, currentRect.h);
    const isHorizontal = currentRect.w >= currentRect.h;

    // Build the best row
    const row: typeof scaledItems = [];
    let rowArea = 0;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const testRow = [...row, candidate];
      const testAreas = testRow.map((r) => r.area);

      if (row.length === 0) {
        row.push(candidate);
        rowArea += candidate.area;
        continue;
      }

      const currentWorst = worstAspectRatio(
        row.map((r) => r.area),
        shortSide,
      );
      const newWorst = worstAspectRatio(testAreas, shortSide);

      if (newWorst <= currentWorst) {
        row.push(candidate);
        rowArea += candidate.area;
      } else {
        break;
      }
    }

    // Lay out the row
    const rowLength = rowArea / shortSide;
    let offset = 0;

    for (const item of row) {
      const itemLength = item.area / rowLength;

      let cellX: number, cellY: number, cellW: number, cellH: number;

      if (isHorizontal) {
        cellX = currentRect.x + gap / 2;
        cellY = currentRect.y + offset + gap / 2;
        cellW = rowLength - gap;
        cellH = itemLength - gap;
      } else {
        cellX = currentRect.x + offset + gap / 2;
        cellY = currentRect.y + gap / 2;
        cellW = itemLength - gap;
        cellH = rowLength - gap;
      }

      if (cellW > 0 && cellH > 0) {
        cells.push({
          id: item.id,
          label: item.label,
          value: item.value,
          color: item.color,
          x: cellX,
          y: cellY,
          width: cellW,
          height: cellH,
          metadata: item.metadata,
          index: cellIndex++,
        });
      }

      offset += itemLength;
    }

    // Update remaining rectangle
    if (isHorizontal) {
      currentRect = {
        x: currentRect.x + rowLength,
        y: currentRect.y,
        w: currentRect.w - rowLength,
        h: currentRect.h,
      };
    } else {
      currentRect = {
        x: currentRect.x,
        y: currentRect.y + rowLength,
        w: currentRect.w,
        h: currentRect.h - rowLength,
      };
    }

    // Remove placed items
    const rowIds = new Set(row.map((r) => r.id));
    remaining = remaining.filter((r) => !rowIds.has(r.id));
  }

  return cells;
}

/**
 * Flatten a treemap node hierarchy into leaf nodes with colors assigned.
 */
function flattenTreemapNodes(
  node: TreemapNode,
  palette: string[],
  colorIndex: { current: number },
): { id: string; label: string; value: number; color: string; metadata?: Record<string, any> }[] {
  if (!node.children || node.children.length === 0) {
    const color = node.color ?? palette[colorIndex.current % palette.length];
    colorIndex.current++;
    return [{ id: node.id, label: node.label, value: node.value, color, metadata: node.metadata }];
  }

  const items: ReturnType<typeof flattenTreemapNodes> = [];
  for (const child of node.children) {
    items.push(...flattenTreemapNodes(child, palette, colorIndex));
  }
  return items;
}

/* ------------------------------------------------------------------ */
/*  Label truncation                                                   */
/* ------------------------------------------------------------------ */

function truncateLabel(label: string, maxChars: number): string {
  if (label.length <= maxChars) return label;
  return label.slice(0, maxChars - 1) + '\u2026';
}

/* ------------------------------------------------------------------ */
/*  Tooltip type                                                       */
/* ------------------------------------------------------------------ */

interface TooltipInfo {
  x: number;
  y: number;
  label: string;
  value: string;
  metadata?: Record<string, any>;
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const StandardBhRequisitionTreemap = createPreset<BhRequisitionTreemapProps>({
  name: 'BhRequisitionTreemap.Standard',
  render: (ctx: PresetContext<BhRequisitionTreemapProps>) => {
    const { props, tokens: t } = ctx;

    const {
      data,
      width = 600,
      height = 400,
      animate = true,
      onCellClick,
      showLabels = true,
      padding = 2,
      className,
      style,
    } = props;

    const root = data?.root;
    const valueLabel = data?.valueLabel ?? 'Value';

    const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
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

    const palette = useMemo(() => getCellColorPalette(t), [t]);

    // Flatten nodes and compute layout
    const cells = useMemo(() => {
      if (!root) return [];

      const colorIndex = { current: 0 };
      const items = flattenTreemapNodes(root, palette, colorIndex);

      // Filter out zero/negative values
      const validItems = items.filter((item) => item.value > 0);
      if (validItems.length === 0) return [];

      return squarify(
        validItems,
        { x: 0, y: 0, w: width, h: height },
        padding,
      );
    }, [root, width, height, padding, palette]);

    const handleCellEnter = useCallback(
      (cell: LayoutCell, e: React.MouseEvent) => {
        setHoveredId(cell.id);
        setTooltip({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          label: cell.label,
          value: `${valueLabel}: ${cell.value.toLocaleString()}`,
          metadata: cell.metadata,
        });
      },
      [valueLabel],
    );

    const handleCellMove = useCallback(
      (e: React.MouseEvent) => {
        setTooltip((prev) =>
          prev
            ? {
                ...prev,
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY,
              }
            : null,
        );
      },
      [],
    );

    const handleCellLeave = useCallback(() => {
      setHoveredId(null);
      setTooltip(null);
    }, []);

    const handleCellClick = useCallback(
      (cell: LayoutCell) => {
        if (!onCellClick) return;
        onCellClick({
          id: cell.id,
          label: cell.label,
          value: cell.value,
          metadata: cell.metadata,
        });
      },
      [onCellClick],
    );

    /* -- Empty state ------------------------------------------------ */
    if (cells.length === 0) {
      return (
        <svg
          className={className}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="No treemap data"
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
          aria-label={`Treemap: ${cells.length} categories`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {cells.map((cell) => {
            const isHovered = hoveredId === cell.id;
            const canShowLabel =
              showLabels && cell.width > 40 && cell.height > 40;
            const canShowValue =
              showLabels && cell.width > 40 && cell.height > 56;

            // Estimate max chars that fit (approx 7px per char at xs size)
            const maxChars = Math.floor(cell.width / 7);

            return (
              <g
                key={cell.id}
                style={{
                  cursor: onCellClick ? 'pointer' : 'default',
                }}
                onMouseEnter={(e) => handleCellEnter(cell, e)}
                onMouseMove={handleCellMove}
                onMouseLeave={handleCellLeave}
                onClick={() => handleCellClick(cell)}
              >
                <rect
                  x={cell.x}
                  y={cell.y}
                  width={animationReady ? cell.width : 0}
                  height={animationReady ? cell.height : 0}
                  fill={cell.color}
                  fillOpacity={isHovered ? 0.95 : 0.8}
                  stroke={isHovered ? t.colors.neutral[800] : t.colors.neutral[200]}
                  strokeWidth={isHovered ? 2 : 1}
                  rx={2}
                  ry={2}
                  style={{
                    transition: animate
                      ? `width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${cell.index * 0.03}s, height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${cell.index * 0.03}s, fill-opacity 0.15s ease, stroke-width 0.15s ease`
                      : 'fill-opacity 0.15s ease, stroke-width 0.15s ease',
                    transformOrigin: `${cell.x + cell.width / 2}px ${cell.y + cell.height / 2}px`,
                  }}
                />

                {/* Label text */}
                {canShowLabel && animationReady && (
                  <text
                    x={cell.x + cell.width / 2}
                    y={cell.y + cell.height / 2 - (canShowValue ? 6 : 0)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={t.colors.common.white}
                    fontSize={t.typography.fontSize.xs}
                    fontWeight={t.typography.fontWeight.semibold}
                    style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {truncateLabel(cell.label, maxChars)}
                  </text>
                )}

                {/* Value text */}
                {canShowValue && animationReady && (
                  <text
                    x={cell.x + cell.width / 2}
                    y={cell.y + cell.height / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={t.colors.common.white}
                    fontSize={t.typography.fontSize.xs}
                    style={{
                      pointerEvents: 'none',
                      opacity: 0.85,
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {cell.value.toLocaleString()}
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
              {tooltip.label}
            </div>
            <div style={{ color: t.colors.neutral[300] }}>
              {tooltip.value}
            </div>
            {tooltip.metadata &&
              Object.entries(tooltip.metadata).map(([key, val]) => (
                <div
                  key={key}
                  style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.xs }}
                >
                  {key}: {String(val)}
                </div>
              ))}
          </div>
        )}
      </div>
    );
  },
});
