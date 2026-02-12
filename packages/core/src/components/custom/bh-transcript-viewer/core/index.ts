/**
 * BhTranscriptViewer - Core Interface
 * Interview transcript viewer with highlighted evidence from scoring.
 * Tables: dm-scoring evidence + transcripts from recruiting_interviews
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

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TRANSCRIPT_VIEWER_DEFAULTS: Partial<BhTranscriptViewerProps> = {
  preset: 'reader',
  showTimestamps: true,
};
