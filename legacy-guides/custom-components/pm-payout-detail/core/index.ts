/**
 * PmPayoutDetail - Core Interface
 * View payout details with recipient info, bank details, and transfer timeline
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmPayoutDetailPreset = 'panel' | 'timeline';

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
export interface PayoutDetailItem {
  id: string;
  recipientName: string;
  amount: string;
  currency: string;
  status: PayoutStatus;
  method: 'bank_transfer' | 'paypal' | 'crypto';
  createdAt: string;
  arrivedAt?: string;
}

export interface PmPayoutDetailProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmPayoutDetailPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PayoutDetailItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PAYOUT_DETAIL_DEFAULTS: Partial<PmPayoutDetailProps> = {
  preset: 'panel',
};
