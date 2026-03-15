/**
 * BhApprovalDetail - Core Interface
 * Approval detail drawer/panel for BitHire ATS platform
 *
 * DB Reference: DBApprovalRequest from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApprovalRequest } from '@rottay/recruiter';

export type BhApprovalDetailPreset = 'drawer' | 'compact';

/** Re-export for consumer convenience */
export type { DBApprovalRequest };

export interface ApprovalDetailData {
  id?: string;
  entityType?: 'offer' | 'position' | 'budget' | 'job' | 'client' | 'impersonation_request';
  entityTitle?: string;
  requestedBy?: string;
  requestedAt?: Date;
  description?: string;
  priority?: 'high' | 'medium' | 'low' | 'normal' | 'urgent';
  status?: 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'auto_approved' | 'cancelled';
  chain?: Array<{
    approverName?: string;
    status?: string;
    decidedAt?: Date;
  }>;
  attachments?: Array<{
    name?: string;
    type?: string;
  }>;

  /** Entity ID for the approval target */
  entityId?: string;
  /** Snapshot of the entity at time of request */
  entitySnapshot?: Record<string, unknown>;
  /** Role of the person who requested the approval */
  requesterRole?: string;
  /** Team name of the requester */
  requesterTeamName?: string;
  /** Whether this approval has been escalated */
  isEscalated?: boolean;
  /** Reason for escalation */
  escalationReason?: string;
  /** Due date for this approval */
  dueAt?: Date;
  /** Expiration date after which this request is void */
  expiresAt?: Date;
  /** Whether auto-approval is enabled for this request */
  autoApprovalEnabled?: boolean;
  /** Date/time when auto-approval will trigger */
  autoApproveAt?: Date;
  /** List of changes requested by reviewers */
  changesRequested?: string[];
  /** Comments from reviewers */
  reviewerComments?: string;
  /** Internal notes not visible to requester */
  internalNotes?: string;
}

export interface BhApprovalDetailProps extends EngineAwareProps {
  preset?: BhApprovalDetailPreset;

  /** The approval data to display */
  approval?: ApprovalDetailData | null;

  /** Callback when approve is clicked */
  onApprove?: () => void;

  /** Callback when reject is clicked */
  onReject?: () => void;

  /** Callback when a comment is submitted */
  onComment?: (comment: string) => void;

  /** Callback when close/dismiss is clicked */
  onClose?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_APPROVAL_DETAIL_DEFAULTS: Partial<BhApprovalDetailProps> = {
  preset: 'drawer',
  loading: false,
};
