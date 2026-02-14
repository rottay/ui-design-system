/**
 * BhCandidateComparison - Core Interface
 * Side-by-side 2-4 candidates, radar overlay, delta table
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBCandidate[] directly.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBCandidate } from '@rottay/recruiter';

export type BhCandidateComparisonPreset = 'side-by-side' | 'overlay';

export type RecruiterCandidate = DBCandidate;

/**
 * Comparison data wraps a DBCandidate with externally-computed scores.
 * The scores record maps dimension names to numeric values (0-100).
 */
export interface ComparisonCandidate {
  /** The candidate record from the DB */
  candidate: DBCandidate;
  /** Score dimensions (e.g. Technical: 92, Communication: 85) */
  scores: Record<string, number>;
}

export interface BhCandidateComparisonProps extends EngineAwareProps {
  preset?: BhCandidateComparisonPreset;

  /** Candidates to compare (2-4) */
  candidates?: ComparisonCandidate[];

  /** Skill/score dimensions to compare */
  dimensions?: string[];

  /** Title */
  title?: string;

  /** Callback when a candidate is selected */
  onCandidateSelect?: (candidateId: string) => void;

  /** Currently highlighted candidate */
  highlightedId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CANDIDATE_COMPARISON_DEFAULTS: Partial<BhCandidateComparisonProps> = {
  preset: 'side-by-side',
};

/**
 * Get the candidate's full name from DB fields.
 */
export function getCandidateFullName(candidate: DBCandidate): string {
  return `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim();
}

/**
 * Get the candidate's current role display string.
 */
export function getCandidateRole(candidate: DBCandidate): string {
  const title = candidate.currentTitle ?? '';
  const company = candidate.currentCompany ?? '';
  if (title && company) return `${title} at ${company}`;
  return title || company || '';
}

/**
 * Get years of experience display string.
 */
export function getCandidateExperience(candidate: DBCandidate): string {
  if (candidate.yearsOfExperience == null) return '';
  return `${candidate.yearsOfExperience} years`;
}
