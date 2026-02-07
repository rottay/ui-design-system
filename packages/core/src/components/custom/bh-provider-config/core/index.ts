/**
 * BhProviderConfig - Core Interface
 * AI Provider Management for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhProviderConfigPreset = 'dashboard' | 'detail';

export type ProviderType = 'chat' | 'tts' | 'stt' | 'conversational';
export type ProviderStatus = 'healthy' | 'degraded' | 'down';
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';
export type TestStatus = 'success' | 'failure' | 'testing';

export interface ProviderItem {
  id: string;
  name: string;
  types: ProviderType[];
  status: ProviderStatus;
  latencyMs: number;
  modelCount: number;
  circuitBreaker: CircuitBreakerState;
  uptimePercent: number;
  latencyTrend: number[];
}

export interface ApiKeyInfo {
  id: string;
  maskedKey: string;
  lastUsed: Date;
  createdAt: Date;
}

export interface ModelInfo {
  id: string;
  name: string;
  type: ProviderType;
  costPer1kTokens: number;
  contextWindow: number;
  features: string[];
  deprecated: boolean;
}

export interface FallbackChain {
  providers: { providerId: string; priority: number }[];
}

export interface TestResult {
  providerId: string;
  status: TestStatus;
  latencyMs?: number;
  error?: string;
}

export interface DragState {
  draggingId: string | null;
  overIndex: number | null;
}

export interface BhProviderConfigProps extends EngineAwareProps {
  preset?: BhProviderConfigPreset;

  /** All AI providers */
  providers?: ProviderItem[];

  /** Currently selected provider ID */
  selectedProvider?: string | null;

  /** Callback when a provider is selected */
  onProviderSelect?: (providerId: string) => void;

  /** API keys for the selected provider */
  apiKeys?: ApiKeyInfo[];

  /** Models for the selected provider */
  models?: ModelInfo[];

  /** Fallback chain configuration */
  fallbackChain?: FallbackChain;

  /** Callback when fallback chain is reordered */
  onFallbackReorder?: (chain: FallbackChain) => void;

  /** Test results for providers */
  testResults?: TestResult[];

  /** Callback to test a provider */
  onTestProvider?: (providerId: string) => void;

  /** Callback to rotate an API key */
  onRotateKey?: (keyId: string) => void;

  /** Callback to revoke an API key */
  onRevokeKey?: (keyId: string) => void;

  /** Whether the add key modal is open */
  showKeyModal?: boolean;

  /** Toggle add key modal */
  onKeyModalToggle?: (open: boolean) => void;

  /** Model type filter */
  modelFilter?: ProviderType | 'all';

  /** Callback when model filter changes */
  onModelFilterChange?: (filter: ProviderType | 'all') => void;

  /** Cost comparison view mode */
  costView?: 'chart' | 'table';

  /** Callback when cost view changes */
  onCostViewChange?: (view: 'chart' | 'table') => void;

  /** Current drag state for fallback reorder */
  dragState?: DragState;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PROVIDER_CONFIG_DEFAULTS: Partial<BhProviderConfigProps> = {
  preset: 'dashboard',
  modelFilter: 'all',
  costView: 'chart',
};
