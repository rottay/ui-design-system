/**
 * PmPaymentManager - Core Interface
 * Manage payments with filtering, status tracking, and batch operations
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPaymentManagerPreset = 'table' | 'cards';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'crypto';
export interface PaymentManagerItem {
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

export interface PmPaymentManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPaymentManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PaymentManagerItem[];
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

export const PM_PAYMENT_MANAGER_DEFAULTS: Partial<PmPaymentManagerProps> = {
  preset: 'table',
};
