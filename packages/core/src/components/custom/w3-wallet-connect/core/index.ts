/**
 * W3WalletConnect - Core Interface
 * Connect external wallets via WalletConnect, MetaMask, or other providers
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3WalletConnectPreset = 'wizard' | 'modal';

export interface WalletConnectItem {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  status: 'connected' | 'disconnected' | 'pending';
}

export interface W3WalletConnectProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3WalletConnectPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: WalletConnectItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to connect */
  onConnect?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_WALLET_CONNECT_DEFAULTS: Partial<W3WalletConnectProps> = {
  preset: 'wizard',
};
