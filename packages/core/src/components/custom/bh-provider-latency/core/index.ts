/**
 * BhProviderLatency - Core Interface
 * Multi-line p50/p95/p99 latency chart per provider
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhProviderLatencyPreset = 'chart' | 'compact';

export interface LatencyDataPoint {
  timestamp: string;
  provider: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface BhProviderLatencyProps extends EngineAwareProps {
  preset?: BhProviderLatencyPreset;
  data: LatencyDataPoint[];
  providers: string[];
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
