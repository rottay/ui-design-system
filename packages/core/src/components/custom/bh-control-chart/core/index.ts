/**
 * BhControlChart - Core Interface
 * SVG Statistical Process Control (SPC) chart for visualizing
 * interviewer scoring patterns with control limits and zones.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhControlChartPreset = 'standard';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single data point on the control chart */
export interface ControlChartDataPoint {
  /** Date string (ISO or display format) */
  date: string;
  /** The score value */
  value: number;
  /** Whether this point is outside control limits */
  isOutlier?: boolean;
  /** Optional label for tooltip (e.g., candidate name) */
  label?: string;
}

/** Control limits for the SPC chart */
export interface ControlChartLimits {
  /** Upper Control Limit (3 sigma) */
  ucl: number;
  /** Lower Control Limit (3 sigma) */
  lcl: number;
  /** Center line (process mean) */
  centerLine: number;
  /** Upper warning limit (2 sigma) */
  upperWarning?: number;
  /** Lower warning limit (2 sigma) */
  lowerWarning?: number;
}

/** Complete data set for a control chart */
export interface ControlChartData {
  /** Score data points in chronological order */
  dataPoints: ControlChartDataPoint[];
  /** SPC control limits */
  controlLimits: ControlChartLimits;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhControlChartProps extends EngineAwareProps {
  /** Which preset to render */
  preset?: BhControlChartPreset;

  /** Chart data with data points and control limits */
  data: ControlChartData;

  /** SVG width in pixels */
  width?: number;

  /** SVG height in pixels */
  height?: number;

  /** Whether to render zone shading (A, B, C zones) */
  showZones?: boolean;

  /** Whether to render axis labels */
  showLabels?: boolean;

  /** Whether to animate the line drawing on mount */
  animate?: boolean;

  /** Callback when a data point is clicked */
  onPointClick?: (point: ControlChartDataPoint, index: number) => void;

  /** Chart title displayed above the SVG */
  title?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_CONTROL_CHART_DEFAULTS: Partial<BhControlChartProps> = {
  preset: 'standard',
  width: 600,
  height: 300,
  showZones: true,
  showLabels: true,
  animate: true,
};
