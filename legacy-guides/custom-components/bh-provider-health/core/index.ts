/**
 * BhProviderHealth - Core Types
 * Real-time health monitoring cards for AI providers with uptime,
 * latency trends, circuit breaker states, and incident history.
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBProviderHealth fields: status, circuitState, latencyMs, errorRate, lastCheckAt, lastError, etc.
 * DBProviderHealth.status enum: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
 * DBProviderHealth.circuitState enum: 'closed' | 'open' | 'half_open'
 */

import type { EngineAwareProps } from '../../../../types';
import type { DBProviderHealth, DBProvider, DBProviderRequest } from '@rottay/ia-chat';

/* ------------------------------------------------------------------ */
/*  Domain Types                                                       */
/* ------------------------------------------------------------------ */

/** Re-export for consumer convenience */
export type RecruiterProviderRequest = DBProviderRequest;

/** Display-level health status - maps from DBProviderHealth.status */
export type ProviderHealthStatus = 'healthy' | 'degraded' | 'down';
/** Circuit breaker state - maps from DBProviderHealth.circuitState ('closed'|'open'|'half_open') */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface HealthIncident {
  id: string;
  /** DBProviderHealth.providerId */
  providerId: string;
  type: 'outage' | 'degradation' | 'latency_spike' | 'error_rate';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description?: string;
  startedAt: Date;
  resolvedAt?: Date;
  durationMs?: number;
}

/**
 * Provider health item - display-oriented projection joining
 * DBProvider + DBProviderHealth.
 */
export interface ProviderHealthItem {
  /** DBProvider.id */
  id: string;
  /** DBProvider.name */
  name: string;
  /** Mapped from DBProviderHealth.status */
  status: ProviderHealthStatus;
  uptimePercent: number;
  /** DBProviderHealth.latencyMs */
  latencyMs: number;
  latencyTrend: number[];
  /** DBProviderHealth.errorRate */
  errorRate: number;
  requestCount: number;
  /** Mapped from DBProviderHealth.circuitState */
  circuitBreaker: CircuitBreakerState;
  /** DBProviderHealth.lastCheckAt */
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
  /** Recent provider requests - accepts DBProviderRequest[] from @rottay/ia-chat */
  recentRequests?: DBProviderRequest[];
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
