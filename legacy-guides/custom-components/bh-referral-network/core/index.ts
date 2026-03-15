/**
 * BhReferralNetwork - Core Interface
 * SVG force-directed graph for visualizing referral and collaboration
 * networks with spring-physics simulation.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhReferralNetworkPreset = 'standard';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A node in the network graph */
export interface NetworkNode {
  id: string;
  label: string;
  type: 'person' | 'team' | 'department' | 'company';
  size?: number;
  color?: string;
  metadata?: Record<string, any>;
}

/** An edge connecting two nodes */
export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  label?: string;
  type?: 'referral' | 'collaboration' | 'reporting';
}

/** Complete network data */
export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhReferralNetworkProps extends EngineAwareProps {
  preset?: BhReferralNetworkPreset;

  /** Network data (nodes and edges) */
  data: NetworkData;

  /** SVG width in pixels */
  width?: number;

  /** SVG height in pixels */
  height?: number;

  /** Enable entrance animation */
  animate?: boolean;

  /** Callback when a node is clicked */
  onNodeClick?: (node: NetworkNode) => void;

  /** Callback when an edge is clicked */
  onEdgeClick?: (edge: NetworkEdge) => void;

  /** Show labels on nodes */
  showLabels?: boolean;

  /** Charge repulsion strength (negative value) */
  chargeStrength?: number;

  /** Target link distance in pixels */
  linkDistance?: number;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_REFERRAL_NETWORK_DEFAULTS: Partial<BhReferralNetworkProps> = {
  preset: 'standard',
  width: 600,
  height: 400,
  animate: true,
  showLabels: true,
  chargeStrength: -120,
  linkDistance: 80,
};
