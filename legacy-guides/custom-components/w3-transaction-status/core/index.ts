/**
 * W3TransactionStatus - Core Interface
 * Track pending transaction status with confirmation progress and ETA
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TransactionStatusPreset = 'tracker' | 'compact';

export type TransactionType = 'transfer' | 'swap' | 'stake' | 'unstake' | 'mint' | 'burn' | 'approve';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'dropped';
export interface TransactionStatusItem {
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

export interface W3TransactionStatusProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TransactionStatusPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TransactionStatusItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to view on explorer */
  onViewExplorer?: (hash: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TRANSACTION_STATUS_DEFAULTS: Partial<W3TransactionStatusProps> = {
  preset: 'tracker',
};
