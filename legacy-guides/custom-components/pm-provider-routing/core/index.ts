/**
 * PmProviderRouting - Core Interface
 * Configure payment routing rules based on currency, amount, region, and provider
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmProviderRoutingPreset = 'editor' | 'table';

export type ProviderStatus = 'active' | 'degraded' | 'down' | 'maintenance';
export interface ProviderRoutingItem {
  id: string;
  name: string;
  status: ProviderStatus;
  uptime: number;
  latency: number;
  successRate: number;
  volume: string;
  lastChecked: string;
}

export interface PmProviderRoutingProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmProviderRoutingPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: ProviderRoutingItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to configure */
  onConfigure?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PROVIDER_ROUTING_DEFAULTS: Partial<PmProviderRoutingProps> = {
  preset: 'editor',
};
