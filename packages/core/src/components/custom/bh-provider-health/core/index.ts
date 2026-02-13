/**
 * BhProviderHealth - Core Types
 * Real-time health monitoring cards for AI providers with uptime,
 * latency trends, circuit breaker states, and incident history.
 */

import type { EngineAwareProps } from '../../../../types';

/* ------------------------------------------------------------------ */
/*  Domain Types                                                       */
/* ------------------------------------------------------------------ */

export type ProviderHealthStatus = 'healthy' | 'degraded' | 'down';
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface HealthIncident {
  id: string;
  providerId: string;
  type: 'outage' | 'degradation' | 'latency_spike' | 'error_rate';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description?: string;
  startedAt: Date;
  resolvedAt?: Date;
  durationMs?: number;
}

export interface ProviderHealthItem {
  id: string;
  name: string;
  status: ProviderHealthStatus;
  uptimePercent: number;
  latencyMs: number;
  latencyTrend: number[];
  errorRate: number;
  requestCount: number;
  circuitBreaker: CircuitBreakerState;
  lastChecked: Date;
  incidents: HealthIncident[];
  region?: string;
}

export interface HealthSummary {
  totalProviders: number;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  avgLatency: number;
  avgUptime: number;
  openIncidents: number;
}

/* ------------------------------------------------------------------ */
/*  Preset Type                                                        */
/* ------------------------------------------------------------------ */

export type BhProviderHealthPreset = 'dashboard' | 'compact';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface BhProviderHealthProps extends EngineAwareProps {
  preset?: BhProviderHealthPreset;
  providers?: ProviderHealthItem[];
  summary?: HealthSummary;
  selectedProvider?: string | null;
  onProviderSelect?: (providerId: string) => void;
  refreshInterval?: number;
  onRefresh?: () => void;
  showIncidents?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

export const BH_PROVIDER_HEALTH_DEFAULTS: Partial<BhProviderHealthProps> = {
  preset: 'dashboard',
  showIncidents: true,
};
