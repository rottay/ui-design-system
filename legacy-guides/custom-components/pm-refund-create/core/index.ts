/**
 * PmRefundCreate - Core Interface
 * Initiate refunds with amount selection, reason codes, and partial refund support
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmRefundCreatePreset = 'form' | 'wizard';

export type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
export type RefundReason = 'customer_request' | 'duplicate' | 'fraudulent' | 'product_issue' | 'other';
export interface RefundCreateItem {
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

export interface PmRefundCreateProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmRefundCreatePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RefundCreateItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_REFUND_CREATE_DEFAULTS: Partial<PmRefundCreateProps> = {
  preset: 'form',
};
