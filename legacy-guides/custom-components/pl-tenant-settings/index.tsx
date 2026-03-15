/**
 * PlTenantSettings - Main Export
 * Comprehensive tenant configuration panel with branding, security, integrations, and billing
 */

import type { PlTenantSettingsProps } from './core';
import { PL_TENANT_SETTINGS_DEFAULTS } from './core';
import { PL_TENANT_SETTINGS_PRESETS } from './presets';

export {
  type PlTenantSettingsProps,
  type PlTenantSettingsPreset,
  type SettingsTab,
  type BrandingConfig,
  type SecurityConfig,
  type TenantSettingsData,
  PL_TENANT_SETTINGS_DEFAULTS,
  TIMEZONE_OPTIONS,
  LANGUAGE_OPTIONS,
  SESSION_TIMEOUT_OPTIONS,
  COLOR_SWATCHES,
} from './core';
export * from './presets';

export function PlTenantSettings(props: PlTenantSettingsProps): React.ReactElement {
  const preset = props.preset ?? PL_TENANT_SETTINGS_DEFAULTS.preset ?? 'form';
  const PresetComponent = PL_TENANT_SETTINGS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlTenantSettings.displayName = 'PlTenantSettings';
