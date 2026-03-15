/**
 * PmRefundManager - Core Interface
 * Process and track refunds with reason codes, approval workflows, and status
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmRefundManagerPreset = 'table' | 'cards';

export type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
export type RefundReason = 'customer_request' | 'duplicate' | 'fraudulent' | 'product_issue' | 'other';
export interface RefundManagerItem {
  id: string;
  paymentId: string;
  amount: string;
  currency: string;
  status: RefundStatus;
  reason: RefundReason;
  customer?: string;
  createdAt: string;
  note?: string;
}

export interface PmRefundManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmRefundManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RefundManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_REFUND_MANAGER_DEFAULTS: Partial<PmRefundManagerProps> = {
  preset: 'table',
};
