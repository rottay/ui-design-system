import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhEvidenceBrowserPreset = 'split-pane' | 'compact';

export type EvidenceImpact = 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
export type SpeakerRole = 'candidate' | 'interviewer' | 'system';

export interface TranscriptSegment {
  id: string;
  speaker: SpeakerRole;
  speakerName: string;
  text: string;
  timestamp: string;
  hasEvidence?: boolean;
}

export interface EvidenceItem {
  id: string;
  quote: string;
  dimension: string;
  dimensionCode: string;
  impact: EvidenceImpact;
  score: number;
  transcriptSegmentId?: string;
  validated?: boolean;
  timestamp?: string;
}

export interface EvidenceFilter {
  dimension?: string;
  impact?: EvidenceImpact;
  validated?: boolean;
}

export interface BhEvidenceBrowserProps extends EngineAwareProps {
  preset?: BhEvidenceBrowserPreset;
  transcript: TranscriptSegment[];
  evidence: EvidenceItem[];
  dimensions?: string[];
  selectedEvidenceId?: string;
  onEvidenceSelect?: (evidenceId: string) => void;
  onValidate?: (evidenceId: string, validated: boolean) => void;
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
    strong_positive: { color: tokens.colors.successScale[800], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    positive: { color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    neutral: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], border: tokens.colors.neutral[200] },
    negative: { color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    strong_negative: { color: tokens.colors.errorScale[800], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
  };
}

export function getImpactLabel(impact: EvidenceImpact): string {
  const labels: Record<EvidenceImpact, string> = {
    strong_positive: 'Strong +',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    strong_negative: 'Strong -',
  };
  return labels[impact];
}

export function getSpeakerColors(tokens: DesignTokens) {
  return {
    candidate: { color: tokens.colors.primaryScale[700], bgColor: tokens.colors.primaryScale[50] },
    interviewer: { color: tokens.colors.secondaryScale[700], bgColor: tokens.colors.secondaryScale[50] },
    system: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100] },
  };
}
