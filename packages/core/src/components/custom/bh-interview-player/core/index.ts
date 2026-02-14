/**
 * BhInterviewPlayer - Core Interface
 * Interview Replay player for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * Player-specific types (TranscriptLine, InterviewScorecard, etc.) are UI-only.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBInterview } from '@rottay/recruiter';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterInterview = DBInterview;

// ============================================================================
// Preset Type
// ============================================================================

export type BhInterviewPlayerPreset = 'full' | 'transcript-only';

// ============================================================================
// Evidence & Scoring Types
// ============================================================================

export interface EvidenceHighlight {
  dimensionId: string;
  dimensionName: string;
  scoreContribution: number;
  startIdx: number;
  endIdx: number;
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

export interface InterviewScorecard {
  overallScore: number;
  overallLevel: 'excellent' | 'good' | 'average' | 'below' | 'poor';
  confidence: number;
  dimensions: ScorecardDimension[];
}

// ============================================================================
// Transcript Types
// ============================================================================

export interface TranscriptLine {
  id: string;
  speaker: 'candidate' | 'agent';
  text: string;
  timestamp: number;
  evidenceHighlights?: EvidenceHighlight[];
}

// ============================================================================
// Notes & Insights
// ============================================================================

export interface TimestampedNote {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: number;
  content: string;
}

export interface AiInsight {
  category: 'strength' | 'concern' | 'style' | 'depth';
  text: string;
}

// ============================================================================
// Interview Info
// ============================================================================

export interface InterviewInfo {
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  stageName: string;
  date: string;
  duration: number;
  status: string;
}

// ============================================================================
// Props
// ============================================================================

export interface BhInterviewPlayerProps extends EngineAwareProps {
  preset?: BhInterviewPlayerPreset;

  /** Optional DB interview for pre-populating data */
  interview?: DBInterview;

  interviewInfo: InterviewInfo;
  transcript: TranscriptLine[];
  scorecard: InterviewScorecard;
  notes: TimestampedNote[];
  insights: AiInsight[];
  audioUrl?: string;
  audioDuration: number;
  onAddNote?: (content: string, timestamp: number) => void;
  onApproveScore?: () => void;
  onRequestRescore?: () => void;
  onFlagForReview?: () => void;
  onDownloadTranscript?: () => void;
}

// ============================================================================
// Defaults
// ============================================================================

export const BH_INTERVIEW_PLAYER_DEFAULTS: Partial<BhInterviewPlayerProps> = {
  preset: 'full',
};

// ============================================================================
// Utilities - Level Colors
// ============================================================================

export function getLevelColors(tokens: DesignTokens) {
  return {
    excellent: {
      bg: tokens.colors.successScale[50],
      text: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      ring: tokens.colors.successScale[500],
    },
    good: {
      bg: tokens.colors.successScale[50],
      text: tokens.colors.successScale[600],
      border: tokens.colors.successScale[200],
      ring: tokens.colors.successScale[400],
    },
    average: {
      bg: tokens.colors.warningScale[50],
      text: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      ring: tokens.colors.warningScale[500],
    },
    below: {
      bg: tokens.colors.warningScale[50],
      text: tokens.colors.warningScale[800],
      border: tokens.colors.warningScale[300],
      ring: tokens.colors.warningScale[600],
    },
    poor: {
      bg: tokens.colors.errorScale[50],
      text: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      ring: tokens.colors.errorScale[500],
    },
  };
}

// ============================================================================
// Utilities - Insight Category Colors
// ============================================================================

export function getInsightCategoryColors(tokens: DesignTokens) {
  return {
    strength: {
      bg: tokens.colors.successScale[50],
      text: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      icon: tokens.colors.successScale[500],
    },
    concern: {
      bg: tokens.colors.warningScale[50],
      text: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      icon: tokens.colors.warningScale[500],
    },
    style: {
      bg: tokens.colors.infoScale[50],
      text: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
      icon: tokens.colors.infoScale[500],
    },
    depth: {
      bg: tokens.colors.primaryScale[50],
      text: tokens.colors.primaryScale[700],
      border: tokens.colors.primaryScale[200],
      icon: tokens.colors.primaryScale[500],
    },
  };
}

// ============================================================================
// Utilities - Format Time
// ============================================================================

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============================================================================
// Utilities - Generate Waveform Points
// ============================================================================

export function generateWaveformPoints(
  width: number,
  height: number,
  numPoints: number,
  seed: number = 42,
): string {
  const points: string[] = [];
  const midY = height / 2;
  let pseudoRandom = seed;

  for (let i = 0; i < numPoints; i++) {
    pseudoRandom = (pseudoRandom * 16807 + 0) % 2147483647;
    const normalizedRandom = pseudoRandom / 2147483647;
    const amplitude = midY * (0.2 + normalizedRandom * 0.8);
    const x = (i / (numPoints - 1)) * width;
    const y = midY - amplitude + (normalizedRandom > 0.5 ? amplitude * 0.3 : -amplitude * 0.3);
    points.push(`${x.toFixed(1)},${Math.max(2, Math.min(height - 2, y)).toFixed(1)}`);
  }

  return points.join(' ');
}

// ============================================================================
// Utilities - Dimension Score Color
// ============================================================================

export function getDimensionScoreColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.successScale[400];
  if (score >= 40) return tokens.colors.warningScale[500];
  if (score >= 20) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[500];
}

export function getDimensionScoreGradient(score: number, tokens: DesignTokens): { start: string; end: string } {
  if (score >= 80) return { start: tokens.colors.successScale[400], end: tokens.colors.successScale[600] };
  if (score >= 60) return { start: tokens.colors.successScale[300], end: tokens.colors.successScale[500] };
  if (score >= 40) return { start: tokens.colors.warningScale[300], end: tokens.colors.warningScale[500] };
  if (score >= 20) return { start: tokens.colors.warningScale[400], end: tokens.colors.warningScale[600] };
  return { start: tokens.colors.errorScale[400], end: tokens.colors.errorScale[600] };
}
