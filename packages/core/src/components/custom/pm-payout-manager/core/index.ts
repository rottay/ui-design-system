/**
 * PmPayoutManager - Core Interface
 * Manage payouts to recipients with scheduling, batching, and status tracking
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPayoutManagerPreset = 'table' | 'cards';

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
export interface PayoutManagerItem {
  id: string;
  recipientName: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  method: 'bank_transfer' | 'paypal' | 'crypto';
  createdAt: string;
  arrivedAt?: string;
}

export interface PmPayoutManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPayoutManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PayoutManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PAYOUT_MANAGER_DEFAULTS: Partial<PmPayoutManagerProps> = {
  preset: 'table',
};
