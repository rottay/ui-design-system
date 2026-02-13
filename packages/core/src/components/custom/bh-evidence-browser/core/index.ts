import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhEvidenceBrowserPreset = 'split-pane' | 'compact';

/**
 * Evidence impact aligned with dm-scoring's 3-level EvidenceImpact type.
 * @see dm-scoring/domain/types/common - EVIDENCE_IMPACT_VALUES
 */
export type EvidenceImpact = 'positive' | 'negative' | 'neutral';
export type SpeakerRole = 'candidate' | 'interviewer' | 'system';

export interface TranscriptSegment {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  text: string;
  timestamp: string;
  hasEvidence?: boolean;
}

/**
 * Evidence item aligned with dm-scoring Evidence entity.
 * @see dm-scoring/domain/entity/evidence
 */
export interface EvidenceItem {
  id: string;
  quote: string;
  dimension: string;
  dimensionCode: string;
  impact: EvidenceImpact;
  impactExplanation?: string;
  score: number;
  speakerRole?: SpeakerRole;
  speakerName?: string;
  turnIndex?: number;
  transcriptSegmentId?: string;
  isValidated: boolean;
  similarityScore?: number;
  timestamp?: string;
}

export interface EvidenceFilter {
  dimension?: string;
  impact?: EvidenceImpact;
  isValidated?: boolean;
}

export interface BhEvidenceBrowserProps extends EngineAwareProps {
  preset?: BhEvidenceBrowserPreset;
  transcript: TranscriptSegment[];
  evidence: EvidenceItem[];
  dimensions?: string[];
  selectedEvidenceId?: string;
  onEvidenceSelect?: (evidenceId: string) => void;
  onValidate?: (evidenceId: string, isValidated: boolean) => void;
  filter?: EvidenceFilter;
  onFilterChange?: (filter: EvidenceFilter) => void;
  candidateName?: string;
  interviewTitle?: string;
  loading?: boolean;
  className?: string;
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

export function getImpactLabel(impact: EvidenceImpact): string {
  const labels: Record<EvidenceImpact, string> = {
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
  };
  return labels[impact];
}

export function getImpactIcon(impact: EvidenceImpact): string {
  const icons: Record<EvidenceImpact, string> = {
    positive: '+',
    neutral: '~',
    negative: '-',
  };
  return icons[impact];
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
