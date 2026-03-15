/**
 * BhFraudMonitor - Main Export
 * Event timeline with severity + review workflow
 */

import type { BhFraudMonitorProps } from './core';
import { BH_FRAUD_MONITOR_DEFAULTS } from './core';
import { BH_FRAUD_MONITOR_PRESETS } from './presets';

export { type BhFraudMonitorProps, type BhFraudMonitorPreset, type ProctoringEvent, type SimilarityCheck, type FraudStats, type EventSeverity, type EventType, type ReviewStatus, BH_FRAUD_MONITOR_DEFAULTS } from './core';
export * from './presets';

export function BhFraudMonitor(props: BhFraudMonitorProps): React.ReactElement {
  const preset = props.preset ?? BH_FRAUD_MONITOR_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_FRAUD_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhFraudMonitor.displayName = 'BhFraudMonitor';

export { DashboardBhFraudMonitor, CompactBhFraudMonitor } from './presets';
