/**
 * PmPaymentStatus - Core Interface
 * Track payment processing status through authorization, capture, and settlement
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPaymentStatusPreset = 'tracker' | 'badge';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'crypto';
export interface PaymentStatusItem {
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

export interface PmPaymentStatusProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPaymentStatusPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PaymentStatusItem[];
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

export const PM_PAYMENT_STATUS_DEFAULTS: Partial<PmPaymentStatusProps> = {
  preset: 'tracker',
};
