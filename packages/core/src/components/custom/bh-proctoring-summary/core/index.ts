/**
 * BhProctoringSummary - Core Interface
 * Per-candidate summary card with risk score, event breakdown, review status
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhProctoringSummaryPreset = 'card' | 'inline';

export type ProctoringEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SeverityEventCounts {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface BhProctoringSummaryProps extends EngineAwareProps {
  preset?: BhProctoringSummaryPreset;

  /** Candidate name */
  candidateName: string;

  /** Candidate avatar URL */
  candidateAvatar?: string;

  /** Risk score 0-100 */
  riskScore: number;

  /** Event counts by severity */
  eventCounts: SeverityEventCounts;

  /** Total events for this candidate */
  totalEvents: number;

  /** Number of reviewed events */
  reviewedCount: number;

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
