/**
 * BhApprovalDetail - Core Interface
 * Approval detail drawer/panel for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhApprovalDetailPreset = 'drawer' | 'compact';

export interface ApprovalDetailData {
  id: string;
  entityType: 'offer' | 'position' | 'budget' | 'job';
  entityTitle: string;
  requestedBy: string;
  requestedAt: Date;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
  chain: Array<{
    approverName: string;
    status: string;
    decidedAt?: Date;
  }>;
  attachments?: Array<{
    name: string;
    type: string;
  }>;
}

export interface BhApprovalDetailProps extends EngineAwareProps {
  preset?: BhApprovalDetailPreset;

  /** The approval data to display */
  approval: ApprovalDetailData;

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
