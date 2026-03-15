/**
 * PmProviderConfig - Main Export
 * Configure payment providers with credentials, supported methods, and regions
 */

import type { PmProviderConfigProps } from './core';
import { PM_PROVIDER_CONFIG_DEFAULTS } from './core';
import { PM_PROVIDER_CONFIG_PRESETS } from './presets';

export { type PmProviderConfigProps, type PmProviderConfigPreset, PM_PROVIDER_CONFIG_DEFAULTS } from './core';
export * from './presets';

export function PmProviderConfig(props: PmProviderConfigProps): React.ReactElement {
  const preset = props.preset ?? PM_PROVIDER_CONFIG_DEFAULTS.preset ?? 'table';
  const PresetComponent = PM_PROVIDER_CONFIG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmProviderConfig.displayName = 'PmProviderConfig';
