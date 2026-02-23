/**
 * BhRequisitionTreemap - Core Interface
 * SVG treemap for visualizing hierarchical requisition data
 * with proportional area rectangles and squarified layout.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhRequisitionTreemapPreset = 'standard';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A node in the treemap hierarchy */
export interface TreemapNode {
  id: string;
  label: string;
  value: number;
  color?: string;
  children?: TreemapNode[];
  metadata?: Record<string, any>;
}

/** Complete treemap data */
export interface TreemapData {
  root: TreemapNode;
  valueLabel?: string;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhRequisitionTreemapProps extends EngineAwareProps {
  preset?: BhRequisitionTreemapPreset;

  /** Treemap data (hierarchical) */
  data: TreemapData;

  /** SVG width in pixels */
  width?: number;

  /** SVG height in pixels */
  height?: number;

  /** Enable entrance animation */
  animate?: boolean;

  /** Callback when a cell is clicked */
  onCellClick?: (node: TreemapNode) => void;

  /** Show labels on cells */
  showLabels?: boolean;

  /** Padding between cells in pixels */
  padding?: number;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_REQUISITION_TREEMAP_DEFAULTS: Partial<BhRequisitionTreemapProps> = {
  preset: 'standard',
  width: 600,
  height: 400,
  animate: true,
  showLabels: true,
  padding: 2,
};
