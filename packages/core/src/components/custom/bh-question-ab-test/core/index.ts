/**
 * BhQuestionAbTest - Core Interface
 * Interview Question A/B Testing for the BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhQuestionAbTestPreset = 'dashboard' | 'detail' | 'analytics';

// =============================================================================
// DATA TYPES
// =============================================================================

export interface QuestionVariant {
  id: string;
  label: string;
  questionText: string;
  questionType?: string;
  isControl: boolean;
  sampleSize: number;
  avgScore: number;
  stdDev?: number;
  conversionRate?: number;
  metadata?: Record<string, unknown>;
}

export interface ExperimentData {
  id: string;
  rubricName?: string;
  dimensionName?: string;
  competency: string;
  name: string;
  description?: string;
  hypothesis?: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  variants: QuestionVariant[];
  statisticalSignificance?: number | null;
  confidenceLevel?: number | null;
  winnerVariantId?: string | null;
  currentSampleSize: number;
  minimumSampleSize: number;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentAnalytics {
  totalInterviews: number;
  avgScorePerVariant: Record<string, number>;
  confidenceIntervals: Record<string, { lower: number; upper: number }>;
  trendData: Array<{
    date: string;
    variantScores: Record<string, number>;
  }>;
  outcomeCorrelation: {
    hiredWithin90Days: Record<string, number>;
    hiredWithin1Year: Record<string, number>;
  };
  scoreDistribution: Record<string, Array<{ bucket: string; count: number }>>;
}

export interface AssignmentRecord {
  interviewId: string;
  candidateId: string;
  candidateName?: string;
  variantId: string;
  variantLabel: string;
  assignedAt: string;
  score?: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhQuestionAbTestProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhQuestionAbTestPreset;

  /** List of experiments */
  experiments?: ExperimentData[];

  /** Currently selected experiment */
  selectedExperiment?: ExperimentData | null;

  /** Callback when an experiment is selected */
  onExperimentSelect?: (experimentId: string) => void;

  /** Callback to create a new experiment */
  onCreateExperiment?: () => void;

  /** Callback to complete an experiment with a winner */
  onCompleteExperiment?: (experimentId: string, winnerVariantId: string) => void;

  /** Callback to update experiment status (pause/resume/cancel) */
  onStatusChange?: (experimentId: string, status: string) => void;

  /** Analytics data for the analytics preset */
  analytics?: ExperimentAnalytics | null;

  /** Assignment history records */
  assignments?: AssignmentRecord[];

  /** Filter state: status */
  statusFilter?: string;

  /** Callback when status filter changes */
  onStatusFilterChange?: (status: string) => void;

  /** Filter state: rubric */
  rubricFilter?: string;

  /** Callback when rubric filter changes */
  onRubricFilterChange?: (rubricId: string) => void;

  /** Whether data is loading */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_QUESTION_AB_TEST_DEFAULTS: Partial<BhQuestionAbTestProps> = {
  preset: 'dashboard',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Returns status display configuration
 */
export function getExperimentStatusConfig(tokens: DesignTokens) {
  return {
    draft: {
      label: 'Draft',
      color: tokens.colors.neutral[700],
      bgColor: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
    },
    running: {
      label: 'Running',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
    },
    paused: {
      label: 'Paused',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
    },
    completed: {
      label: 'Completed',
      color: tokens.colors.primaryScale[700],
      bgColor: tokens.colors.primaryScale[50],
      borderColor: tokens.colors.primaryScale[200],
    },
    cancelled: {
      label: 'Cancelled',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
    },
  };
}

/**
 * Returns the confidence display text and color
 */
export function getConfidenceDisplay(
  tokens: DesignTokens,
  significance: number | null | undefined
): { text: string; color: string; percent: number } {
  if (significance == null || isNaN(significance)) {
    return { text: 'No data', color: tokens.colors.neutral[400], percent: 0 };
  }
  // significance is the p-value - lower is more significant
  const confidence = (1 - significance) * 100;
  if (confidence >= 99) {
    return { text: `${confidence.toFixed(1)}% confidence`, color: tokens.colors.successScale[600], percent: confidence };
  }
  if (confidence >= 95) {
    return { text: `${confidence.toFixed(1)}% confidence`, color: tokens.colors.successScale[500], percent: confidence };
  }
  if (confidence >= 90) {
    return { text: `${confidence.toFixed(1)}% confidence`, color: tokens.colors.warningScale[500], percent: confidence };
  }
  return { text: `${confidence.toFixed(1)}% confidence`, color: tokens.colors.errorScale[500], percent: confidence };
}

/**
 * Returns a percentage of completion toward minimum sample size
 */
export function getSampleProgress(current: number, minimum: number): number {
  if (minimum <= 0) return 100;
  return Math.min(100, Math.round((current / minimum) * 100));
}

/**
 * Formats a score value for display
 */
export function formatExperimentScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Returns the leading variant from an experiment
 */
export function getLeadingVariant(experiment: ExperimentData): QuestionVariant | null {
  if (experiment.variants.length === 0) return null;
  return experiment.variants.reduce((best, v) =>
    v.avgScore > best.avgScore ? v : best,
    experiment.variants[0]
  );
}
