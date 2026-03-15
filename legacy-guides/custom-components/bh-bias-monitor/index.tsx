/**
 * BhBiasMonitor - Main Export
 * Dashboard widget showing interviewer bias monitoring metrics.
 */

import type { BhBiasMonitorProps } from './core';
import { BH_BIAS_MONITOR_DEFAULTS } from './core';
import { BH_BIAS_MONITOR_PRESETS } from './presets';

export {
  type BhBiasMonitorProps,
  type BhBiasMonitorPreset,
  type BiasMonitorData,
  type BiasMetric,
  type BiasAlert,
  BH_BIAS_MONITOR_DEFAULTS,
  getBiasStatusColor,
  getBiasStatusBadgeColor,
  getOverallBiasInfo,
} from './core';
export * from './presets';

export function BhBiasMonitor(props: BhBiasMonitorProps): React.ReactElement {
  const preset = props.preset ?? BH_BIAS_MONITOR_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_BIAS_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhBiasMonitor.displayName = 'BhBiasMonitor';

export { CompactBhBiasMonitor } from './presets';
