/**
 * BhCandidateFlowSankey - Core Interface
 * SVG Sankey diagram for visualizing candidate flow across pipeline stages.
 * Used for DEI pipeline analysis and candidate funnel by source.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhCandidateFlowSankeyPreset = 'standard';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A node in the Sankey diagram */
export interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color?: string;
  level: number;
}

/** A link connecting two nodes */
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

/** Complete Sankey data structure */
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhCandidateFlowSankeyProps extends EngineAwareProps {
  preset?: BhCandidateFlowSankeyPreset;

  /** Sankey diagram data (nodes and links) */
  data: SankeyData;

  /** SVG width in pixels */
  width?: number;

  /** SVG height in pixels */
  height?: number;

  /** Width of each node rectangle in pixels */
  nodeWidth?: number;

  /** Vertical padding between nodes in pixels */
  nodePadding?: number;

  /** Enable entrance animation for links */
  animate?: boolean;

  /** Callback when a node is clicked */
  onNodeClick?: (node: SankeyNode) => void;

  /** Callback when a link is hovered */
  onLinkHover?: (link: SankeyLink | null) => void;

  /** Show value labels on nodes and links */
  showValues?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_CANDIDATE_FLOW_SANKEY_DEFAULTS: Partial<BhCandidateFlowSankeyProps> = {
  preset: 'standard',
  width: 700,
  height: 400,
  nodeWidth: 20,
  nodePadding: 16,
  animate: true,
  showValues: true,
};
