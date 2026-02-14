/**
 * BhProctoringSummary - Core Interface
 * Per-candidate summary card with risk score, event breakdown, review status
 *
 * Uses ProctoringEventSeverityValue from @rottay/scoring for severity type reference.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { ProctoringEventSeverity } from '@rottay/scoring';

export type BhProctoringSummaryPreset = 'card' | 'inline';

/** Backward-compat alias (old name from pre-migration) */
export type ProctoringEventSeverityValue = ProctoringEventSeverity;

export interface SeverityEventCounts {
  low?: number;
  medium?: number;
  high?: number;
  critical?: number;
}

export interface BhProctoringSummaryProps extends EngineAwareProps {
  preset?: BhProctoringSummaryPreset;

  /** Candidate name */
  candidateName?: string;

  /** Candidate avatar URL */
  candidateAvatar?: string;

  /** Risk score 0-100 */
  riskScore?: number;

  /** Event counts by severity */
  eventCounts?: SeverityEventCounts;

  /** Total events for this candidate */
  totalEvents?: number;

  /** Number of reviewed events */
  reviewedCount?: number;

  /** Callback when view details is clicked */
  onViewDetails?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROCTORING_SUMMARY_DEFAULTS: Partial<BhProctoringSummaryProps> = {
  preset: 'card',
};

/** Re-export DB types for convenience */
export type { ProctoringEventSeverity };
