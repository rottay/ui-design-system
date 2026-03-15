/**
 * BhSkillGapMap - Core Interface
 * Heatmap and list visualization of skill gaps across dimensions and candidates
 *
 * Uses SkillGapAnalysisSelect from @rottay/scoring for entity reference.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { SkillGapAnalysisSelect } from '@rottay/scoring';

export type BhSkillGapMapPreset = 'heatmap' | 'list';

export type GapPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SkillGapItem {
  id?: string;
  dimension?: string;
  dimensionCode?: string;
  currentLevel?: number;
  requiredLevel?: number;
  gapSize?: number;
  priority?: GapPriority;
  candidateCount?: number;
  recommendation?: string;
  /** Scoring dimension ID from the rubric */
  dimensionId?: string;
  /** Overall gap score for the analysis this item belongs to */
  overallGap?: number;
}

export interface DimensionHeatmapCell {
  dimension?: string;
  candidate?: string;
  candidateId?: string;
  score?: number;
  maxScore?: number;
  gapSize?: number;
}

export interface GapSummary {
  totalGaps?: number;
  criticalGaps?: number;
  averageGapSize?: number;
  mostCommonDimension?: string;
}

export interface BhSkillGapMapProps extends EngineAwareProps {
  preset?: BhSkillGapMapPreset;

  /** The DB entity for reference (all fields optional for safety) */
  analysis?: Partial<SkillGapAnalysisSelect>;

  /** Skill gap items (UI-computed from analysis.gaps) */
  gaps?: SkillGapItem[];

  /** Heatmap data */
  heatmapData?: DimensionHeatmapCell[];

  /** Summary statistics */
  summary?: GapSummary;

  /** Dimension labels */
  dimensions?: string[];

  /** Candidate labels */
  candidates?: string[];

  /** Currently selected gap */
  selectedGapId?: string;

  /** Callback when a gap is selected */
  onGapSelect?: (gapId: string) => void;

  /** Priority filter */
  priorityFilter?: GapPriority[];

  /** Callback when priority filter changes */
  onPriorityFilterChange?: (priorities: GapPriority[]) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SKILL_GAP_MAP_DEFAULTS: Partial<BhSkillGapMapProps> = {
  preset: 'heatmap',
};

export function getPriorityColors(tokens: DesignTokens) {
  return {
    critical: { color: tokens.colors.errorScale[800], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    high: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    medium: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
    low: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200] },
  };
}

export function getScoreColor(score: number, maxScore: number, tokens: DesignTokens): string {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.8) return tokens.colors.successScale[500];
  if (ratio >= 0.6) return tokens.colors.successScale[300];
  if (ratio >= 0.4) return tokens.colors.warningScale[400];
  if (ratio >= 0.2) return tokens.colors.errorScale[300];
  return tokens.colors.errorScale[500];
}

export function getScoreBgColor(score: number, maxScore: number, tokens: DesignTokens): string {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.8) return tokens.colors.successScale[50];
  if (ratio >= 0.6) return tokens.colors.successScale[50];
  if (ratio >= 0.4) return tokens.colors.warningScale[50];
  if (ratio >= 0.2) return tokens.colors.errorScale[50];
  return tokens.colors.errorScale[100];
}

/** Re-export DB type for convenience */
export type { SkillGapAnalysisSelect };
