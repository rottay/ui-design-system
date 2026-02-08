/**
 * BhFraudMonitor - All Presets
 */

import type { BhFraudMonitorPreset } from '../core';
import { DashboardBhFraudMonitor } from './dashboard';
import { CompactBhFraudMonitor } from './compact';

export { DashboardBhFraudMonitor } from './dashboard';
export { CompactBhFraudMonitor } from './compact';

export const BH_FRAUD_MONITOR_PRESETS: Record<BhFraudMonitorPreset, React.ComponentType<any>> = {
  dashboard: DashboardBhFraudMonitor,
  compact: CompactBhFraudMonitor,
};
