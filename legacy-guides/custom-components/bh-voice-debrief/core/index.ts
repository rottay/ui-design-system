/**
 * BhVoiceDebrief - Core Interface
 * Dashboard widget showing voice debrief sessions at a glance.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import { n } from '../../helpers';

// =============================================================================
// PRESET TYPE
// =============================================================================

export type BhVoiceDebriefPreset = 'compact';

// =============================================================================
// DATA TYPES
// =============================================================================

/** A key moment from a voice debrief session */
export interface KeyMoment {
  timestamp: number;
  type: 'highlight' | 'concern' | 'question' | 'insight';
  label: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/** Summary of a voice debrief session */
export interface VoiceDebriefSession {
  interviewId: string;
  interviewTitle: string;
  candidateName: string;
  duration: number;
  recordedAt: Date | string;
  transcriptAvailable: boolean;
  keyMoments: KeyMoment[];
  overallSentiment: 'positive' | 'neutral' | 'mixed' | 'negative';
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhVoiceDebriefProps extends EngineAwareProps {
  preset?: BhVoiceDebriefPreset;

  /** Voice debrief sessions */
  sessions?: VoiceDebriefSession[];

  /** Loading state */
  loading?: boolean;

  /** Callback when play is clicked on a session */
  onPlaySession?: (interviewId: string) => void;

  /** Callback when view transcript is clicked */
  onViewTranscript?: (interviewId: string) => void;

  /** Maximum sessions to display */
  maxDisplay?: number;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const BH_VOICE_DEBRIEF_DEFAULTS: Partial<BhVoiceDebriefProps> = {
  preset: 'compact',
  maxDisplay: 3,
};

// =============================================================================
// HELPERS
// =============================================================================

/** Returns the appropriate color from tokens based on sentiment */
export function getSentimentColor(
  sentiment: 'positive' | 'neutral' | 'mixed' | 'negative',
  tokens: DesignTokens,
): string {
  switch (sentiment) {
    case 'positive':
      return tokens.colors.successScale[500];
    case 'neutral':
      return tokens.colors.neutral[400];
    case 'mixed':
      return tokens.colors.warningScale[500];
    case 'negative':
      return tokens.colors.errorScale[500];
  }
}

/** Formats seconds into a human-readable duration string */
export function formatSessionDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  }
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/** Re-export n helper for convenience */
export { n };
