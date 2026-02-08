import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhInterviewReplayPreset = 'full' | 'compact';

export type SpeakerRole = 'candidate' | 'interviewer' | 'system';

export interface TranscriptEntry {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  text: string;
  timestamp: string;
  durationMs?: number;
  confidence?: number;
  hasEvidence?: boolean;
}

export interface ScoreOverlayPoint {
  timestamp: string;
  dimension: string;
  dimensionCode: string;
  score: number;
  maxScore: number;
  evidenceId?: string;
}

export interface EvidenceMarker {
  id: string;
  transcriptEntryId: string;
  quote: string;
  dimension: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
}

export interface PersonaInfo {
  name: string;
  tone: string;
  style: string;
  voiceProvider?: string;
}

export interface ReplayScoreSummary {
  overall: number;
  maxScore: number;
  dimensions: Array<{ name: string; code: string; score: number; maxScore: number }>;
  strengths: string[];
  weaknesses: string[];
}

export interface BhInterviewReplayProps extends EngineAwareProps {
  preset?: BhInterviewReplayPreset;
  transcript: TranscriptEntry[];
  scoreOverlay?: ScoreOverlayPoint[];
  evidenceMarkers?: EvidenceMarker[];
  persona?: PersonaInfo;
  scoreSummary?: ReplayScoreSummary;
  candidateName?: string;
  jobTitle?: string;
  interviewDate?: string;
  duration?: string;
  selectedEntryId?: string;
  onEntrySelect?: (entryId: string) => void;
  showScoreOverlay?: boolean;
  onToggleScoreOverlay?: (show: boolean) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_INTERVIEW_REPLAY_DEFAULTS: Partial<BhInterviewReplayProps> = {
  preset: 'full',
  showScoreOverlay: true,
};

export function getSpeakerColors(tokens: DesignTokens) {
  return {
    candidate: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50], border: tokens.colors.primaryScale[200] },
    interviewer: { color: tokens.colors.secondaryScale[700], bgColor: tokens.colors.secondaryScale[50], border: tokens.colors.secondaryScale[200] },
    system: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], border: tokens.colors.neutral[200] },
  };
}

export function getImpactColors(tokens: DesignTokens) {
  return {
    positive: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50] },
    negative: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50] },
    neutral: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100] },
  };
}

export function getScoreBarColor(score: number, maxScore: number, tokens: DesignTokens): string {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.7) return tokens.colors.successScale[500];
  if (ratio >= 0.4) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}
