import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { ScorecardSelect, DimensionScoreSelect } from '@rottay/scoring';

export type BhComparisonViewPreset = 'standard';

export interface ComparisonCandidate {
  id: string;
  name: string;
  avatar?: string;
  /** Scorecard DB entity (optional) */
  scorecard?: Partial<ScorecardSelect>;
  overallScore: number;
  rank: number;
  dimensionScores: { dimension: string; score: number }[];
  strengths: string[];
  weaknesses: string[];
  /** Confidence level of the scoring (from ScorecardSelect.confidence) */
  confidence?: number;
  /** Scoring method used (e.g. 'llm', 'human', 'hybrid') (from ScorecardSelect.scoringMethod) */
  scoringMethod?: string;
  /** Number of LLM tokens used for scoring (from ScorecardSelect.tokensUsed) */
  tokensUsed?: number;
}

/** Re-export DB types for convenience */
export type { ScorecardSelect, DimensionScoreSelect };

export interface ComparisonRow {
  dimension: string;
  scores: { candidateId: string; score: number }[];
}

export interface CandidateDecision {
  candidateId: string;
  decision: 'advance' | 'reject' | 'hold';
  notes?: string;
}

export interface BhComparisonViewProps extends EngineAwareProps {
  preset?: BhComparisonViewPreset;
  candidates?: ComparisonCandidate[];
  comparisonRows?: ComparisonRow[];
  onAddCandidate?: () => void;
  onRemoveCandidate?: (candidateId: string) => void;
  onReorderCandidates?: (candidateIds: string[]) => void;
  expandedRows?: string[];
  onRowToggle?: (dimension: string) => void;
  highlightBest?: boolean;
  onHighlightToggle?: (enabled: boolean) => void;
  decisions?: CandidateDecision[];
  onDecisionChange?: (decision: CandidateDecision) => void;
  showRadar?: boolean;
  onRadarToggle?: (enabled: boolean) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_COMPARISON_VIEW_DEFAULTS: Partial<BhComparisonViewProps> = {
  preset: 'standard',
};

export function getRankColors(tokens: DesignTokens) {
  return {
    1: { color: tokens.colors.warningScale[800], bgColor: tokens.colors.warningScale[100], border: tokens.colors.warningScale[300] },
    2: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[200], border: tokens.colors.neutral[300] },
    3: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
    4: { color: tokens.colors.neutral[500], bgColor: tokens.colors.neutral[100], border: tokens.colors.neutral[200] },
  } as Record<number, { color: string; bgColor: string; border: string }>;
}

export function getDecisionColors(tokens: DesignTokens) {
  return {
    advance: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    reject: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    hold: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
  };
}

export function getCandidateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

export function getScoreColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[600];
  if (score >= 60) return tokens.colors.infoScale[600];
  if (score >= 40) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[600];
}

export function getScoreBgColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[50];
  if (score >= 60) return tokens.colors.infoScale[50];
  if (score >= 40) return tokens.colors.warningScale[50];
  return tokens.colors.errorScale[50];
}

export const CANDIDATE_COLORS_KEYS = ['primaryScale', 'secondaryScale', 'successScale', 'warningScale'] as const;

export function getCandidateColor(index: number, tokens: DesignTokens): { stroke: string; fill: string; light: string } {
  const key = CANDIDATE_COLORS_KEYS[index % CANDIDATE_COLORS_KEYS.length];
  const scale = (tokens.colors as any)[key];
  return {
    stroke: scale[500],
    fill: scale[200],
    light: scale[50],
  };
}
