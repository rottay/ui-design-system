/**
 * W3SessionKeyManager - Core Interface
 * Manage session keys for gasless transactions with permissions and expiration
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3SessionKeyManagerPreset = 'table' | 'cards';

export interface SessionKeyManagerItem {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  status: 'connected' | 'disconnected' | 'pending';
}

export interface W3SessionKeyManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3SessionKeyManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: SessionKeyManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to connect */
  onConnect?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_SESSION_KEY_MANAGER_DEFAULTS: Partial<W3SessionKeyManagerProps> = {
  preset: 'table',
};
