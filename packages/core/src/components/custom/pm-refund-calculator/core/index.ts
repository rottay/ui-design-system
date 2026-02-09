/**
 * PmRefundCalculator - Core Interface
 * Calculate refund amounts with prorated billing, usage adjustments, and fees
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmRefundCalculatorPreset = 'calculator' | 'inline';

export type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
export type RefundReason = 'customer_request' | 'duplicate' | 'fraudulent' | 'product_issue' | 'other';
export interface RefundCalculatorItem {
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

export interface PmRefundCalculatorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmRefundCalculatorPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RefundCalculatorItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_REFUND_CALCULATOR_DEFAULTS: Partial<PmRefundCalculatorProps> = {
  preset: 'calculator',
};
