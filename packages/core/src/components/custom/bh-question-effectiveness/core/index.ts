/**
 * BhQuestionEffectiveness - Core Interface
 * Dashboard widget showing question effectiveness metrics for interviewers.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhQuestionEffectivenessPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single question with effectiveness metrics */
export interface EffectiveQuestion {
  questionId: string;
  text: string;
  dimension: string;
  effectiveness: number;
  timesUsed: number;
  avgScoreVariance: number;
}

/** Effectiveness breakdown by interview dimension */
export interface DimensionEffectiveness {
  dimension: string;
  effectiveness: number;
  questionCount: number;
}

/** Full question effectiveness data payload */
export interface QuestionEffectivenessData {
  totalQuestionsUsed: number;
  avgEffectiveness: number;
  trend: 'improving' | 'stable' | 'declining';
  topQuestions: EffectiveQuestion[];
  worstQuestions: EffectiveQuestion[];
  dimensionBreakdown: DimensionEffectiveness[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhQuestionEffectivenessProps extends EngineAwareProps {
  preset?: BhQuestionEffectivenessPreset;

  /** Question effectiveness data */
  data?: QuestionEffectivenessData;

  /** Loading state */
  loading?: boolean;

  /** Callback when a specific question is viewed */
  onViewQuestion?: (questionId: string) => void;

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

export const BH_QUESTION_EFFECTIVENESS_DEFAULTS: Partial<BhQuestionEffectivenessProps> = {
  preset: 'compact',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns a color from the appropriate scale based on effectiveness score.
 * >80 = success, 60-80 = warning, <60 = error
 */
export function getEffectivenessColor(score: number, tokens: DesignTokens): string {
  const s = n(score);
  if (s >= 80) return tokens.colors.successScale[500];
  if (s >= 60) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/**
 * Returns a badge color key based on effectiveness score.
 */
export function getEffectivenessBadgeColor(score: number): 'success' | 'warning' | 'error' {
  const s = n(score);
  if (s >= 80) return 'success';
  if (s >= 60) return 'warning';
  return 'error';
}

/** Re-export n helper for convenience */
export { n };
