/**
 * BhRequisitionBubble - Core Interface
 * SVG bubble chart for visualizing multi-dimensional requisition data.
 * Displays relationships between metrics with sized bubbles per category.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhRequisitionBubblePreset = 'standard';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single data point rendered as a bubble */
export interface BubbleDataPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color?: string;
  category?: string;
  tooltip?: string;
}

/** Axis configuration */
export interface BubbleAxis {
  label: string;
  min?: number;
  max?: number;
}

/** Complete bubble chart data */
export interface BubbleData {
  points: BubbleDataPoint[];
  xAxis: BubbleAxis;
  yAxis: BubbleAxis;
  sizeLabel?: string;
  categories?: { name: string; color: string }[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhRequisitionBubbleProps extends EngineAwareProps {
  preset?: BhRequisitionBubblePreset;

  /** Bubble chart data */
  data: BubbleData;

  /** SVG width in pixels */
  width?: number;

  /** SVG height in pixels */
  height?: number;

  /** Enable entrance animation */
  animate?: boolean;

  /** Callback when a bubble is clicked */
  onBubbleClick?: (point: BubbleDataPoint) => void;

  /** Show grid lines behind bubbles */
  showGrid?: boolean;

  /** Show category legend */
  showLegend?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_REQUISITION_BUBBLE_DEFAULTS: Partial<BhRequisitionBubbleProps> = {
  preset: 'standard',
  width: 600,
  height: 400,
  animate: true,
  showGrid: true,
  showLegend: true,
};
