/**
 * BhCandidateBulkEmail - Core Interface
 * Multi-candidate email with per-candidate preview
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * Recipients are derived from DBCandidate records.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBCandidate } from '@rottay/recruiter';

export type BhCandidateBulkEmailPreset = 'full' | 'compact';

export type RecruiterCandidate = DBCandidate;

/**
 * Recipient for bulk email - wraps a DBCandidate with template variables.
 */
export interface BulkEmailRecipient {
  /** Candidate record from DB */
  candidate: DBCandidate;
  /** Template variables for personalization (e.g. { position: 'Senior Dev' }) */
  variables: Record<string, string>;
  /** Current pipeline status of the candidate */
  status?: string;
  /** Timestamp of last communication with this candidate */
  lastCommunicationAt?: Date;
  /** Total number of communications sent to this candidate */
  communicationCount?: number;
  /** Whether there is a pending response from this candidate */
  candidateResponsePending?: boolean;
}

export interface BhCandidateBulkEmailProps extends EngineAwareProps {
  preset?: BhCandidateBulkEmailPreset;

  /** Recipients for the bulk email */
  recipients?: BulkEmailRecipient[];

  /** Email subject template */
  subject?: string;

  /** Email body template */
  body?: string;

  /** Title */
  title?: string;

  /** Callback when a recipient is toggled */
  onRecipientToggle?: (candidateId: string) => void;

  /** Callback when send is triggered */
  onSend?: () => void;

  /** Callback when preview is requested for a recipient */
  onPreview?: (candidateId: string) => void;

  /** Selected candidate IDs */
  selectedIds?: string[];

  /** Currently previewing candidate ID */
  previewId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CANDIDATE_BULK_EMAIL_DEFAULTS: Partial<BhCandidateBulkEmailProps> = {
  preset: 'full',
};

/**
 * Get the candidate's full name from DB fields.
 */
export function getCandidateFullName(candidate: DBCandidate): string {
  return `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim();
}
