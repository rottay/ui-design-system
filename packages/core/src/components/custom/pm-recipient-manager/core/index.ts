/**
 * PmRecipientManager - Core Interface
 * Manage payout recipients with bank accounts, verification, and payment history
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmRecipientManagerPreset = 'table' | 'cards';

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
export interface RecipientManagerItem {
  id: string;
  recipientName: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  method: 'bank_transfer' | 'paypal' | 'crypto';
  createdAt: string;
  arrivedAt?: string;
}

export interface PmRecipientManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmRecipientManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: RecipientManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_RECIPIENT_MANAGER_DEFAULTS: Partial<PmRecipientManagerProps> = {
  preset: 'table',
};
