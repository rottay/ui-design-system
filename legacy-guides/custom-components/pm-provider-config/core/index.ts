/**
 * PmProviderConfig - Core Interface
 * Configure payment providers with credentials, supported methods, and regions
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmProviderConfigPreset = 'table' | 'cards';

export type ProviderStatus = 'active' | 'degraded' | 'down' | 'maintenance';
export interface ProviderConfigItem {
  id: string;
  name: string;
  status: ProviderStatus;
  uptime: number;
  latency: number;
  successRate: number;
  volume: string;
  lastChecked: string;
}

export interface PmProviderConfigProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmProviderConfigPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: ProviderConfigItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to configure */
  onConfigure?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PROVIDER_CONFIG_DEFAULTS: Partial<PmProviderConfigProps> = {
  preset: 'table',
};
