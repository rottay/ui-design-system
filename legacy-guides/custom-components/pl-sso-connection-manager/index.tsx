/**
 * PlSsoConnectionManager - Main Export
 * Configure and manage SSO provider connections with SAML, OIDC, OAuth2, and LDAP support
 */

import type { PlSsoConnectionManagerProps } from './core';
import { PL_SSO_CONNECTION_MANAGER_DEFAULTS } from './core';
import { PL_SSO_CONNECTION_MANAGER_PRESETS } from './presets';

export {
  type PlSsoConnectionManagerProps,
  type PlSsoConnectionManagerPreset,
  type SsoProtocol,
  type ConnectionStatus,
  type SsoProvider,
  type SsoConnection,
  type SsoConnectionStats,
  type SsoCertificateInfo,
  type SyncStatus,
  type UserRole,
  PL_SSO_CONNECTION_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function PlSsoConnectionManager(props: PlSsoConnectionManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_SSO_CONNECTION_MANAGER_DEFAULTS.preset ?? 'list';
  const PresetComponent = PL_SSO_CONNECTION_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlSsoConnectionManager.displayName = 'PlSsoConnectionManager';
