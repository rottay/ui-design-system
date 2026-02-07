/**
 * BhScorecardDetail - Core Interface
 * Individual Scorecard Detail for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhScorecardDetailPreset = 'full' | 'summary';

export type ScoreLevel = 'excellent' | 'good' | 'average' | 'below' | 'poor';

export interface ScorecardHeader {
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  stageName: string;
  overallScore: number;
  overallLevel: ScoreLevel;
  passFail: 'pass' | 'fail';
  confidence: number;
}

export interface ScorecardDimension {
  id: string;
  name: string;
  score: number;
  weight: number;
  confidence: number;
  isKnockout: boolean;
  knockoutTriggered: boolean;
  evidenceCount: number;
}

export interface DimensionEvidence {
  quote: string;
  speaker: string;
  turnRef: string;
  aiReasoning: string;
}

export interface OverrideInfo {
  originalScore: number;
  overrideScore: number;
  reviewerName: string;
  reasoning: string;
  timestamp: Date;
}

export interface CohortComparison {
  percentile: number;
  totalInCohort: number;
}

export type ScorecardSortBy = 'name' | 'score' | 'weight' | 'confidence' | 'evidence';
export type ScorecardView = 'table' | 'radar' | 'detail';

export interface BhScorecardDetailProps extends EngineAwareProps {
  preset?: BhScorecardDetailPreset;

  /** Scorecard header with candidate info and overall score */
  header: ScorecardHeader;

  /** Scored dimensions array */
  dimensions: ScorecardDimension[];

  /** Currently selected dimension id */
  selectedDimension?: string;

  /** Evidence for the selected dimension */
  evidence?: DimensionEvidence[];

  /** Override info if score was overridden */
  overrideInfo?: OverrideInfo;

  /** Cohort comparison data */
  cohortComparison?: CohortComparison;

  /** Dimension select callback */
  onDimensionSelect?: (dimensionId: string) => void;

  /** Approve scorecard callback */
  onApprove?: () => void;

  /** Override scorecard callback */
  onOverride?: (score: number, reason: string) => void;

  /** Request rescore callback */
  onRequestRescore?: () => void;

  /** Submit appeal callback */
  onSubmitAppeal?: (reason: string) => void;

  /** Whether override form is showing */
  showOverrideForm?: boolean;

  /** Toggle override form */
  onOverrideFormToggle?: (show: boolean) => void;

  /** Override reason text */
  overrideReason?: string;

  /** Override reason change callback */
  onOverrideReasonChange?: (reason: string) => void;

  /** Current sort field */
  sortBy?: ScorecardSortBy;

  /** Sort change callback */
  onSortChange?: (sortBy: ScorecardSortBy) => void;

  /** Active view mode */
  activeView?: ScorecardView;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SCORECARD_DETAIL_DEFAULTS: Partial<BhScorecardDetailProps> = {
  preset: 'full',
};

/* ------------------------------------------------------------------ */
/*  Helper: Score level color mapping                                  */
/* ------------------------------------------------------------------ */
export function getScoreLevelColors(level: ScoreLevel, tokens: DesignTokens) {
  const map: Record<ScoreLevel, { bg: string; color: string; border: string; ring: string }> = {
    excellent: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      ring: tokens.colors.successScale[500],
    },
    good: {
      bg: tokens.colors.successScale[50],
      color: tokens.colors.successScale[600],
      border: tokens.colors.successScale[200],
      ring: tokens.colors.successScale[400],
    },
    average: {
      bg: tokens.colors.warningScale[50],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      ring: tokens.colors.warningScale[500],
    },
    below: {
      bg: tokens.colors.warningScale[100],
      color: tokens.colors.warningScale[800],
      border: tokens.colors.warningScale[200],
      ring: tokens.colors.warningScale[600],
    },
    poor: {
      bg: tokens.colors.errorScale[50],
      color: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      ring: tokens.colors.errorScale[500],
    },
  };
  return map[level];
}

export function getPassFailColors(passFail: 'pass' | 'fail', tokens: DesignTokens) {
  if (passFail === 'pass') {
    return {
      bg: tokens.colors.successScale[100],
      color: tokens.colors.successScale[800],
      border: tokens.colors.successScale[200],
    };
  }
  return {
    bg: tokens.colors.errorScale[100],
    color: tokens.colors.errorScale[800],
    border: tokens.colors.errorScale[200],
  };
}

export function getScoreGradientColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.successScale[400];
  if (score >= 40) return tokens.colors.warningScale[500];
  if (score >= 20) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[500];
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.5) return 'Medium';
  if (confidence >= 0.3) return 'Low';
  return 'Very Low';
}

export function getConfidenceColor(confidence: number, tokens: DesignTokens): string {
  if (confidence >= 0.7) return tokens.colors.successScale[500];
  if (confidence >= 0.4) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}
