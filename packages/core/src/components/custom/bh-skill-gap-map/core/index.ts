import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhSkillGapMapPreset = 'heatmap' | 'list';

export type GapPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SkillGapItem {
  id: string;
  dimension: string;
  dimensionCode: string;
  currentLevel: number;
  requiredLevel: number;
  gapSize: number;
  priority: GapPriority;
  candidateCount: number;
  recommendation?: string;
}

export interface DimensionHeatmapCell {
  dimension: string;
  candidate: string;
  candidateId: string;
  score: number;
  maxScore: number;
  gapSize: number;
}

export interface GapSummary {
  totalGaps: number;
  criticalGaps: number;
  averageGapSize: number;
  mostCommonDimension: string;
}

export interface BhSkillGapMapProps extends EngineAwareProps {
  preset?: BhSkillGapMapPreset;
  gaps: SkillGapItem[];
  heatmapData?: DimensionHeatmapCell[];
  summary?: GapSummary;
  dimensions?: string[];
  candidates?: string[];
  selectedGapId?: string;
  onGapSelect?: (gapId: string) => void;
  priorityFilter?: GapPriority[];
  onPriorityFilterChange?: (priorities: GapPriority[]) => void;
  loading?: boolean;
  className?: string;
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
