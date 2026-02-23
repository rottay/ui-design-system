/**
 * BhEngagementSparkline - Core Interface
 * SVG-based sparkline for displaying engagement score history.
 * Used inline within candidate rows and dashboard cards.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhEngagementSparklinePreset = 'standard';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single data point in the sparkline */
export interface SparklineDataPoint {
  date: string;
  value: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhEngagementSparklineProps extends EngineAwareProps {
  preset?: BhEngagementSparklinePreset;

  /** Array of data points to render */
  dataPoints: SparklineDataPoint[];

  /** Width of the sparkline SVG in px */
  width?: number;

  /** Height of the sparkline SVG in px */
  height?: number;

  /** Primary line color — defaults to primaryScale[500] */
  color?: string;

  /** Whether to show a filled area under the line */
  showArea?: boolean;

  /** Whether to show dots on each data point */
  showDots?: boolean;

  /** Whether to animate the line drawing on mount */
  animate?: boolean;

  /** Threshold value — line turns to thresholdColor below this */
  threshold?: number;

  /** Color for the threshold line and below-threshold segments */
  thresholdColor?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_ENGAGEMENT_SPARKLINE_DEFAULTS: Partial<BhEngagementSparklineProps> = {
  preset: 'standard',
  width: 120,
  height: 32,
  showArea: false,
  showDots: false,
  animate: true,
};

/** Re-export n helper for convenience */
export { n };
