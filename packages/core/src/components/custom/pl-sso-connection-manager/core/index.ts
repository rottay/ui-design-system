/**
 * PlSsoConnectionManager - Core Interface
 * Configure and manage SSO provider connections with SAML, OIDC, OAuth2, and LDAP support
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset ──────────────────────────────────────────────────────────────────

export type PlSsoConnectionManagerPreset = 'list' | 'setup';

// ─── Domain Types ────────────────────────────────────────────────────────────

export type SsoProtocol = 'SAML' | 'OIDC' | 'OAuth2' | 'LDAP';

export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'configuring';

export type SsoProvider =
  | 'google'
  | 'microsoft'
  | 'okta'
  | 'auth0'
  | 'onelogin'
  | 'ping'
  | 'jumpcloud'
  | 'custom';

export type SyncStatus = 'success' | 'pending' | 'failed';

export type UserRole = 'viewer' | 'member' | 'admin' | 'owner';

// ─── Certificate Info ────────────────────────────────────────────────────────

export interface SsoCertificateInfo {
  issuer: string;
  expiry: Date;
  isExpired: boolean;
  fingerprint?: string;
}

// ─── SSO Connection ──────────────────────────────────────────────────────────

export interface SsoConnection {
  /** Unique identifier */
  id: string;
  /** Display name for the connection */
  name: string;
  /** SSO protocol used */
  protocol: SsoProtocol;
  /** Current connection status */
  status: ConnectionStatus;
  /** Domain associated with this connection */
  domain: string;
  /** Identity provider */
  provider: SsoProvider;
  /** Provider icon URL or identifier */
  icon?: string;
  /** Number of users provisioned through this connection */
  usersCount: number;
  /** Last successful sync timestamp */
  lastSync?: Date;
  /** Sync status of the last attempt */
  syncStatus?: SyncStatus;
  /** Certificate information for SAML connections */
  certExpiresAt?: Date;
  /** Certificate details */
  certificate?: SsoCertificateInfo;
  /** Whether auto-provisioning is enabled */
  autoProvision: boolean;
  /** Default role assigned to provisioned users */
  defaultRole: UserRole;
  /** Connection creation timestamp */
  createdAt: Date;
  /** Entity ID for SAML */
  entityId?: string;
  /** Metadata URL */
  metadataUrl?: string;
  /** ACS URL for SAML */
  acsUrl?: string;
  /** Error message if status is error */
  errorMessage?: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface SsoConnectionStats {
  /** Total number of connections */
  total: number;
  /** Number of active connections */
  active: number;
  /** Number of connections with errors */
  errors: number;
  /** Total users across all connections */
  totalUsers: number;
  /** Number of certificates expiring soon */
  certificatesExpiring?: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface PlSsoConnectionManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlSsoConnectionManagerPreset;

  /** SSO connections to display */
  connections: SsoConnection[];

  /** Aggregated stats for the ribbon */
  stats?: SsoConnectionStats;

  /** Callback when a connection is clicked */
  onConnectionClick?: (connectionId: string) => void;

  /** Callback when add connection is clicked */
  onAddConnection?: () => void;

  /** Callback when test connection is clicked */
  onTestConnection?: (connectionId: string) => void;

  /** Callback when configure/edit connection is clicked */
  onEditConnection?: (connectionId: string) => void;

  /** Callback when sync is triggered */
  onSyncConnection?: (connectionId: string) => void;

  /** Callback when toggle enable/disable is triggered */
  onToggleConnection?: (connectionId: string, enabled: boolean) => void;

  /** Callback when delete is clicked */
  onDeleteConnection?: (connectionId: string) => void;

  /** Controlled search query */
  searchQuery?: string;

  /** Callback when search changes */
  onSearchChange?: (query: string) => void;

  /** Filter by protocol */
  filterProtocol?: SsoProtocol | null;

  /** Callback when protocol filter changes */
  onFilterChange?: (protocol: SsoProtocol | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Text shown when no connections found */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const PL_SSO_CONNECTION_MANAGER_DEFAULTS: Partial<PlSsoConnectionManagerProps> = {
  preset: 'list',
  emptyText: 'No SSO connections configured',
};
