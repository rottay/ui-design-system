/**
 * BhReferenceReport - Core Interface
 * Reference checking report for BitHire ATS platform - displays
 * reference check results with scoring, sentiment analysis,
 * and verification status.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhReferenceReportPreset = 'summary' | 'detail';

// =============================================================================
// REFERENCE CHECK
// =============================================================================

/**
 * A single reference check entity.
 */
export interface ReferenceCheck {
  id: string;
  candidateId: string;
  candidateName: string;
  referenceeName: string;
  referenceRole: string;
  relationship: string;
  company: string;
  duration: string;
  status: 'pending' | 'scheduled' | 'completed' | 'declined';
  completedAt?: Date;
  scheduledAt?: Date;
}

// =============================================================================
// REFERENCE RESPONSE
// =============================================================================

/**
 * A response to a reference check question.
 */
export interface ReferenceResponse {
  questionId: string;
  question: string;
  answer: string;
  rating?: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  flags: string[];
}

// =============================================================================
// REFERENCE DIMENSION
// =============================================================================

/**
 * A scored dimension across reference checks.
 */
export interface ReferenceDimension {
  name: string;
  score: number;
  responses: ReferenceResponse[];
}

// =============================================================================
// REFERENCE REPORT
// =============================================================================

/**
 * A complete reference report for a candidate.
 */
export interface ReferenceReport {
  id: string;
  candidateId: string;
  candidateName: string;
  references: ReferenceCheck[];
  overallScore: number;
  overallSentiment: 'positive' | 'neutral' | 'mixed' | 'negative';
  dimensions: ReferenceDimension[];
  redFlags: string[];
  strengths: string[];
  summary: string;
  verificationStatus: 'verified' | 'partial' | 'unverified';
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhReferenceReportProps extends EngineAwareProps {
  preset?: BhReferenceReportPreset;

  /** The reference report data */
  report?: ReferenceReport;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback to contact a reference */
  onContactReference?: (referenceId: string) => void;

  /** Callback to schedule a reference call */
  onScheduleCall?: (referenceId: string) => void;

  /** Callback to verify a reference */
  onVerify?: (referenceId: string) => void;

  /** Callback to export the report */
  onExport?: () => void;

  /** Selected reference ID (for detail preset) */
  selectedReferenceId?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_REFERENCE_REPORT_DEFAULTS: Partial<BhReferenceReportProps> = {
  preset: 'summary',
};
