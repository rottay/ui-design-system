/**
 * EvRevenueMonitor - All Presets
 */

export { RealtimeEvRevenueMonitor } from './realtime';
export { HistoricalEvRevenueMonitor } from './historical';

import type { EvRevenueMonitorPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvRevenueMonitorProps } from '../core';
import { RealtimeEvRevenueMonitor } from './realtime';
import { HistoricalEvRevenueMonitor } from './historical';

export const EV_REVENUE_MONITOR_PRESETS: Record<EvRevenueMonitorPreset, ComponentType<EvRevenueMonitorProps>> = {
  realtime: RealtimeEvRevenueMonitor,
  historical: HistoricalEvRevenueMonitor,
};
