/**
 * BhAppealReview - Core Interface
 * Appeal review and resolution panel for BitHire ATS platform
 *
 * Uses AppealSelect from @rottay/scoring as the entity type.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { AppealSelect, AppealStatusValue } from '@rottay/scoring';

export type BhAppealReviewPreset = 'review' | 'compact';

/** DB appeal status values: 'pending' | 'under_review' | 'approved' | 'rejected' */
export type AppealStatus = AppealStatusValue;

export interface BhAppealReviewProps extends EngineAwareProps {
  preset?: BhAppealReviewPreset;

  /** Appeal data for review (flat UI view model) */
  appeal?: AppealData;

  /** Display name of the candidate (resolved externally) */
  candidateName?: string;

  /** Position title (resolved externally) */
  positionTitle?: string;

  /** Original decision description */
  originalDecision?: string;

  /** Callback to approve appeal */
  onApprove?: () => void;

  /** Callback to deny/reject appeal */
  onDeny?: () => void;

  /** Callback to add reviewer note */
  onAddNote?: (note: string) => void;

  /** Callback to close panel */
  onClose?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

/** UI appeal status for display purposes */
export type AppealDataStatus = 'pending' | 'under-review' | 'approved' | 'denied';

/** Flat appeal data view for preset rendering */
export interface AppealData {
  /** Unique appeal identifier */
  id?: string;
  /** Display name of the candidate */
  candidateName?: string;
  /** Position title */
  positionTitle?: string;
  /** Original decision description */
  originalDecision?: string;
  /** Reason for the appeal */
  reason?: string;
  /** Supporting evidence */
  evidence?: string;
  /** When the appeal was submitted */
  submittedAt?: Date;
  /** UI status for display */
  status?: AppealDataStatus;
  /** Reviewer notes */
  reviewerNotes?: string;
}

export const BH_APPEAL_REVIEW_DEFAULTS: Partial<BhAppealReviewProps> = {
  preset: 'review',
};

/** Re-export DB types for convenience */
export type { AppealSelect, AppealStatusValue };
