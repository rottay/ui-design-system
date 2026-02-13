/**
 * BhCandidateComparison - Core Interface
 * Side-by-side 2-4 candidates, radar overlay, delta table
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCandidateComparisonPreset = 'side-by-side' | 'overlay';

export interface ComparisonCandidate {
  id: string;
  name: string;
  scores: Record<string, number>;
  experience: string;
  education: string;
  status: string;
}

export interface BhCandidateComparisonProps extends EngineAwareProps {
  preset?: BhCandidateComparisonPreset;

  /** Candidates to compare (2-4) */
  candidates: ComparisonCandidate[];

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
