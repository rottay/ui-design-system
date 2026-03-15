/**
 * W3TransactionHistory - Core Interface
 * Browse blockchain transaction history with filtering, status, and explorer links
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TransactionHistoryPreset = 'table' | 'timeline';

export type TransactionType = 'transfer' | 'swap' | 'stake' | 'unstake' | 'mint' | 'burn' | 'approve';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'dropped';
export interface TransactionHistoryItem {
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

export interface W3TransactionHistoryProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TransactionHistoryPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TransactionHistoryItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to view on explorer */
  onViewExplorer?: (hash: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TRANSACTION_HISTORY_DEFAULTS: Partial<W3TransactionHistoryProps> = {
  preset: 'table',
};
