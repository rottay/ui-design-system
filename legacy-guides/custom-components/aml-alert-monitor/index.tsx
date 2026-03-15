/**
 * AmlAlertMonitor - Main Export
 * AML alert monitoring with investigation and analytics views
 */

import type { AmlAlertMonitorProps } from './core';
import { AML_ALERT_MONITOR_DEFAULTS } from './core';
import { AML_ALERT_MONITOR_PRESETS } from './presets';

export { type AmlAlertMonitorProps, type AmlAlertMonitorPreset, type AmlAlert, type AlertSeverity, type AlertStatus, type AlertType, AML_ALERT_MONITOR_DEFAULTS } from './core';
export * from './presets';

/**
 * AmlAlertMonitor component
 * Renders the appropriate preset based on the preset prop
 */
export function AmlAlertMonitor(props: AmlAlertMonitorProps): React.ReactElement {
  const preset = props.preset ?? AML_ALERT_MONITOR_DEFAULTS.preset ?? 'monitor';
  const PresetComponent = AML_ALERT_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

AmlAlertMonitor.displayName = 'AmlAlertMonitor';

export { MonitorAmlAlertMonitor, InvestigationAmlAlertMonitor, AnalyticsAmlAlertMonitor } from './presets';
