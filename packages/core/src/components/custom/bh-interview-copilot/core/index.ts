/**
 * BhInterviewCopilot - Core Interface
 * Real-time AI coaching copilot for interviewers during live interviews.
 * Provides whispered suggestions, talk time tracking, and dimension coverage.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhInterviewCopilotPreset = 'sidebar' | 'review';

// =============================================================================
// WHISPER TYPES
// =============================================================================

/** Whisper categories for different coaching suggestions */
export type WhisperType =
  | 'question_suggestion'
  | 'behavioral_cue'
  | 'follow_up'
  | 'pacing_alert'
  | 'bias_warning'
  | 'dimension_coverage'
  | 'encouragement';

/** Priority level for a whisper */
export type WhisperPriority = 'low' | 'medium' | 'high' | 'urgent';

/** Copilot session status */
export type CopilotSessionStatus = 'active' | 'paused' | 'completed' | 'cancelled';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A single coaching whisper delivered to the interviewer */
export interface Whisper {
  id: string;
  type: WhisperType;
  content: string;
  priority: WhisperPriority;
  timestamp: Date | string;
  acknowledged: boolean;
  acknowledgedAt?: Date | string;
  pinned: boolean;
  dimension?: string;
  confidence?: number;
}

/** Talk time breakdown for the interview */
export interface TalkTimeData {
  interviewerPercent: number;
  candidatePercent: number;
  silencePercent: number;
  idealRange: { min: number; max: number };
}

/** Dimension coverage tracking */
export interface DimensionCoverage {
  dimension: string;
  dimensionCode: string;
  coveragePercent: number;
  whisperCount: number;
  suggestions: string[];
}

/** A live or completed copilot coaching session */
export interface CopilotSession {
  id: string;
  interviewId: string;
  rubricId: string;
  interviewerUserId?: string;
  status: CopilotSessionStatus;
  startedAt: Date | string;
  endedAt?: Date | string;
  whispers: Whisper[];
  talkTimeData: TalkTimeData;
  interviewerScore?: number;
  interviewerNotes?: string;
}

/** Post-interview copilot effectiveness review */
export interface CopilotReview {
  sessionId: string;
  interviewId: string;
  whispersSent: number;
  whispersAcknowledged: number;
  topWhispers: Whisper[];
  talkTimeAnalysis: TalkTimeData & {
    deviationFromIdeal: number;
    segments: Array<{
      startSeconds: number;
      endSeconds: number;
      speaker: 'interviewer' | 'candidate' | 'silence';
    }>;
  };
  dimensionCoverage: DimensionCoverage[];
  overallEffectiveness: number;
  recommendations: string[];
  whisperTypeCounts: Record<WhisperType, number>;
  interviewerScore?: number;
  interviewerNotes?: string;
  interviewDate?: Date | string;
  interviewDuration?: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhInterviewCopilotProps extends EngineAwareProps {
  preset?: BhInterviewCopilotPreset;

  /** The copilot session data */
  session?: CopilotSession;

  /** The copilot review data (for review preset) */
  review?: CopilotReview;

  /** Dimension coverage data */
  dimensionCoverage?: DimensionCoverage[];

  /** Callback when a whisper is acknowledged */
  onAcknowledgeWhisper?: (whisperId: string) => void;

  /** Callback when a whisper is pinned/unpinned */
  onPinWhisper?: (whisperId: string, pinned: boolean) => void;

  /** Callback to pause/resume the copilot */
  onTogglePause?: () => void;

  /** Callback to adjust sensitivity */
  onAdjustSensitivity?: (level: 'low' | 'medium' | 'high') => void;

  /** Interview title for context */
  interviewTitle?: string;

  /** Candidate name for context */
  candidateName?: string;

  /** Interviewer name for context */
  interviewerName?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_INTERVIEW_COPILOT_DEFAULTS: Partial<BhInterviewCopilotProps> = {
  preset: 'sidebar',
};

// =============================================================================
// HELPERS
// =============================================================================

/** Get color tokens for each whisper type */
export function getWhisperTypeColors(tokens: DesignTokens) {
  return {
    question_suggestion: {
      bg: tokens.colors.primaryScale[50],
      border: tokens.colors.primaryScale[200],
      text: tokens.colors.primaryScale[700],
      icon: tokens.colors.primaryScale[500],
    },
    behavioral_cue: {
      bg: tokens.colors.infoScale[50],
      border: tokens.colors.infoScale[200],
      text: tokens.colors.infoScale[700],
      icon: tokens.colors.infoScale[500],
    },
    follow_up: {
      bg: tokens.colors.secondaryScale[50],
      border: tokens.colors.secondaryScale[200],
      text: tokens.colors.secondaryScale[700],
      icon: tokens.colors.secondaryScale[500],
    },
    pacing_alert: {
      bg: tokens.colors.warningScale[50],
      border: tokens.colors.warningScale[200],
      text: tokens.colors.warningScale[700],
      icon: tokens.colors.warningScale[500],
    },
    bias_warning: {
      bg: tokens.colors.errorScale[50],
      border: tokens.colors.errorScale[200],
      text: tokens.colors.errorScale[700],
      icon: tokens.colors.errorScale[500],
    },
    dimension_coverage: {
      bg: tokens.colors.successScale[50],
      border: tokens.colors.successScale[200],
      text: tokens.colors.successScale[700],
      icon: tokens.colors.successScale[500],
    },
    encouragement: {
      bg: tokens.colors.primaryScale[50],
      border: tokens.colors.primaryScale[100],
      text: tokens.colors.primaryScale[500],
      icon: tokens.colors.primaryScale[400],
    },
  };
}

/** Get priority color mapping */
export function getPriorityColors(tokens: DesignTokens) {
  return {
    low: tokens.colors.neutral[300],
    medium: tokens.colors.infoScale[400],
    high: tokens.colors.warningScale[500],
    urgent: tokens.colors.errorScale[500],
  };
}

/** Get label for whisper type */
export function getWhisperTypeLabel(type: WhisperType): string {
  const labels: Record<WhisperType, string> = {
    question_suggestion: 'Suggested Question',
    behavioral_cue: 'Behavioral Cue',
    follow_up: 'Follow Up',
    pacing_alert: 'Pacing Alert',
    bias_warning: 'Bias Warning',
    dimension_coverage: 'Coverage Gap',
    encouragement: 'Encouragement',
  };
  return labels[type] ?? type;
}

/** Get icon symbol for whisper type */
export function getWhisperTypeIcon(type: WhisperType): string {
  const icons: Record<WhisperType, string> = {
    question_suggestion: '?',
    behavioral_cue: '!',
    follow_up: '+',
    pacing_alert: '~',
    bias_warning: '!',
    dimension_coverage: '%',
    encouragement: '*',
  };
  return icons[type] ?? '>';
}

/** All whisper types for iteration */
export const WHISPER_TYPES: WhisperType[] = [
  'question_suggestion',
  'behavioral_cue',
  'follow_up',
  'pacing_alert',
  'bias_warning',
  'dimension_coverage',
  'encouragement',
];

/** Re-export n helper for convenience */
export { n };
