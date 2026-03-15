/**
 * BhQuestionBank - Core Interface
 * Dashboard widget showing question bank statistics at a glance.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhQuestionBankPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** Preview of a single question from the bank */
export interface QuestionPreview {
  id: string;
  text: string;
  dimension: string;
  effectiveness: number;
  usageCount: number;
}

/** Aggregated question bank statistics */
export interface QuestionBankStats {
  totalQuestions: number;
  byDimension: { dimension: string; count: number }[];
  recentlyAdded: number;
  topRated: QuestionPreview[];
  avgEffectiveness: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhQuestionBankProps extends EngineAwareProps {
  preset?: BhQuestionBankPreset;

  /** Question bank statistics */
  stats?: QuestionBankStats;

  /** Loading state */
  loading?: boolean;

  /** Callback when browse questions is clicked */
  onBrowseQuestions?: () => void;

  /** Callback when a specific question is clicked */
  onViewQuestion?: (questionId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_QUESTION_BANK_DEFAULTS: Partial<BhQuestionBankProps> = {
  preset: 'compact',
};

/** Re-export n helper for convenience */
export { n };
