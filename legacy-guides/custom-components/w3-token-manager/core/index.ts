/**
 * W3TokenManager - Core Interface
 * Manage ERC-20 and custom tokens with supply info, holders, and operations
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TokenManagerPreset = 'table' | 'cards';

export interface TokenManagerItem {
  id: string;
  name: string;
  symbol: string;
  supply: string;
  holders: number;
  price: string;
  change24h: number;
  network: string;
}

export interface W3TokenManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TokenManagerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TokenManagerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to deploy */
  onDeploy?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TOKEN_MANAGER_DEFAULTS: Partial<W3TokenManagerProps> = {
  preset: 'table',
};
