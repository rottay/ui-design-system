/**
 * BhMoneyballInsights - Core Interface
 * Recruiter Moneyball Analytics for the BitHire ATS platform
 * Discovers hidden statistical correlations in hiring data
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhMoneyballInsightsPreset = 'dashboard' | 'detail';

export type PatternType =
  | 'question_correlation'
  | 'skill_predictor'
  | 'source_quality'
  | 'timing_pattern'
  | 'demographic_insight';

export type InsightStatus =
  | 'new'
  | 'confirmed'
  | 'investigating'
  | 'dismissed';

export interface MoneyballInsight {
  id: string;
  patternType: PatternType;
  title: string;
  description: string;
  correlationCoefficient: number;
  statisticalSignificance: number;
  sampleSize: number;
  status: InsightStatus;
  affectedCandidateIds: string[];
  discoveredAt: string;
  modelVersion: string;
  trendData?: number[];
}

export interface MoneyballCorrelation {
  variable1: string;
  variable2: string;
  coefficient: number;
  pValue: number;
  visualization?: {
    xValues: number[];
    yValues: number[];
    trendLine?: { slope: number; intercept: number };
  };
}

export interface AffectedCandidate {
  id: string;
  name: string;
  score: number;
  outcome: 'hired' | 'rejected' | 'pending' | 'withdrawn';
}

export interface InsightStats {
  totalInsights: number;
  avgSignificance: number;
  confirmedCount: number;
  topPatternType: PatternType | null;
}

export interface BhMoneyballInsightsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhMoneyballInsightsPreset;

  /** List of all insights (dashboard) or single insight (detail) */
  insights?: MoneyballInsight[];

  /** Single insight for detail view */
  insight?: MoneyballInsight | null;

  /** Correlations for a single insight (detail view) */
  correlations?: MoneyballCorrelation[];

  /** Affected candidates for detail view */
  affectedCandidates?: AffectedCandidate[];

  /** Aggregated stats for dashboard */
  stats?: InsightStats;

  /** Loading state */
  loading?: boolean;

  /** Currently active filter for pattern type */
  patternTypeFilter?: PatternType | 'all';

  /** Currently active filter for status */
  statusFilter?: InsightStatus | 'all';

  /** Significance threshold filter */
  significanceThreshold?: number;

  /** Callback when pattern type filter changes */
  onPatternTypeFilterChange?: (filter: PatternType | 'all') => void;

  /** Callback when status filter changes */
  onStatusFilterChange?: (filter: InsightStatus | 'all') => void;

  /** Callback when significance threshold changes */
  onSignificanceThresholdChange?: (threshold: number) => void;

  /** Callback to run insight discovery */
  onRunDiscovery?: () => void;

  /** Callback when an insight is selected (dashboard) */
  onInsightSelect?: (insightId: string) => void;

  /** Callback to confirm an insight */
  onConfirm?: (insightId: string) => void;

  /** Callback to dismiss an insight */
  onDismiss?: (insightId: string) => void;

  /** Callback to investigate an insight */
  onInvestigate?: (insightId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_MONEYBALL_INSIGHTS_DEFAULTS: Partial<BhMoneyballInsightsProps> = {
  preset: 'dashboard',
  patternTypeFilter: 'all',
  statusFilter: 'all',
  significanceThreshold: 0.05,
};

/**
 * Returns pattern type display configuration
 */
export function getPatternTypeConfig(tokens: DesignTokens) {
  return {
    question_correlation: {
      label: 'Question Correlation',
      color: tokens.colors.primaryScale[700],
      bgColor: tokens.colors.primaryScale[50],
      borderColor: tokens.colors.primaryScale[200],
    },
    skill_predictor: {
      label: 'Skill Predictor',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
    },
    source_quality: {
      label: 'Source Quality',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
    },
    timing_pattern: {
      label: 'Timing Pattern',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
    },
    demographic_insight: {
      label: 'Demographic Insight',
      color: tokens.colors.secondaryScale[700],
      bgColor: tokens.colors.secondaryScale[50],
      borderColor: tokens.colors.secondaryScale[200],
    },
  };
}

/**
 * Returns insight status display configuration
 */
export function getInsightStatusConfig(tokens: DesignTokens) {
  return {
    new: {
      label: 'New',
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[100],
      borderColor: tokens.colors.infoScale[200],
    },
    confirmed: {
      label: 'Confirmed',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[100],
      borderColor: tokens.colors.successScale[200],
    },
    investigating: {
      label: 'Investigating',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[100],
      borderColor: tokens.colors.warningScale[200],
    },
    dismissed: {
      label: 'Dismissed',
      color: tokens.colors.neutral[500],
      bgColor: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
    },
  };
}

/**
 * Returns significance stars (1-3) based on p-value
 */
export function getSignificanceStars(significance: number): number {
  if (significance <= 0.001) return 3;
  if (significance <= 0.01) return 2;
  if (significance <= 0.05) return 1;
  return 0;
}

/**
 * Returns color for correlation coefficient value
 */
export function getCorrelationColor(tokens: DesignTokens, coefficient: number): string {
  const abs = Math.abs(coefficient);
  if (abs >= 0.7) return coefficient > 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600];
  if (abs >= 0.4) return coefficient > 0 ? tokens.colors.successScale[400] : tokens.colors.errorScale[400];
  return tokens.colors.neutral[400];
}

/**
 * Formats a p-value for display
 */
export function formatPValue(pValue: number): string {
  if (pValue < 0.001) return '< 0.001';
  if (pValue < 0.01) return pValue.toFixed(3);
  return pValue.toFixed(2);
}

/**
 * Returns the outcome color for a candidate
 */
export function getOutcomeConfig(tokens: DesignTokens) {
  return {
    hired: {
      label: 'Hired',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[100],
    },
    rejected: {
      label: 'Rejected',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[100],
    },
    pending: {
      label: 'Pending',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[100],
    },
    withdrawn: {
      label: 'Withdrawn',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
    },
  };
}
