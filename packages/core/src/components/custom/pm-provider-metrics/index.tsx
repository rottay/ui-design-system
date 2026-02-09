/**
 * PmProviderMetrics - Main Export
 * Compare provider performance metrics including latency, costs, and success rates
 */

import type { PmProviderMetricsProps } from './core';
import { PM_PROVIDER_METRICS_DEFAULTS } from './core';
import { PM_PROVIDER_METRICS_PRESETS } from './presets';

export { type PmProviderMetricsProps, type PmProviderMetricsPreset, PM_PROVIDER_METRICS_DEFAULTS } from './core';
export * from './presets';

export function PmProviderMetrics(props: PmProviderMetricsProps): React.ReactElement {
  const preset = props.preset ?? PM_PROVIDER_METRICS_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = PM_PROVIDER_METRICS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PmProviderMetrics.displayName = 'PmProviderMetrics';
