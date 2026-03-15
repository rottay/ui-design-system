/**
 * PmPaymentCreate - Core Interface
 * Create new payments with amount, currency, recipient, and method selection
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPaymentCreatePreset = 'form' | 'checkout';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'crypto';
export interface PaymentCreateItem {
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

export interface PmPaymentCreateProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPaymentCreatePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PaymentCreateItem[];
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

export const PM_PAYMENT_CREATE_DEFAULTS: Partial<PmPaymentCreateProps> = {
  preset: 'form',
};
