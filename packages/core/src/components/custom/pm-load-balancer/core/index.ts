/**
 * PmLoadBalancer - Core Interface
 * Configure payment provider load balancing with weights, failover, and traffic split
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmLoadBalancerPreset = 'panel' | 'visual';

export type ProviderStatus = 'active' | 'degraded' | 'down' | 'maintenance';
export interface LoadBalancerItem {
  id: string;
  name: string;
  status: ProviderStatus;
  uptime: number;
  latency: number;
  successRate: number;
  volume: string;
  lastChecked: string;
}

export interface PmLoadBalancerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmLoadBalancerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: LoadBalancerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to configure */
  onConfigure?: (id: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_LOAD_BALANCER_DEFAULTS: Partial<PmLoadBalancerProps> = {
  preset: 'panel',
};
