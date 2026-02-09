/**
 * PlCompanySettings - Main Export
 * Configure company-specific settings, preferences, and integrations
 */

import type { PlCompanySettingsProps } from './core';
import { PL_COMPANY_SETTINGS_DEFAULTS } from './core';
import { PL_COMPANY_SETTINGS_PRESETS } from './presets';

export { type PlCompanySettingsProps, type PlCompanySettingsPreset, PL_COMPANY_SETTINGS_DEFAULTS } from './core';
export * from './presets';

export function PlCompanySettings(props: PlCompanySettingsProps): React.ReactElement {
  const preset = props.preset ?? PL_COMPANY_SETTINGS_DEFAULTS.preset ?? 'form';
  const PresetComponent = PL_COMPANY_SETTINGS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlCompanySettings.displayName = 'PlCompanySettings';
