/**
 * PlApiKeyManager - Core Interface
 * Generate, revoke, and manage API keys with scopes, rate limits, and expiration
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset Type ──────────────────────────────────────────────────────────

export type PlApiKeyManagerPreset = 'table' | 'cards';

// ─── Domain Types ─────────────────────────────────────────────────────────

export type ApiKeyStatus = 'active' | 'expired' | 'revoked';

export type ApiKeyScope = 'read' | 'write' | 'admin' | 'full';

export type ApiKeyEnvironment = 'production' | 'staging' | 'development';

export interface ApiKey {
  /** Unique identifier */
  id: string;
  /** Human-readable name for the key */
  name: string;
  /** Full API key value (hidden in UI, used for copy) */
  key: string;
  /** Visible prefix of the key (e.g. "sk_live_") */
  prefix: string;
  /** Current status of the key */
  status: ApiKeyStatus;
  /** Permission scopes granted to this key */
  scopes: ApiKeyScope[];
  /** User or service that created the key */
  createdBy: string;
  /** When the key was created */
  createdAt: Date;
  /** Last time the key was used for an API call */
  lastUsed?: Date;
  /** When the key expires (undefined = never) */
  expiresAt?: Date;
  /** Maximum requests per hour */
  rateLimit: number;
  /** Number of requests made today */
  requestsToday: number;
  /** Number of requests made this month */
  requestsMonth: number;
  /** Target environment for the key */
  environment: ApiKeyEnvironment;
  /** IP addresses allowed to use this key */
  ipWhitelist?: string[];
  /** Optional description of the key's purpose */
  description?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────

export interface PlApiKeyManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlApiKeyManagerPreset;

  /** API keys to display */
  apiKeys: ApiKey[];

  /** Callback when an API key row/card is clicked */
  onKeyClick?: (keyId: string) => void;

  /** Callback to create a new API key */
  onCreate?: () => void;

  /** Callback to revoke an API key */
  onRevoke?: (keyId: string) => void;

  /** Callback to regenerate an API key */
  onRegenerate?: (keyId: string) => void;

  /** Callback when the copy button is clicked for a key */
  onCopyKey?: (keyId: string, keyValue: string) => void;

  /** Search query (controlled) */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ─────────────────────────────────────────────────────────────

export const PL_API_KEY_MANAGER_DEFAULTS: Partial<PlApiKeyManagerProps> = {
  preset: 'table',
  emptyText: 'No API keys found',
};
