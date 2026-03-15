/**
 * W3TokenOperations - Core Interface
 * Execute token operations including mint, burn, transfer, and approve
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TokenOperationsPreset = 'panel' | 'form';

export interface TokenOperationsItem {
  id: string;
  name: string;
  symbol: string;
  supply: string;
  holders: number;
  price: string;
  change24h: number;
  network: string;
}

export interface W3TokenOperationsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TokenOperationsPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TokenOperationsItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to deploy */
  onDeploy?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TOKEN_OPERATIONS_DEFAULTS: Partial<W3TokenOperationsProps> = {
  preset: 'panel',
};
