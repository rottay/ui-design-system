/**
 * DB Reference: DBInterview from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBInterview } from '@rottay/recruiter';

export type BhPanelCoordinatorPreset = 'timeline' | 'summary';

/** Re-export for consumer convenience */
export type { DBInterview };

export type AggregationStrategy = 'average' | 'weighted_average' | 'max' | 'min' | 'consensus';
export type Recommendation = 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
export type StageStatus = 'completed' | 'in_progress' | 'scheduled' | 'pending' | 'cancelled';

export interface PanelMember {
  id: string;
  name: string;
  role: string;
  stageId: string;
  overallScore?: number;
  recommendation?: Recommendation;
  submittedAt?: string;
  dimensionScores?: Array<{ dimension: string; score: number; maxScore: number }>;
  notes?: string;
  /** Confidence score for the evaluation (0-1) */
  confidenceScore?: number;
  /** Token cost for AI-assisted evaluation */
  tokenCost?: number;
  /** Interview mode used (ai_voice, ai_chat, human_video, etc.) */
  interviewMode?: string;
}

export interface InterviewStage {
  id: string;
  name: string;
  order: number;
  status: StageStatus;
  aggregationStrategy: AggregationStrategy;
  aggregatedScore?: number;
  maxScore: number;
  scheduledDate?: string;
  completedDate?: string;
  panelMemberIds: string[];
  /** Estimated duration in minutes for this stage */
  estimatedDuration?: number;
  /** Interview mode for this stage (ai_voice, ai_chat, human_video, etc.) */
  interviewMode?: string;
  /** Weight of this stage in the overall evaluation */
  weight?: number;
}

export interface PanelConsensus {
  recommendation: Recommendation;
  agreementPercentage: number;
  isUnanimous: boolean;
  dissentingMembers: string[];
  distribution: Record<Recommendation, number>;
}

export interface BhPanelCoordinatorProps extends EngineAwareProps {
  preset?: BhPanelCoordinatorPreset;
  stages: InterviewStage[];
  members: PanelMember[];
  consensus?: PanelConsensus;
  candidateName?: string;
  positionTitle?: string;
  selectedStageId?: string;
  onStageSelect?: (stageId: string) => void;
  selectedMemberId?: string;
  onMemberSelect?: (memberId: string) => void;
  onFinalDecision?: (recommendation: Recommendation) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_PANEL_COORDINATOR_DEFAULTS: Partial<BhPanelCoordinatorProps> = {
  preset: 'timeline',
};

export function getRecommendationColors(tokens: DesignTokens) {
  return {
    strong_hire: { color: tokens.colors.successScale[800], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    hire: { color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    no_hire: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    strong_no_hire: { color: tokens.colors.errorScale[800], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
  };
}

export function getStageStatusColors(tokens: DesignTokens) {
  return {
    completed: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50] },
    in_progress: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50] },
    scheduled: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50] },
    pending: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100] },
    cancelled: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50] },
  };
}

export function getRecommendationLabel(rec: Recommendation): string {
  const labels: Record<Recommendation, string> = {
    strong_hire: 'Strong Hire',
    hire: 'Hire',
    no_hire: 'No Hire',
    strong_no_hire: 'Strong No Hire',
  };
  return labels[rec];
}

export function getAggregationLabel(strategy: AggregationStrategy): string {
  const labels: Record<AggregationStrategy, string> = {
    average: 'Average',
    weighted_average: 'Weighted Avg',
    max: 'Maximum',
    min: 'Minimum',
    consensus: 'Consensus',
  };
  return labels[strategy];
}
