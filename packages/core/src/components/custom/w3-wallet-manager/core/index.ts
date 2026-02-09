/**
 * W3WalletManager - Core Interface
 * Manage connected wallets with balance summaries, networks, and transaction access
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3WalletManagerPreset = 'cards' | 'table';

export interface WalletManagerItem {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  status: 'connected' | 'disconnected' | 'pending';
}

export interface W3WalletManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3WalletManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: WalletManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to connect */
  onConnect?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_WALLET_MANAGER_DEFAULTS: Partial<W3WalletManagerProps> = {
  preset: 'cards',
};
