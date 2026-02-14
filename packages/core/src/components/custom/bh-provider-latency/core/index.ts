/**
 * BhProviderLatency - Core Interface
 * Multi-line p50/p95/p99 latency chart per provider
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBUsage fields: p50Latency, p95Latency, p99Latency, avgLatency, etc.
 * DBProviderHealth fields: latencyMs (current snapshot).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBUsage, DBProviderHealth } from '@rottay/ia-chat';

export type BhProviderLatencyPreset = 'chart' | 'compact';

/**
 * Latency data point - derived from DBUsage percentile fields per period.
 */
export interface LatencyDataPoint {
  timestamp: string;
  /** DBProvider.code or DBProvider.name */
  provider: string;
  /** DBUsage.p50Latency */
  p50: number;
  /** DBUsage.p95Latency */
  p95: number;
  /** DBUsage.p99Latency */
  p99: number;
}

export interface BhProviderLatencyProps extends EngineAwareProps {
  preset?: BhProviderLatencyPreset;
  data?: LatencyDataPoint[];
  providers?: string[];
  selectedProvider?: string | null;
  targetLatency?: number;
  onProviderChange?: (provider: string) => void;
  onDataPointClick?: (point: LatencyDataPoint) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_PROVIDER_LATENCY_DEFAULTS: Partial<BhProviderLatencyProps> = {
  preset: 'chart',
  targetLatency: 500,
};
