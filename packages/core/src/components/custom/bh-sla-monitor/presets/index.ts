/**
 * BhSlaMonitor - All Presets
 */

import type { BhSlaMonitorPreset } from '../core';
import { StandardBhSlaMonitor } from './standard';

export { StandardBhSlaMonitor } from './standard';

export const BH_SLA_MONITOR_PRESETS: Record<BhSlaMonitorPreset, React.ComponentType<any>> = {
  standard: StandardBhSlaMonitor,
};
