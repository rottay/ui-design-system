/**
 * BhAppealReview - Core Interface
 * Appeal review and resolution panel for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhAppealReviewPreset = 'review' | 'compact';

export interface AppealData {
  id: string;
  candidateName: string;
  positionTitle: string;
  originalDecision: string;
  reason: string;
  evidence: string;
  submittedAt: Date;
  status: 'pending' | 'under-review' | 'approved' | 'denied';
  reviewerNotes?: string;
}

export interface BhAppealReviewProps extends EngineAwareProps {
  preset?: BhAppealReviewPreset;

  /** Appeal data to review */
  appeal: AppealData;

  /** Callback to approve appeal */
  onApprove?: () => void;

  /** Callback to deny appeal */
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

export const BH_APPEAL_REVIEW_DEFAULTS: Partial<BhAppealReviewProps> = {
  preset: 'review',
};
