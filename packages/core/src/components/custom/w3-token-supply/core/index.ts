/**
 * W3TokenSupply - Core Interface
 * Track token supply metrics with circulating, total, and max supply visualization
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TokenSupplyPreset = 'overview' | 'chart';

export interface TokenSupplyItem {
  id: string;
  name: string;
  symbol: string;
  supply: string;
  holders: number;
  price: string;
  change24h: number;
  network: string;
}

export interface W3TokenSupplyProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TokenSupplyPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TokenSupplyItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to deploy */
  onDeploy?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TOKEN_SUPPLY_DEFAULTS: Partial<W3TokenSupplyProps> = {
  preset: 'overview',
};
