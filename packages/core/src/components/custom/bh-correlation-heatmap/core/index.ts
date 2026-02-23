/**
 * BhCorrelationHeatmap - Core Interface
 * Grid-based heatmap visualization for correlation matrices.
 * Uses Box elements with token color scales (no D3 dependency).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhCorrelationHeatmapPreset = 'standard';

export interface HeatmapCell {
  row: number;
  col: number;
  value: number;
  label?: string;
}

export interface HeatmapAxis {
  labels: string[];
}

export interface BhCorrelationHeatmapProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhCorrelationHeatmapPreset;

  /** Cell data for the heatmap */
  cells: HeatmapCell[];

  /** X-axis labels */
  xAxis: HeatmapAxis;

  /** Y-axis labels */
  yAxis: HeatmapAxis;

  /** Title of the heatmap */
  title?: string;

  /** Callback when a cell is clicked */
  onCellClick?: (cell: HeatmapCell) => void;

  /** Color range boundaries: [min, max] */
  colorRange?: [number, number];

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CORRELATION_HEATMAP_DEFAULTS: Partial<BhCorrelationHeatmapProps> = {
  preset: 'standard',
  colorRange: [-1, 1],
};

/**
 * Returns a color for a heatmap cell value based on the range.
 * Positive values use primaryScale, negative use errorScale, near-zero use neutral.
 */
export function getHeatmapCellColor(tokens: DesignTokens, value: number, range: [number, number]): string {
  const [min, max] = range;
  const normalized = (value - min) / (max - min); // 0 to 1

  if (value > 0) {
    // Positive: primaryScale gradient
    if (normalized > 0.85) return tokens.colors.primaryScale[700];
    if (normalized > 0.75) return tokens.colors.primaryScale[600];
    if (normalized > 0.65) return tokens.colors.primaryScale[500];
    if (normalized > 0.55) return tokens.colors.primaryScale[400];
    return tokens.colors.primaryScale[200];
  } else if (value < 0) {
    // Negative: errorScale gradient
    const absNorm = 1 - normalized; // flip for negative
    if (absNorm > 0.85) return tokens.colors.errorScale[700];
    if (absNorm > 0.75) return tokens.colors.errorScale[600];
    if (absNorm > 0.65) return tokens.colors.errorScale[500];
    if (absNorm > 0.55) return tokens.colors.errorScale[400];
    return tokens.colors.errorScale[200];
  }

  return tokens.colors.neutral[100];
}

/**
 * Returns text color for readability on a heatmap cell
 */
export function getHeatmapTextColor(tokens: DesignTokens, value: number, range: [number, number]): string {
  const abs = Math.abs(value);
  const rangeSize = Math.abs(range[1] - range[0]);
  const intensity = abs / (rangeSize / 2);

  if (intensity > 0.6) return tokens.colors.common.white;
  return tokens.colors.neutral[800];
}
