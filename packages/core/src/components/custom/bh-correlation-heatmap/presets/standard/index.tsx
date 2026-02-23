'use client';

/**
 * BhCorrelationHeatmap - Standard Preset
 * Grid-based heatmap visualization using Box elements with token color scales.
 * Renders a correlation matrix with colored cells, axis labels,
 * hover tooltips, and a color legend bar.
 */

import { useState, useMemo, useRef, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  getCardPadding,
  ICON_SIZES,
} from '../../../helpers';
import type {
  BhCorrelationHeatmapProps,
  HeatmapCell,
} from '../../core';
import {
  getHeatmapCellColor,
  getHeatmapTextColor,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Grid3X3, Info } from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Tooltip sub-component
 * -------------------------------------------------------------------------*/

let _Box: any;
let _Text: any;

function HeatmapTooltip({
  cell, xLabels, yLabels, tokens: t, x, y,
}: {
  cell: HeatmapCell; xLabels: string[]; yLabels: string[];
  tokens: DesignTokens; x: number; y: number;
}) {
  const Box = _Box;
  const Text = _Text;
  const xLabel = xLabels[cell.col] ?? `Col ${cell.col}`;
  const yLabel = yLabels[cell.row] ?? `Row ${cell.row}`;

  return (
    <Box style={{
      position: 'fixed' as const, left: x + 12, top: y - 8,
      zIndex: 1000,
      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
      borderRadius: t.borderRadius.md,
      backgroundColor: t.colors.neutral[900],
      color: t.colors.common.white,
      fontSize: t.typography.fontSize.xs,
      boxShadow: t.shadows.lg,
      pointerEvents: 'none' as const,
      whiteSpace: 'nowrap' as const,
      display: 'flex', flexDirection: 'column' as const, gap: 2,
    }}>
      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>
        {yLabel} x {xLabel}
      </Text>
      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>
        Value: {cell.value.toFixed(3)}
      </Text>
      {cell.label && (
        <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>{cell.label}</Text>
      )}
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Color Legend sub-component
 * -------------------------------------------------------------------------*/

function ColorLegend({ range, tokens: t }: { range: [number, number]; tokens: DesignTokens }) {
  const Box = _Box;
  const Text = _Text;
  const steps = 11;
  const [min, max] = range;
  const stepSize = (max - min) / (steps - 1);

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[3] }}>
      <Text style={{ fontSize: 9, color: t.colors.neutral[500], minWidth: 32, textAlign: 'right' as const }}>{min.toFixed(1)}</Text>
      <Box style={{ display: 'flex', flex: 1, height: 12, borderRadius: t.borderRadius.sm, overflow: 'hidden' as const }}>
        {Array.from({ length: steps }).map((_, i) => {
          const val = min + i * stepSize;
          return (
            <Box key={i} style={{
              flex: 1, height: '100%',
              backgroundColor: getHeatmapCellColor(t, val, range),
            }} />
          );
        })}
      </Box>
      <Text style={{ fontSize: 9, color: t.colors.neutral[500], minWidth: 32 }}>{max.toFixed(1)}</Text>
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Skeleton
 * -------------------------------------------------------------------------*/

function HeatmapSkeleton({ tokens: t }: { tokens: DesignTokens }) {
  const Box = _Box;
  const skeleton = createPersonalitySkeletonStyle(t);
  return (
    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
      <Box style={{ ...skeleton, width: '40%', height: 16 }} />
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
        {Array.from({ length: 36 }).map((_, i) => (
          <Box key={i} style={{ ...skeleton, height: 40, borderRadius: t.borderRadius.sm }} />
        ))}
      </Box>
      <Box style={{ ...skeleton, width: '100%', height: 12 }} />
    </Box>
  );
}

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const StandardBhCorrelationHeatmap = createPreset<BhCorrelationHeatmapProps>({
  name: 'BhCorrelationHeatmap.Standard',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCorrelationHeatmapProps>) => {
    const { Box, Text } = primitives;
    _Box = Box;
    _Text = Text;

    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const {
      cells: rawCells = [],
      xAxis,
      yAxis,
      title,
      onCellClick,
      colorRange: rangeProp,
      loading = false,
      className,
      style,
    } = props;

    const cells = Array.isArray(rawCells) ? rawCells : [];
    const xLabels = xAxis?.labels ?? [];
    const yLabels = yAxis?.labels ?? [];
    const range: [number, number] = rangeProp ?? [-1, 1];

    const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Build a map for quick cell lookup
    const cellMap = useMemo(() => {
      const map = new Map<string, HeatmapCell>();
      cells.forEach(c => map.set(`${c.row}-${c.col}`, c));
      return map;
    }, [cells]);

    const numCols = xLabels.length;
    const numRows = yLabels.length;
    const cellSize = 44;

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }, []);

    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          padding: getCardPadding(t), ...style,
        }}>
          <HeatmapSkeleton tokens={t} />
        </Box>
      );
    }

    if (numCols === 0 || numRows === 0) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm' }),
          padding: getCardPadding(t), ...style,
        }}>
          <Box style={createEmptyStateStyle(t)}>
            <Grid3X3 size={ICON_SIZES.illustration} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], marginBottom: t.spacing[2] }}>
              No heatmap data
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              Provide axis labels and cell data to render the heatmap.
            </Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'sm' }),
        padding: getCardPadding(t),
        display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
        ...style,
      }}>
        {/* Title */}
        {title && (
          <Text style={{
            fontSize: t.typography.fontSize.md,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[900],
          }}>{title}</Text>
        )}

        {/* Heatmap Grid */}
        <Box style={{ overflowX: 'auto' as const }}>
          <Box style={{
            display: 'inline-flex', flexDirection: 'column' as const,
          }}>
            {/* Column labels row */}
            <Box style={{
              display: 'flex', alignItems: 'flex-end',
              marginLeft: 100, marginBottom: t.spacing[1],
            }}>
              {xLabels.map((label, colIdx) => (
                <Box key={colIdx} style={{
                  width: cellSize, display: 'flex', justifyContent: 'center',
                }}>
                  <Box style={{
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'center center',
                    whiteSpace: 'nowrap' as const,
                    fontSize: 9,
                    color: t.colors.neutral[600],
                    fontWeight: t.typography.fontWeight.medium,
                    maxWidth: cellSize * 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    <Text style={{ fontSize: 9 }}>{label}</Text>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Grid rows */}
            {yLabels.map((rowLabel, rowIdx) => (
              <Box key={rowIdx} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Row label */}
                <Box style={{
                  width: 100, flexShrink: 0,
                  paddingRight: t.spacing[2],
                  textAlign: 'right' as const,
                }}>
                  <Text style={{
                    fontSize: 9, color: t.colors.neutral[600],
                    fontWeight: t.typography.fontWeight.medium,
                    whiteSpace: 'nowrap' as const,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                  }}>{rowLabel}</Text>
                </Box>

                {/* Cells */}
                {xLabels.map((_, colIdx) => {
                  const cell = cellMap.get(`${rowIdx}-${colIdx}`);
                  const value = cell?.value ?? 0;
                  const bgColor = getHeatmapCellColor(t, value, range);
                  const textColor = getHeatmapTextColor(t, value, range);
                  const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;

                  return (
                    <Box
                      key={colIdx}
                      onClick={() => cell && onCellClick?.(cell)}
                      onMouseEnter={() => cell && setHoveredCell(cell)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        width: cellSize, height: cellSize,
                        backgroundColor: bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: onCellClick ? 'pointer' : 'default',
                        border: isHovered
                          ? `2px solid ${t.colors.neutral[900]}`
                          : `1px solid ${t.colors.common.white}`,
                        borderRadius: t.borderRadius.sm,
                        transition: `border ${t.motion.hover}`,
                        fontSize: 9,
                        fontWeight: t.typography.fontWeight.medium,
                        color: textColor,
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ fontSize: 9, color: textColor }}>{cell ? value.toFixed(2) : ''}</Text>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tooltip */}
        {hoveredCell && (
          <HeatmapTooltip
            cell={hoveredCell}
            xLabels={xLabels}
            yLabels={yLabels}
            tokens={t}
            x={tooltipPos.x}
            y={tooltipPos.y}
          />
        )}

        {/* Color Legend */}
        <ColorLegend range={range} tokens={t} />

        {/* Info line */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
          <Info size={ICON_SIZES.inline} style={{ color: t.colors.neutral[300] }} />
          <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>
            {cells.length} cells across {numRows} rows and {numCols} columns. Hover for details.
          </Text>
        </Box>
      </Box>
    );
  },
});
