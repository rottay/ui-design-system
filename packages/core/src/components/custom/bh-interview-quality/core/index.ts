/**
 * BhInterviewQuality - Core Interface
 * Dashboard widget showing interviewer quality scores and dimension breakdown.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhInterviewQualityPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Quality dimension score with weight */
export interface QualityDimension {
  name: string;
  score: number;
  weight: number;
}

/** A recent interview with quality assessment */
export interface RecentQualityInterview {
  interviewId: string;
  candidateName: string;
  date: Date | string;
  score: number;
  highlights: string[];
}

/** Full interview quality data payload */
export interface InterviewQualityData {
  overallScore: number;
  interviewsThisMonth: number;
  trend: 'improving' | 'stable' | 'declining';
  dimensions: QualityDimension[];
  recentInterviews: RecentQualityInterview[];
  rankAmongPeers: number;
  totalPeers: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhInterviewQualityProps extends EngineAwareProps {
  preset?: BhInterviewQualityPreset;

  /** Interview quality data */
  data?: InterviewQualityData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a specific interview is viewed */
  onViewInterview?: (interviewId: string) => void;

  /** Callback when "View All" is clicked */
  onViewAll?: () => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_INTERVIEW_QUALITY_DEFAULTS: Partial<BhInterviewQualityProps> = {
  preset: 'compact',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns a color based on quality score.
 * >=80 success, 60-79 warning, <60 error
 */
export function getQualityScoreColor(score: number, tokens: DesignTokens): string {
  const s = n(score);
  if (s >= 80) return tokens.colors.successScale[500];
  if (s >= 60) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/**
 * Returns a badge color key based on quality score.
 */
export function getQualityBadgeColor(score: number): 'success' | 'warning' | 'error' {
  const s = n(score);
  if (s >= 80) return 'success';
  if (s >= 60) return 'warning';
  return 'error';
}

/** Standard dimension names for interview quality */
export const QUALITY_DIMENSIONS = [
  'Structure',
  'Depth',
  'Candidate Experience',
  'Rubric Adherence',
  'Time Management',
] as const;

/** Re-export n helper for convenience */
export { n };
