/**
 * W3GasEstimator - Core Interface
 * Estimate gas costs for transactions with speed options and historical pricing
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3GasEstimatorPreset = 'panel' | 'inline';

export type TransactionType = 'transfer' | 'swap' | 'stake' | 'unstake' | 'mint' | 'burn' | 'approve';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'dropped';
export interface GasEstimatorItem {
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

export interface W3GasEstimatorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3GasEstimatorPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: GasEstimatorItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to view on explorer */
  onViewExplorer?: (hash: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_GAS_ESTIMATOR_DEFAULTS: Partial<W3GasEstimatorProps> = {
  preset: 'panel',
};
