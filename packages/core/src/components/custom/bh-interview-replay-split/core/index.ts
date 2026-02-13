/**
 * BhInterviewReplaySplit - Core Interface
 * Waveform + synced transcript + evidence markers
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

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
}

export const BH_INTERVIEW_REPLAY_SPLIT_DEFAULTS: Partial<BhInterviewReplaySplitProps> = {
  preset: 'split',
  playbackSpeed: 1,
};
