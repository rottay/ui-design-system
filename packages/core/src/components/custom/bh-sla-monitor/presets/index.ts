/**
 * BhSlaMonitor - All Presets
 */

import type { BhSlaMonitorPreset, BhSlaMonitorProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhSlaMonitor } from './standard';

export { StandardBhSlaMonitor } from './standard';

export const BH_SLA_MONITOR_PRESETS: Record<BhSlaMonitorPreset, ComponentType<BhSlaMonitorProps>> = {
  standard: StandardBhSlaMonitor,
};
