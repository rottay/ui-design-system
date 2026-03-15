/**
 * W3MultiChainBalance - Core Interface
 * View aggregated balances across multiple blockchain networks and protocols
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3MultiChainBalancePreset = 'dashboard' | 'grid';

export interface MultiChainBalanceItem {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  status: 'connected' | 'disconnected' | 'pending';
}

export interface W3MultiChainBalanceProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3MultiChainBalancePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: MultiChainBalanceItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to connect */
  onConnect?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_MULTI_CHAIN_BALANCE_DEFAULTS: Partial<W3MultiChainBalanceProps> = {
  preset: 'dashboard',
};
