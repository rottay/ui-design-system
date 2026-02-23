/**
 * BhDecisionSupport - Core Interface
 * Dashboard widget providing AI-driven hiring decision support.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhDecisionSupportPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Comparison data for a single candidate */
export interface CandidateComparison {
  candidateId: string;
  name: string;
  overallScore: number;
  strengthAreas: string[];
  riskAreas: string[];
  hireProbability: number;
}

/** Full decision support data */
export interface DecisionSupportData {
  jobId: string;
  jobTitle: string;
  candidatesInFinal: number;
  topCandidate: {
    name: string;
    score: number;
    probability: number;
  };
  comparisons: CandidateComparison[];
  recommendedAction: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhDecisionSupportProps extends EngineAwareProps {
  preset?: BhDecisionSupportPreset;

  /** Decision support data */
  data?: DecisionSupportData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a candidate is clicked */
  onViewCandidate?: (candidateId: string) => void;

  /** Callback when the job is clicked */
  onViewJob?: (jobId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Returns a color from tokens based on confidence level */
export function getConfidenceColor(
  level: 'high' | 'medium' | 'low',
  tokens: DesignTokens,
): string {
  switch (level) {
    case 'high':
      return tokens.colors.successScale[600];
    case 'medium':
      return tokens.colors.warningScale[600];
    case 'low':
      return tokens.colors.errorScale[600];
  }
}

/** Returns a color from tokens based on hire probability percentage */
export function getProbabilityColor(
  pct: number,
  tokens: DesignTokens,
): string {
  if (pct >= 70) return tokens.colors.successScale[500];
  if (pct >= 40) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_DECISION_SUPPORT_DEFAULTS: Partial<BhDecisionSupportProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
