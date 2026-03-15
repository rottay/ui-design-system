/**
 * W3WalletDetail - Core Interface
 * Detailed wallet view with balance breakdown, recent activity, and token holdings
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3WalletDetailPreset = 'overview' | 'activity';

export interface WalletDetailItem {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  status: 'connected' | 'disconnected' | 'pending';
}

export interface W3WalletDetailProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3WalletDetailPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: WalletDetailItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to connect */
  onConnect?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_WALLET_DETAIL_DEFAULTS: Partial<W3WalletDetailProps> = {
  preset: 'overview',
};
