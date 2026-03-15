/**
 * PlAuthMethodManager - Core Interface
 * Manage authentication methods including passwords, SSO, social logins, passkeys, magic links, and MFA
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlAuthMethodManagerPreset = 'list' | 'grid';

export type AuthMethodType = 'password' | 'sso' | 'oauth' | 'passkey' | 'magic-link' | 'mfa';
export type AuthMethodStatus = 'active' | 'inactive' | 'configuring';
export type SsoProtocol = 'SAML' | 'OIDC' | 'OAuth2';
export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AuthMethodConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  issuer?: string;
  domain?: string;
  tenantId?: string;
  allowedDomains?: string[];
  scopes?: string[];
}

export interface AuthMethod {
  id: string;
  type: AuthMethodType;
  name: string;
  status: AuthMethodStatus;
  provider?: string;
  protocol?: SsoProtocol;
  icon?: string;
  usersCount: number;
  lastUsed?: Date;
  isDefault: boolean;
  config?: AuthMethodConfig;
  securityLevel: SecurityLevel;
  loginCount30d?: number;
  avgLoginTime?: string;
  failureRate?: number;
  description?: string;
  canDelete: boolean;
  canDisable: boolean;
}

export interface AuthMethodGroup {
  label: string;
  methods: AuthMethod[];
}

export interface PlAuthMethodManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlAuthMethodManagerPreset;

  /** Auth methods to display */
  methods: AuthMethod[];

  /** Callback when method is toggled */
  onToggle?: (methodId: string, enabled: boolean) => void;

  /** Callback when method is configured */
  onConfigure?: (methodId: string) => void;

  /** Callback when method is deleted */
  onDelete?: (methodId: string) => void;

  /** Callback when add method is clicked */
  onAddMethod?: () => void;

  /** Callback when method is clicked */
  onMethodClick?: (methodId: string) => void;

  /** Callback when default method is changed */
  onSetDefault?: (methodId: string) => void;

  /** Search query */
  searchQuery?: string;

  /** Callback when search changes */
  onSearchChange?: (query: string) => void;

  /** Filter by type */
  filterType?: AuthMethodType | null;

  /** Callback when filter changes */
  onFilterChange?: (type: AuthMethodType | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Empty state text */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_AUTH_METHOD_MANAGER_DEFAULTS: Partial<PlAuthMethodManagerProps> = {
  preset: 'list',
  emptyText: 'No authentication methods found',
};
