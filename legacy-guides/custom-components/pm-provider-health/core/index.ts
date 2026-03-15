/**
 * PmProviderHealth - Core Interface
 * Monitor payment provider health with uptime, latency, and error rate dashboards
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmProviderHealthPreset = 'dashboard' | 'compact';

export type ProviderStatus = 'active' | 'degraded' | 'down' | 'maintenance';
export interface ProviderHealthItem {
  id: string;
  name: string;
  status: ProviderStatus;
  uptime: number;
  latency: number;
  successRate: number;
  volume: string;
  lastChecked: string;
}

export interface PmProviderHealthProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmProviderHealthPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: ProviderHealthItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to configure */
  onConfigure?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_PROVIDER_HEALTH_DEFAULTS: Partial<PmProviderHealthProps> = {
  preset: 'dashboard',
};
