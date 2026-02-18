/**
 * BhApprovalCenter - Core Interface
 * Central hub for approvals grouped by entity type in BitHire ATS platform
 *
 * DB Reference: DBApprovalRequest from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBApprovalRequest } from '@rottay/recruiter';

export type BhApprovalCenterPreset = 'hub' | 'compact';

/** Re-export for consumer convenience */
export type { DBApprovalRequest };

export interface ApprovalItem {
  id?: string;
  entityType?: 'offer' | 'position' | 'budget' | 'job' | 'client' | 'impersonation_request';
  entityTitle?: string;
  requestedBy?: string;
  requestedAt?: Date;
  priority?: 'high' | 'medium' | 'low' | 'normal' | 'urgent';
  status?: 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'auto_approved' | 'cancelled';

  /** Entity ID for the approval target */
  entityId?: string;
  /** Current step number in the approval chain */
  currentStep?: number;
  /** Total number of steps in the approval chain */
  totalSteps?: number;
  /** Due date for this approval */
  dueAt?: Date;
  /** Whether this approval has been escalated */
  isEscalated?: boolean;
  /** Reason for escalation */
  escalationReason?: string;
  /** Date/time when auto-approval will trigger */
  autoApproveAt?: Date;
  /** Role of the person who requested the approval */
  requesterRole?: string;
  /** Team name of the requester */
  requesterTeamName?: string;
  /** Brief description of the approval request */
  description?: string;
}

export interface BhApprovalCenterProps extends EngineAwareProps {
  preset?: BhApprovalCenterPreset;

  /** Array of approval items */
  approvals?: ApprovalItem[];

  /** How to group approvals */
  groupBy?: 'entityType' | 'priority' | 'status';

  /** Callback when an approval item is clicked */
  onApprovalClick?: (approvalId: string) => void;

  /** Callback when approve action is triggered */
  onApprove?: (approvalId: string) => void;

  /** Callback when reject action is triggered */
  onReject?: (approvalId: string) => void;

  /** Currently selected approval ID */
  selectedApprovalId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_APPROVAL_CENTER_DEFAULTS: Partial<BhApprovalCenterProps> = {
  preset: 'hub',
  groupBy: 'entityType',
  loading: false,
};
