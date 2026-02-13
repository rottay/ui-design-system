/**
 * BhProviderHealth - Main Export
 * Real-time health monitoring for AI providers.
 */

import type { BhProviderHealthProps } from './core';
import { BH_PROVIDER_HEALTH_DEFAULTS } from './core';
import { BH_PROVIDER_HEALTH_PRESETS } from './presets';

export {
  type BhProviderHealthProps,
  type BhProviderHealthPreset,
  type ProviderHealthItem,
  type ProviderHealthStatus,
  type CircuitBreakerState,
  type HealthIncident,
  type HealthSummary,
  BH_PROVIDER_HEALTH_DEFAULTS,
} from './core';
export * from './presets';

export function BhProviderHealth(props: BhProviderHealthProps): React.ReactElement {
  const preset = props.preset ?? BH_PROVIDER_HEALTH_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_PROVIDER_HEALTH_PRESETS[preset] ?? BH_PROVIDER_HEALTH_PRESETS.dashboard;

  return <PresetComponent {...props} />;
}

BhProviderHealth.displayName = 'BhProviderHealth';
