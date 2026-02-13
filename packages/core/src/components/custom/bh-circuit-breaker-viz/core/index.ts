/**
 * BhCircuitBreakerViz - Core Interface
 * Network diagram of providers colored by circuit state
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhCircuitBreakerVizPreset = 'diagram' | 'compact';

export interface CircuitNode {
  id: string;
  name: string;
  type: 'provider' | 'model' | 'endpoint';
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  successCount: number;
  lastStateChange: Date;
}

export interface CircuitConnection {
  from: string;
  to: string;
  requestsPerMin: number;
}

export interface BhCircuitBreakerVizProps extends EngineAwareProps {
  preset?: BhCircuitBreakerVizPreset;
  nodes: CircuitNode[];
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
