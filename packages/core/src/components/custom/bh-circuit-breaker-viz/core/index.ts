/**
 * BhCircuitBreakerViz - Core Interface
 * Network diagram of providers colored by circuit state
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBProviderHealth.circuitState enum: 'closed' | 'open' | 'half_open'
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBProviderHealth } from '@rottay/ia-chat';

export type BhCircuitBreakerVizPreset = 'diagram' | 'compact';

/**
 * Circuit node - display-oriented projection of DBProviderHealth circuit state.
 * DBProviderHealth.circuitState: 'closed' | 'open' | 'half_open'
 * Note: display uses 'half-open' (hyphen) vs DB 'half_open' (underscore).
 */
export interface CircuitNode {
  /** DBProvider.id */
  id: string;
  /** DBProvider.name */
  name: string;
  type: 'provider' | 'model' | 'endpoint';
  /** Mapped from DBProviderHealth.circuitState */
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  successCount: number;
  /** DBProviderHealth.updatedAt */
  lastStateChange: Date;
}

export interface CircuitConnection {
  from: string;
  to: string;
  requestsPerMin: number;
}

export interface BhCircuitBreakerVizProps extends EngineAwareProps {
  preset?: BhCircuitBreakerVizPreset;
  nodes?: CircuitNode[];
  connections?: CircuitConnection[];
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CIRCUIT_BREAKER_VIZ_DEFAULTS: Partial<BhCircuitBreakerVizProps> = {
  preset: 'diagram',
};
