/**
 * ActivityMonitor - All Presets
 */

import type { ActivityMonitorPreset, ActivityMonitorProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardActivityMonitor } from './dashboard';
import { CompactActivityMonitor } from './compact';

export { DashboardActivityMonitor } from './dashboard';
export { CompactActivityMonitor } from './compact';

export const ACTIVITY_MONITOR_PRESETS: Record<ActivityMonitorPreset, ComponentType<ActivityMonitorProps>> = {
  dashboard: DashboardActivityMonitor,
  compact: CompactActivityMonitor,
};
