/**
 * PmPaymentMethodSelector - Core Interface
 * Select payment methods including cards, bank transfers, and digital wallets
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPaymentMethodSelectorPreset = 'grid' | 'list';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'crypto';
export interface PaymentMethodSelectorItem {
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

export interface PmPaymentMethodSelectorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPaymentMethodSelectorPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PaymentMethodSelectorItem[];
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

export const PM_PAYMENT_METHOD_SELECTOR_DEFAULTS: Partial<PmPaymentMethodSelectorProps> = {
  preset: 'grid',
};
