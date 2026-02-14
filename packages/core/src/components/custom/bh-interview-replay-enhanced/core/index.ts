/**
 * BhInterviewReplayEnhanced - Core Interface
 * Enhanced Interview Replay with split waveform, synced transcript,
 * evidence markers, and speed controls.
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBInterview } from '@rottay/recruiter';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterInterview = DBInterview;

export type BhInterviewReplayEnhancedPreset = 'split' | 'compact';

export interface TranscriptSegment {
  id: string;
  speaker: 'interviewer' | 'candidate';
  text: string;
  startTime: number;  // seconds
  endTime: number;
  confidence?: number;
}

export interface EvidenceMarker {
  id: string;
  time: number;  // seconds
  label: string;
  dimensionName: string;
  score?: number;
  color?: string;
}

export interface BhInterviewReplayEnhancedProps extends EngineAwareProps {
  preset?: BhInterviewReplayEnhancedPreset;

  /** Optional DB interview for pre-populating data */
  interview?: DBInterview;

  candidateName?: string;
  interviewTitle?: string;
  duration?: number;  // total seconds
  currentTime?: number;
  isPlaying?: boolean;
  playbackSpeed?: number;
  transcript?: TranscriptSegment[];
  evidenceMarkers?: EvidenceMarker[];
  waveformData?: number[];  // amplitude values 0-1
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onSpeedChange?: (speed: number) => void;
  onEvidenceClick?: (markerId: string) => void;
  onTranscriptSegmentClick?: (segmentId: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_INTERVIEW_REPLAY_ENHANCED_DEFAULTS: Partial<BhInterviewReplayEnhancedProps> = {
  preset: 'split',
  playbackSpeed: 1,
};
