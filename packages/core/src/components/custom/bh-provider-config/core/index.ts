/**
 * BhProviderConfig - Core Interface
 * AI Provider Management for BitHire ATS platform
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBProvider fields: id, tenantId, code, name, displayName, type, types, status, baseUrl, features, etc.
 * DBProvider.type enum: 'voice_tts' | 'voice_stt' | 'chat' | 'conversational' | 'communication' | ...
 * DBProvider.status enum: 'active' | 'inactive' | 'maintenance' | 'deprecated'
 * DBProviderConfig fields: providerId, status, priority, settings, rateLimits, costLimits, etc.
 * DBProviderHealth fields: status, circuitState, latencyMs, errorRate, lastCheckAt, etc.
 * DBProviderHealth.status enum: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
 * DBProviderHealth.circuitState enum: 'closed' | 'open' | 'half_open'
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBProvider, DBProviderConfig, DBProviderHealth, DBApiKey, DBProviderWebhook } from '@rottay/ia-chat';

export type BhProviderConfigPreset = 'dashboard' | 'detail';

/** Display-level provider type (simplified from DBProvider.type) */
export type ProviderType = 'chat' | 'tts' | 'stt' | 'conversational';
/** Display-level health status (maps from DBProviderHealth.status) */
export type ProviderStatus = 'healthy' | 'degraded' | 'down';
/** Circuit breaker state - maps from DBProviderHealth.circuitState ('closed'|'open'|'half_open') */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';
export type TestStatus = 'success' | 'failure' | 'testing';

/**
 * Provider item for the config dashboard - display-oriented projection
 * joining DBProvider + DBProviderHealth.
 */
export interface ProviderItem {
  /** DBProvider.id */
  id: string;
  /** DBProvider.name or DBProvider.displayName */
  name: string;
  /** Simplified from DBProvider.types */
  types: ProviderType[];
  /** Mapped from DBProviderHealth.status */
  status: ProviderStatus;
  /** DBProviderHealth.latencyMs */
  latencyMs: number;
  modelCount: number;
  /** Mapped from DBProviderHealth.circuitState */
  circuitBreaker: CircuitBreakerState;
  uptimePercent: number;
  latencyTrend: number[];
}

/**
 * Re-export DB types for consumer convenience.
 */
export type RecruiterApiKey = DBApiKey;
export type RecruiterProviderWebhook = DBProviderWebhook;

/**
 * API key display info - derived from DBApiKey fields.
 * DBApiKey fields: id, keyName, keyPrefix, keyHint, status, scope, usageCount, lastUsedAt, expiresAt, etc.
 */
export interface ApiKeyInfo {
  /** DBApiKey.id */
  id: string;
  /** DBApiKey.keyPrefix or keyHint */
  maskedKey: string;
  /** DBApiKey.lastUsedAt */
  lastUsed: Date;
  /** DBApiKey.createdAt */
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

/**
 * Fallback chain - maps to DBProviderConfig.priority ('primary'|'fallback'|'backup')
 */
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

  /** Webhook configurations for the selected provider - accepts DBProviderWebhook[] from @rottay/ia-chat */
  webhooks?: DBProviderWebhook[];

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
