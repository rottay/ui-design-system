/**
 * BhFraudMonitor - All Presets
 */

import type { BhFraudMonitorPreset, BhFraudMonitorProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhFraudMonitor } from './dashboard';
import { CompactBhFraudMonitor } from './compact';

export { DashboardBhFraudMonitor } from './dashboard';
export { CompactBhFraudMonitor } from './compact';

export const BH_FRAUD_MONITOR_PRESETS: Record<BhFraudMonitorPreset, ComponentType<BhFraudMonitorProps>> = {
  dashboard: DashboardBhFraudMonitor,
  compact: CompactBhFraudMonitor,
};
