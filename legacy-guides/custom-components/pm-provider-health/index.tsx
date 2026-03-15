/**
 * PmProviderHealth - Main Export
 * Monitor payment provider health with uptime, latency, and error rate dashboards
 */

import type { PmProviderHealthProps } from './core';
import { PM_PROVIDER_HEALTH_DEFAULTS } from './core';
import { PM_PROVIDER_HEALTH_PRESETS } from './presets';

export { type PmProviderHealthProps, type PmProviderHealthPreset, PM_PROVIDER_HEALTH_DEFAULTS } from './core';
export * from './presets';

export function PmProviderHealth(props: PmProviderHealthProps): React.ReactElement {
  const preset = props.preset ?? PM_PROVIDER_HEALTH_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = PM_PROVIDER_HEALTH_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmProviderHealth.displayName = 'PmProviderHealth';
