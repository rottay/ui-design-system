/**
 * EvCheckInMonitor - All Presets
 */

export { DashboardEvCheckInMonitor } from './dashboard';
export { MapEvCheckInMonitor } from './map';

import type { EvCheckInMonitorPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvCheckInMonitorProps } from '../core';
import { DashboardEvCheckInMonitor } from './dashboard';
import { MapEvCheckInMonitor } from './map';

export const EV_CHECK_IN_MONITOR_PRESETS: Record<EvCheckInMonitorPreset, ComponentType<EvCheckInMonitorProps>> = {
  dashboard: DashboardEvCheckInMonitor,
  map: MapEvCheckInMonitor,
};
