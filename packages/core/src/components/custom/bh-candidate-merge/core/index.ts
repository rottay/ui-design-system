/**
 * BhCandidateMerge - Core Interface
 * Duplicate detection with field-level merge UI
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCandidateMergePreset = 'merge' | 'compact';

export interface MergeCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  appliedAt: string;
}

export interface MergeField {
  field: string;
  values: string[];
  selectedIndex: number;
}

export interface BhCandidateMergeProps extends EngineAwareProps {
  preset?: BhCandidateMergePreset;

  /** Candidate records to merge */
  candidates: MergeCandidate[];

  /** Fields to merge with values from each candidate */
  mergeFields: MergeField[];

  /** Title */
  title?: string;

  /** Callback when a field value is selected */
  onFieldSelect?: (field: string, candidateIndex: number) => void;

  /** Callback when merge is confirmed */
  onMerge?: () => void;

  /** Callback when merge is canceled */
  onCancel?: () => void;

  /** Confidence score (0-100) for duplicate match */
  confidenceScore?: number;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CANDIDATE_MERGE_DEFAULTS: Partial<BhCandidateMergeProps> = {
  preset: 'merge',
};
