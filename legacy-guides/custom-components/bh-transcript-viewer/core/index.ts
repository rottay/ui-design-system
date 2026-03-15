/**
 * BhTranscriptViewer - Core Interface
 * Interview transcript viewer with highlighted evidence from scoring.
 * Tables: dm-scoring evidence + transcripts from recruiting_interviews.
 *
 * Transcript data comes from recruiting_interviews; scoring evidence from dm-scoring.
 * The component does not directly use DB types from @rottay/ia-chat since transcripts
 * are stored in the recruiting module, but it references provider request context
 * indirectly (via interview AI session data).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhTranscriptViewerPreset = 'reader' | 'analyst';

export interface TranscriptSegment {
  id: string;
  speaker: 'interviewer' | 'candidate';
  speakerName: string;
  timestamp: string;
  text: string;
  highlights?: TranscriptHighlight[];
  /** Duration of this segment in seconds */
  duration?: number;
  /** Transcription confidence score (0-1) */
  confidence?: number;
  /** Language code of the spoken segment (e.g. 'en', 'es') */
  language?: string;
}

export interface TranscriptHighlight {
  startOffset: number;
  endOffset: number;
  dimensionId: string;
  dimensionName: string;
  color: string;
  score: number;
  confidence: number;
  evidenceNote?: string;
  /** Source type of the evidence */
  evidenceType?: 'transcript' | 'behavior' | 'assessment';
  /** AI model used to generate this highlight */
  modelUsed?: string;
}

export interface ScoringDimension {
  id: string;
  name: string;
  color: string;
  score: number;
  maxScore: number;
  confidence: number;
  evidenceCount: number;
}

export interface TranscriptMeta {
  interviewId: string;
  candidateName: string;
  positionTitle: string;
  interviewDate: string;
  interviewType: string;
  duration: string;
  overallScore?: number;
  /** Current status of the transcript processing pipeline */
  transcriptStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  /** URL to the original recording */
  recordingUrl?: string;
  /** Total recording duration in seconds */
  recordingDuration?: number;
  /** Transcription service provider name */
  transcriptionProvider?: string;
  /** Primary language of the interview */
  language?: string;
  /** AI-generated summary of the interview */
  summary?: string;
  /** Status of the AI scoring pipeline */
  aiScoringStatus?: string;
}

export interface BhTranscriptViewerProps extends EngineAwareProps {
  preset?: BhTranscriptViewerPreset;

  /** Transcript metadata */
  meta?: TranscriptMeta;

  /** Transcript segments */
  segments?: TranscriptSegment[];

  /** Scoring dimensions with aggregated scores */
  dimensions?: ScoringDimension[];

  /** Currently selected dimension filter */
  selectedDimension?: string | null;

  /** Callback when dimension is selected */
  onDimensionSelect?: (dimensionId: string | null) => void;

  /** Currently selected segment */
  selectedSegment?: string | null;

  /** Callback when segment is selected */
  onSegmentSelect?: (segmentId: string | null) => void;

  /** Whether to show timestamps */
  showTimestamps?: boolean;

  /** Whether to show confidence scores per segment */
  showConfidence?: boolean;

  /** Playback speed multiplier (e.g. 1, 1.5, 2) */
  playbackSpeed?: number;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TRANSCRIPT_VIEWER_DEFAULTS: Partial<BhTranscriptViewerProps> = {
  preset: 'reader',
  showTimestamps: true,
};
