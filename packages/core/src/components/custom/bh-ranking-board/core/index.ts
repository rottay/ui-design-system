/**
 * BhRankingBoard - Core Interface
 * Candidate Rankings Board for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhRankingBoardPreset = 'table' | 'comparison';

export type DecisionAction = 'advance' | 'reject' | 'hold';
export type DecisionStatus = 'pending' | 'advanced' | 'rejected' | 'hold';

export interface RankedCandidate {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  overallScore: number;
  stageScores: { stage: string; score: number }[];
  completionPercent: number;
  hasKnockout: boolean;
  decisionStatus: DecisionStatus;
  strengths: string[];
  weaknesses: string[];
}

export interface ScoreDistribution {
  score: number;
  count: number;
}

export interface RankingFilters {
  stages?: string[];
  knockoutOnly?: boolean;
  decisionStatus?: DecisionStatus[];
  searchQuery?: string;
}

export type RankingSortBy = 'rank' | 'name' | 'score' | 'completion' | 'decision';
export type SortDirection = 'asc' | 'desc';

export interface BhRankingBoardProps extends EngineAwareProps {
  preset?: BhRankingBoardPreset;

  /** Job name for the rankings */
  jobName: string;

  /** Ranked candidate list */
  candidates: RankedCandidate[];

  /** Score distribution histogram data */
  scoreDistribution?: ScoreDistribution[];

  /** Current filter state */
  filters?: RankingFilters;

  /** Filter change callback */
  onFilterChange?: (filters: RankingFilters) => void;

  /** Currently selected candidate ids for comparison */
  selectedCandidates?: string[];

  /** Selection change callback */
  onSelectionChange?: (ids: string[]) => void;

  /** Compare selected candidates callback */
  onCompare?: (ids: string[]) => void;

  /** Per-candidate decision state */
  decisions?: Record<string, DecisionAction>;

  /** Decision change callback */
  onDecisionChange?: (candidateId: string, action: DecisionAction) => void;

  /** Bulk advance callback */
  onBulkAdvance?: (candidateIds: string[]) => void;

  /** Bulk reject callback */
  onBulkReject?: (candidateIds: string[]) => void;

  /** Export callback */
  onExport?: () => void;

  /** Current sort field */
  sortBy?: RankingSortBy;

  /** Sort direction */
  sortDirection?: SortDirection;

  /** Sort change callback */
  onSortChange?: (sortBy: RankingSortBy, direction: SortDirection) => void;

  /** Score range filter [min, max] */
  scoreRange?: [number, number];

  /** Score range change callback */
  onScoreRangeChange?: (range: [number, number]) => void;

  /** Currently expanded candidate id */
  expandedCandidate?: string;

  /** Candidate expand callback */
  onCandidateExpand?: (candidateId: string | null) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_RANKING_BOARD_DEFAULTS: Partial<BhRankingBoardProps> = {
  preset: 'table',
};

/* ------------------------------------------------------------------ */
/*  Helper: Decision status colors                                      */
/* ------------------------------------------------------------------ */
export function getDecisionColors(status: DecisionStatus, tokens: DesignTokens) {
  const map: Record<DecisionStatus, { bg: string; color: string; border: string }> = {
    pending: {
      bg: tokens.colors.neutral[100],
      color: tokens.colors.neutral[600],
      border: tokens.colors.neutral[200],
    },
    advanced: {
      bg: tokens.colors.successScale[100],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
    },
    rejected: {
      bg: tokens.colors.errorScale[100],
      color: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
    },
    hold: {
      bg: tokens.colors.warningScale[100],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
    },
  };
  return map[status];
}

export function getDecisionActionColors(action: DecisionAction, tokens: DesignTokens) {
  const map: Record<DecisionAction, { bg: string; color: string; border: string }> = {
    advance: {
      bg: tokens.colors.successScale[100],
      color: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
    },
    reject: {
      bg: tokens.colors.errorScale[100],
      color: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
    },
    hold: {
      bg: tokens.colors.warningScale[100],
      color: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
    },
  };
  return map[action];
}

export function getScoreBarColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.successScale[400];
  if (score >= 40) return tokens.colors.warningScale[500];
  if (score >= 20) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[500];
}

export function getRankBadgeColors(rank: number, tokens: DesignTokens) {
  if (rank === 1) {
    return { bg: tokens.colors.warningScale[100], color: tokens.colors.warningScale[800], border: tokens.colors.warningScale[300] };
  }
  if (rank === 2) {
    return { bg: tokens.colors.neutral[200], color: tokens.colors.neutral[700], border: tokens.colors.neutral[300] };
  }
  if (rank === 3) {
    return { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] };
  }
  return { bg: tokens.colors.neutral[50], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
}

export function getCandidateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}
