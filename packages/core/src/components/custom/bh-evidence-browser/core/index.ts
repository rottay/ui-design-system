/**
 * BhEvidenceBrowser - Core Interface
 * Evidence browser for reviewing transcript quotes and their scoring impact.
 *
 * Uses EvidenceSelect from @rottay/scoring for DB types.
 * UI types are defined here with proper fields for rendering.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { EvidenceSelect } from '@rottay/scoring';
import { n } from '../../helpers';

export type BhEvidenceBrowserPreset = 'split-pane' | 'compact';

/** Evidence impact values for UI */
export type EvidenceImpact = 'positive' | 'neutral' | 'negative';

export type SpeakerRole = 'candidate' | 'interviewer' | 'system';

/* ── UI types (what presets actually consume) ───────────────────────── */

/** A single evidence item for UI rendering */
export interface EvidenceItem {
  id?: string;
  quote?: string;
  dimension?: string;
  dimensionCode?: string;
  impact?: EvidenceImpact | string;
  score?: number;
  transcriptSegmentId?: string;
  isValidated?: boolean;
  timestamp?: string;
  impactExplanation?: string;
  similarityScore?: number;
  speakerRole?: string;
  speakerName?: string;
  startPosition?: number;
  endPosition?: number;
  turnIndex?: number;
  turnRole?: string;
  withinTurnStartChar?: number;
  withinTurnEndChar?: number;
  validationNotes?: string;
  quoteNormalized?: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  text: string;
  timestamp: string;
  hasEvidence?: boolean;
}

export interface EvidenceFilter {
  dimension?: string;
  impact?: EvidenceImpact;
  isValidated?: boolean;
}

export interface BhEvidenceBrowserProps extends EngineAwareProps {
  preset?: BhEvidenceBrowserPreset;

  /** Transcript segments to display */
  transcript?: TranscriptSegment[];

  /** Evidence items (UI view model) */
  evidence?: EvidenceItem[];

  /** Available dimension names for filtering */
  dimensions?: string[];

  /** Currently selected evidence ID */
  selectedEvidenceId?: string;

  /** Callback when evidence is selected */
  onEvidenceSelect?: (evidenceId: string) => void;

  /** Callback to validate/invalidate evidence */
  onValidate?: (evidenceId: string, isValidated: boolean) => void;

  /** Active filter */
  filter?: EvidenceFilter;

  /** Callback when filter changes */
  onFilterChange?: (filter: EvidenceFilter) => void;

  /** Display name of the candidate */
  candidateName?: string;

  /** Interview/session title */
  interviewTitle?: string;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_EVIDENCE_BROWSER_DEFAULTS: Partial<BhEvidenceBrowserProps> = {
  preset: 'split-pane',
};

export function getImpactColors(tokens: DesignTokens) {
  return {
    positive: { color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    neutral: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], border: tokens.colors.neutral[200] },
    negative: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
  };
}

export function getImpactLabel(impact: string): string {
  const labels: Record<string, string> = {
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
  };
  return labels[impact] ?? impact ?? '';
}

export function getImpactIcon(impact: string): string {
  const icons: Record<string, string> = {
    positive: '+',
    neutral: '~',
    negative: '-',
  };
  return icons[impact] ?? '~';
}

export function getSpeakerColors(tokens: DesignTokens) {
  return {
    candidate: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50] },
    interviewer: { color: tokens.colors.secondaryScale[700], bgColor: tokens.colors.secondaryScale[50] },
    system: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100] },
  };
}

/** All valid impact values for filter iteration */
export const IMPACT_OPTIONS: EvidenceImpact[] = ['positive', 'neutral', 'negative'];

/** Re-export n helper for convenience */
export { n };

/** Re-export DB type for convenience */
export type { EvidenceSelect };
