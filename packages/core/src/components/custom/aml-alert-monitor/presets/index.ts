/**
 * AmlAlertMonitor - All Presets
 */

import type { AmlAlertMonitorPreset } from '../core';
import { MonitorAmlAlertMonitor } from './monitor';
import { InvestigationAmlAlertMonitor } from './investigation';
import { AnalyticsAmlAlertMonitor } from './analytics';

export { MonitorAmlAlertMonitor } from './monitor';
export { InvestigationAmlAlertMonitor } from './investigation';
export { AnalyticsAmlAlertMonitor } from './analytics';

export const AML_ALERT_MONITOR_PRESETS: Record<AmlAlertMonitorPreset, React.ComponentType<any>> = {
  monitor: MonitorAmlAlertMonitor,
  investigation: InvestigationAmlAlertMonitor,
  analytics: AnalyticsAmlAlertMonitor,
};
