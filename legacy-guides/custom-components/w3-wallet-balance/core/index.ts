/**
 * W3WalletBalance - Core Interface
 * Display wallet balances across tokens with portfolio allocation and value changes
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3WalletBalancePreset = 'portfolio' | 'list';

export interface WalletBalanceItem {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  status: 'connected' | 'disconnected' | 'pending';
}

export interface W3WalletBalanceProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3WalletBalancePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: WalletBalanceItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to connect */
  onConnect?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_WALLET_BALANCE_DEFAULTS: Partial<W3WalletBalanceProps> = {
  preset: 'portfolio',
};
