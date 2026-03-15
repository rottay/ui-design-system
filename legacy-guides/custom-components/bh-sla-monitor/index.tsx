/**
 * BhSlaMonitor - Main Export
 * SLA Tracking Dashboard for BitHire ATS platform
 */

import type { BhSlaMonitorProps } from './core';
import { BH_SLA_MONITOR_DEFAULTS } from './core';
import { BH_SLA_MONITOR_PRESETS } from './presets';

export {
  type BhSlaMonitorProps,
  type BhSlaMonitorPreset,
  type SlaCompliance,
  type SlaBreach,
  type StageSla,
  type SlaStatusColor,
  type AtRiskItem,
  type SlaHistoryPoint,
  type SlaConfig,
  BH_SLA_MONITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSlaMonitor component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSlaMonitor(props: BhSlaMonitorProps): React.ReactElement {
  const preset = props.preset ?? BH_SLA_MONITOR_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_SLA_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSlaMonitor.displayName = 'BhSlaMonitor';

export { StandardBhSlaMonitor } from './presets';
