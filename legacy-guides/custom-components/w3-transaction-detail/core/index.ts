/**
 * W3TransactionDetail - Core Interface
 * View transaction details including gas, confirmations, events, and trace data
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TransactionDetailPreset = 'panel' | 'card';

export type TransactionType = 'transfer' | 'swap' | 'stake' | 'unstake' | 'mint' | 'burn' | 'approve';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'dropped';
export interface TransactionDetailItem {
  id: string;
  hash: string;
  type: TransactionType;
  status: TransactionStatus;
  from: string;
  to: string;
  value: string;
  token?: string;
  gasUsed?: string;
  gasCost?: string;
  timestamp: string;
  confirmations: number;
  network: string;
}

export interface W3TransactionDetailProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TransactionDetailPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TransactionDetailItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to view on explorer */
  onViewExplorer?: (hash: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TRANSACTION_DETAIL_DEFAULTS: Partial<W3TransactionDetailProps> = {
  preset: 'panel',
};
