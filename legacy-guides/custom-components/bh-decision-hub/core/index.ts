/**
 * BhDecisionHub - Core Interface
 * Hiring Decision Center for the BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhDecisionHubPreset = 'standard' | 'bulk';

export type DecisionAction = 'advance' | 'reject' | 'hold';

export type RejectCategory =
  | 'not_qualified'
  | 'culture_fit'
  | 'compensation'
  | 'timing'
  | 'other';

export type HistoryFilter = 'all' | 'advance' | 'reject' | 'hold';

export interface DecisionCandidate {
  id: string;
  name: string;
  avatar?: string;
  rank: number;
  scorePercent: number;
  highlights: string[];
  aiRecommendation: string;
  pros: string[];
  cons: string[];
  riskFactors: string[];
}

export interface DecisionRecord {
  candidateId: string;
  decision: DecisionAction;
  rejectCategory?: RejectCategory;
  reason?: string;
  followupDate?: string;
  decidedBy: string;
  decidedAt: string;
}

export interface CompareSlot {
  candidateId: string;
  position: number;
}

export interface BulkDecisionEntry {
  candidateId: string;
  decision: DecisionAction;
  rejectCategory?: RejectCategory;
  reason?: string;
}

export interface RejectReasonData {
  category: RejectCategory;
  reason: string;
  followupDate?: string;
}

export interface AdvanceStepData {
  nextStep: string;
}

export interface DecisionFormData {
  action?: DecisionAction;
  advanceStep?: string;
  rejectCategory?: RejectCategory;
  rejectReason?: string;
  holdReason?: string;
  followupDate?: string;
}

export interface BhDecisionHubProps extends EngineAwareProps {
  /** Preset to use */
  preset?: BhDecisionHubPreset;

  /** Name of the job for this decision set */
  jobName: string;

  /** Number of pending decisions */
  pendingCount: number;

  /** Candidate list to decide on */
  candidates: DecisionCandidate[];

  /** Currently selected candidate ID */
  selectedCandidate?: string | null;

  /** Callback when a candidate is selected */
  onCandidateSelect?: (candidateId: string | null) => void;

  /** Current decision state */
  decision?: DecisionFormData;

  /** Callback when decision form data changes */
  onDecisionChange?: (decision: DecisionFormData) => void;

  /** Reject reason details */
  rejectReason?: RejectReasonData;

  /** Callback when reject reason changes */
  onRejectReasonChange?: (reason: RejectReasonData) => void;

  /** Compare slots for side-by-side comparison */
  compareSlots?: CompareSlot[];

  /** Callback when compare slot changes */
  onCompareSlotChange?: (slots: CompareSlot[]) => void;

  /** Whether confirmation modal is shown */
  showConfirmation?: boolean;

  /** Callback to toggle confirmation modal */
  onConfirmationToggle?: (show: boolean) => void;

  /** Historical decision records */
  history?: DecisionRecord[];

  /** Filter for history timeline */
  historyFilter?: HistoryFilter;

  /** Callback when history filter changes */
  onHistoryFilterChange?: (filter: HistoryFilter) => void;

  /** Bulk decision entries */
  bulkDecisions?: BulkDecisionEntry[];

  /** Callback when bulk decisions change */
  onBulkDecisionChange?: (decisions: BulkDecisionEntry[]) => void;

  /** Callback to submit bulk decisions */
  onBulkSubmit?: () => void;

  /** Whether optional feedback is enabled */
  feedbackEnabled?: boolean;

  /** Callback to toggle feedback */
  onFeedbackToggle?: (enabled: boolean) => void;

  /** Available next steps for advancing */
  advanceSteps?: string[];

  /** Callback to submit a final decision */
  onSubmitDecision?: (candidateId: string, decision: DecisionFormData) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_DECISION_HUB_DEFAULTS: Partial<BhDecisionHubProps> = {
  preset: 'standard',
};

/**
 * Returns decision action display configuration
 */
export function getDecisionActionConfig(tokens: DesignTokens) {
  return {
    advance: {
      label: 'Advance',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      iconColor: tokens.colors.successScale[500],
    },
    reject: {
      label: 'Reject',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      iconColor: tokens.colors.errorScale[500],
    },
    hold: {
      label: 'Hold',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      iconColor: tokens.colors.warningScale[500],
    },
  };
}

/**
 * Returns reject category display labels
 */
export function getRejectCategoryLabel(category: RejectCategory): string {
  const labels: Record<RejectCategory, string> = {
    not_qualified: 'Not Qualified',
    culture_fit: 'Culture Fit',
    compensation: 'Compensation Mismatch',
    timing: 'Timing / Availability',
    other: 'Other',
  };
  return labels[category];
}

/**
 * Returns history filter options
 */
export function getHistoryFilterOptions(): Array<{ value: HistoryFilter; label: string }> {
  return [
    { value: 'all', label: 'All Decisions' },
    { value: 'advance', label: 'Advanced' },
    { value: 'reject', label: 'Rejected' },
    { value: 'hold', label: 'On Hold' },
  ];
}

/**
 * Returns candidate initials from name
 */
export function getCandidateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

/**
 * Formats a score as a percentage display
 */
export function formatScoreDisplay(scorePercent: number): string {
  return `${Math.round(scorePercent)}%`;
}

/**
 * Returns color for score value
 */
export function getScoreColor(tokens: DesignTokens, scorePercent: number) {
  if (scorePercent >= 80) return tokens.colors.successScale[500];
  if (scorePercent >= 60) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/**
 * Returns the track (background) color for score ring
 */
export function getScoreTrackColor(tokens: DesignTokens): string {
  return tokens.colors.neutral[200];
}
