/**
 * BhVoiceDebriefPlayer - Core Interface
 * Full debrief experience for BitHire ATS platform - recording and
 * reviewing interview debriefs with sentiment analysis, key moments,
 * and transcript synchronization.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhVoiceDebriefPlayerPreset = 'recorder' | 'review';

// =============================================================================
// TRANSCRIPT SEGMENT
// =============================================================================

/**
 * A segment of transcript text with metadata.
 */
export interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  speaker: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  isKeyMoment: boolean;
}

// =============================================================================
// KEY MOMENT
// =============================================================================

/**
 * A marked moment during a debrief recording.
 */
export interface KeyMoment {
  timestamp: number;
  type: 'highlight' | 'concern' | 'question' | 'insight' | 'red_flag';
  label: string;
  notes?: string;
}

// =============================================================================
// SENTIMENT TIMELINE
// =============================================================================

/**
 * A point in the sentiment timeline.
 */
export interface SentimentTimeline {
  timestamp: number;
  score: number;
}

// =============================================================================
// DEBRIEF RECORDING
// =============================================================================

/**
 * A complete debrief recording entity for display.
 */
export interface DebriefRecording {
  id: string;
  interviewId: string;
  interviewTitle: string;
  candidateName: string;
  duration: number;
  recordedAt: Date;
  recordedBy: string;
  audioUrl?: string;
  transcriptSegments: TranscriptSegment[];
  keyMoments: KeyMoment[];
  sentiment: SentimentTimeline[];
  summary?: string;
  tags: string[];
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhVoiceDebriefPlayerProps extends EngineAwareProps {
  preset?: BhVoiceDebriefPlayerPreset;

  /** The debrief recording data */
  recording?: DebriefRecording;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback to start recording */
  onStartRecording?: () => void;

  /** Callback to stop recording */
  onStopRecording?: () => void;

  /** Callback to mark a moment during recording */
  onMarkMoment?: (type: KeyMoment['type'], label: string, notes?: string) => void;

  /** Callback to add a note */
  onAddNote?: (note: string) => void;

  /** Callback to export the debrief */
  onExport?: (format: 'transcript' | 'summary' | 'moments' | 'full') => void;

  /** Whether currently recording */
  isRecording?: boolean;

  /** Current playback/recording time in seconds */
  currentTime?: number;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_VOICE_DEBRIEF_PLAYER_DEFAULTS: Partial<BhVoiceDebriefPlayerProps> = {
  preset: 'recorder',
};
