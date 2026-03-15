/**
 * BhSimulationChart - Core Interface
 * SVG histogram for simulation distribution visualization with percentile
 * markers, target line, and interactive hover tooltips.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhSimulationChartPreset = 'standard';

// =============================================================================
// DATA TYPES
// =============================================================================

/**
 * Distribution data for the chart
 */
export interface DistributionData {
  buckets: { value: number; frequency: number }[];
  mean: number;
  median: number;
  p10: number;
  p90: number;
  target?: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhSimulationChartProps extends EngineAwareProps {
  preset?: BhSimulationChartPreset;

  /** Distribution data to render */
  data: DistributionData;

  /** Chart width in pixels */
  width?: number;

  /** Chart height in pixels */
  height?: number;

  /** Show P10/P90 percentile markers */
  showPercentiles?: boolean;

  /** Show target line */
  showTarget?: boolean;

  /** Enable entrance animation */
  animate?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_SIMULATION_CHART_DEFAULTS: Partial<BhSimulationChartProps> = {
  preset: 'standard',
  width: 500,
  height: 260,
  showPercentiles: true,
  showTarget: true,
  animate: true,
};
