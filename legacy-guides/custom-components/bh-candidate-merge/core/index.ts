/**
 * BhCandidateMerge - Core Interface
 * Duplicate detection with field-level merge UI
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBCandidate[] for the records to merge.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBCandidate } from '@rottay/recruiter';

export type BhCandidateMergePreset = 'merge' | 'compact';

export type RecruiterCandidate = DBCandidate;

export interface MergeField {
  field: string;
  values: string[];
  selectedIndex: number;
  /** Category for grouping fields in the UI (e.g. 'personal', 'compensation', 'documents', 'skills') */
  category?: 'personal' | 'compensation' | 'documents' | 'skills' | 'experience' | 'contact' | 'source' | 'other';
  /** Source attribution per value (which system/import provided each value) */
  sourceAttribution?: string[];
}

export interface BhCandidateMergeProps extends EngineAwareProps {
  preset?: BhCandidateMergePreset;

  /** Candidate records to merge - accepts DBCandidate[] from @rottay/recruiter */
  candidates?: DBCandidate[];

  /** Fields to merge with values from each candidate */
  mergeFields?: MergeField[];

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

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterCandidate (DBCandidate) instead */
export type MergeCandidate = RecruiterCandidate;

/**
 * Get the candidate's full name from DB fields.
 */
export function getCandidateFullName(candidate: DBCandidate): string {
  return `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim();
}
