/**
 * W3TokenDeploy - Core Interface
 * Deploy new tokens with configurable supply, decimals, and feature settings
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3TokenDeployPreset = 'wizard' | 'form';

export interface TokenDeployItem {
  id: string;
  name: string;
  symbol: string;
  supply: string;
  holders: number;
  price: string;
  change24h: number;
  network: string;
}

export interface W3TokenDeployProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3TokenDeployPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: TokenDeployItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to deploy */
  onDeploy?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_TOKEN_DEPLOY_DEFAULTS: Partial<W3TokenDeployProps> = {
  preset: 'wizard',
};
