/**
 * BhProctoringSeverity - Core Interface
 * Interactive visualization of events grouped by severity
 *
 * Uses ProctoringEventSeverityValue from @rottay/scoring for severity type reference.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringSeverityPreset = 'donut' | 'bars';

/** Backward-compat alias (old name from pre-migration) */
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

export interface SeverityCount {
  severity: ProctoringEventSeverity;
  count: number;
}

export interface BhProctoringSeverityProps extends EngineAwareProps {
  preset?: BhProctoringSeverityPreset;

  /** Severity distribution data */
  severityCounts?: SeverityCount[];

  /** Callback when a severity segment is clicked */
  onSeverityClick?: (severity: ProctoringEventSeverity) => void;

  /** Currently selected severity filter */
  selectedSeverity?: ProctoringEventSeverity | null;

  /** Show labels on the chart */
  showLabels?: boolean;

  /** Show percentage values */
  showPercentages?: boolean;

  /** Chart size (diameter for donut, width for bars) */
  size?: number;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_SEVERITY_DEFAULTS: Partial<BhProctoringSeverityProps> = {
  preset: 'donut',
  showLabels: true,
  showPercentages: true,
  size: 180,
};

/** Re-export DB types for convenience */
export type { ProctoringEventSeverity };
