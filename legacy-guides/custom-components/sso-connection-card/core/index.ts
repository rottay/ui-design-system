import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SsoConnectionCardPreset = 'standard' | 'compact' | 'detail';

export type SsoProtocol = 'saml' | 'oidc' | 'oauth2' | 'ldap';

export type SsoConnectionStatus = 'active' | 'inactive' | 'error' | 'configuring';

export interface SsoConnection {
  id: string;
  name: string;
  protocol: SsoProtocol;
  provider: string;
  status: SsoConnectionStatus;
  domain?: string;
  metadataUrl?: string;
  clientId?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  totalLogins?: number;
  jitProvisioning?: boolean;
  defaultRole?: string;
  certificateExpiry?: Date;
  logo?: string;
}

export interface SsoConnectionCardProps extends EngineAwareProps {
  preset?: SsoConnectionCardPreset;
  connections: SsoConnection[];
  onConnectionClick?: (connectionId: string) => void;
  onToggle?: (connectionId: string, active: boolean) => void;
  onDelete?: (connectionId: string) => void;
  onCreate?: () => void;
  onTest?: (connectionId: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SSO_CONNECTION_CARD_DEFAULTS: Partial<SsoConnectionCardProps> = {
  preset: 'standard',
  title: 'SSO Connections',
};

export function getSsoStatusColors(tokens: DesignTokens) {
  return {
    active: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    inactive: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], dot: tokens.colors.neutral[400] },
    error: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    configuring: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
  };
}

export function getProtocolLabel(protocol: SsoProtocol): string {
  return { saml: 'SAML 2.0', oidc: 'OpenID Connect', oauth2: 'OAuth 2.0', ldap: 'LDAP' }[protocol];
}

export function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = { 'okta': '🔐', 'azure-ad': '☁', 'google': '🔍', 'auth0': '🛡', 'onelogin': '1️⃣', 'ping': '🏓' };
  return icons[provider.toLowerCase()] || '🔑';
}
