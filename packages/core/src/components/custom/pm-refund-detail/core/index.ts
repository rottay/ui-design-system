/**
 * PmRefundDetail - Core Interface
 * View refund details with original payment link, processing timeline, and notes
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmRefundDetailPreset = 'panel' | 'timeline';

export type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
export type RefundReason = 'customer_request' | 'duplicate' | 'fraudulent' | 'product_issue' | 'other';
export interface RefundDetailItem {
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

export interface PmRefundDetailProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmRefundDetailPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RefundDetailItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_REFUND_DETAIL_DEFAULTS: Partial<PmRefundDetailProps> = {
  preset: 'panel',
};
