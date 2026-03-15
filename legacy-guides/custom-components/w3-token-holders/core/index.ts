/**
 * W3TokenHolders - Core Interface
 * View token holder distribution with top holders, concentration, and trends
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TokenHoldersPreset = 'table' | 'chart';

export interface TokenHoldersItem {
  id: string;
  name: string;
  symbol: string;
  supply: string;
  holders: number;
  price: string;
  change24h: number;
  network: string;
}

export interface W3TokenHoldersProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TokenHoldersPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TokenHoldersItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to deploy */
  onDeploy?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TOKEN_HOLDERS_DEFAULTS: Partial<W3TokenHoldersProps> = {
  preset: 'table',
};
