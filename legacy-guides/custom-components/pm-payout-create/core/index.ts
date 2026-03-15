/**
 * PmPayoutCreate - Core Interface
 * Create payouts with recipient selection, amount, and transfer method options
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPayoutCreatePreset = 'form' | 'wizard';

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
export interface PayoutCreateItem {
  id: string;
  recipientName: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  method: 'bank_transfer' | 'paypal' | 'crypto';
  createdAt: string;
  arrivedAt?: string;
}

export interface PmPayoutCreateProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPayoutCreatePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PayoutCreateItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PAYOUT_CREATE_DEFAULTS: Partial<PmPayoutCreateProps> = {
  preset: 'form',
};
