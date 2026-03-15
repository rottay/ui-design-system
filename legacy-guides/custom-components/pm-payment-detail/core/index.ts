/**
 * PmPaymentDetail - Core Interface
 * View payment details with transaction timeline, refund history, and metadata
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPaymentDetailPreset = 'panel' | 'timeline';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'crypto';
export interface PaymentDetailItem {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  customer?: string;
  description?: string;
  createdAt: string;
  reference?: string;
}

export interface PmPaymentDetailProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPaymentDetailPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PaymentDetailItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PAYMENT_DETAIL_DEFAULTS: Partial<PmPaymentDetailProps> = {
  preset: 'panel',
};
