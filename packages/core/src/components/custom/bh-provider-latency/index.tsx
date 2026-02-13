/**
 * BhProviderLatency - Main Export
 * Multi-line p50/p95/p99 latency chart per provider
 */

import type { BhProviderLatencyProps } from './core';
import { BH_PROVIDER_LATENCY_DEFAULTS } from './core';
import { BH_PROVIDER_LATENCY_PRESETS } from './presets';

export {
  type BhProviderLatencyProps,
  type BhProviderLatencyPreset,
  type LatencyDataPoint,
  BH_PROVIDER_LATENCY_DEFAULTS,
} from './core';
export * from './presets';

export function BhProviderLatency(props: BhProviderLatencyProps): React.ReactElement {
  const preset = props.preset ?? BH_PROVIDER_LATENCY_DEFAULTS.preset ?? 'chart';
  const PresetComponent = BH_PROVIDER_LATENCY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProviderLatency.displayName = 'BhProviderLatency';
