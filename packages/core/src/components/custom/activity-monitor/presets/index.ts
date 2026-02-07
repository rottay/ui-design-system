/**
 * ActivityMonitor - All Presets
 */

import type { ActivityMonitorPreset } from '../core';
import { DashboardActivityMonitor } from './dashboard';
import { CompactActivityMonitor } from './compact';

export { DashboardActivityMonitor } from './dashboard';
export { CompactActivityMonitor } from './compact';

export const ACTIVITY_MONITOR_PRESETS: Record<ActivityMonitorPreset, React.ComponentType<any>> = {
  dashboard: DashboardActivityMonitor,
  compact: CompactActivityMonitor,
};
