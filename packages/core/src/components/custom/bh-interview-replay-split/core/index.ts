/**
 * BhInterviewReplaySplit - Core Interface
 * Waveform + synced transcript + evidence markers
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBInterview } from '@rottay/recruiter';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterInterview = DBInterview;

export type BhInterviewReplaySplitPreset = 'split' | 'compact';

export interface ReplayTranscriptSegment {
  id: string;
  speaker: 'interviewer' | 'candidate' | 'system';
  text: string;
  startTime: number;
  endTime: number;
}

export interface ReplayEvidenceMarker {
  id: string;
  time: number;
  label: string;
  dimensionId?: string;
  severity?: 'positive' | 'neutral' | 'negative';
}

export interface BhInterviewReplaySplitProps extends EngineAwareProps {
  preset?: BhInterviewReplaySplitPreset;

  /** Optional DB interview for pre-populating data */
  interview?: DBInterview;

  transcript: ReplayTranscriptSegment[];
  evidenceMarkers?: ReplayEvidenceMarker[];
  duration: number;
  currentTime?: number;
  isPlaying?: boolean;
  playbackSpeed?: number;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onEvidenceClick?: (markerId: string) => void;
  candidateName?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Whether proctoring was enabled for this interview */
  proctoringEnabled?: boolean;
  /** Proctoring violation flags */
  proctoringFlags?: string[];
  /** Candidate's rating of the interview (1-5) */
  candidateRating?: number;
  /** Billing status (e.g. pending, settled, disputed) */
  billingStatus?: string;
  /** Total token cost for AI interviews */
  tokenCost?: number;
}

export const BH_INTERVIEW_REPLAY_SPLIT_DEFAULTS: Partial<BhInterviewReplaySplitProps> = {
  preset: 'split',
  playbackSpeed: 1,
};
