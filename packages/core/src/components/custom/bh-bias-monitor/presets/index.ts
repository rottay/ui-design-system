/**
 * BhBiasMonitor - All Presets
 */

import type { BhBiasMonitorPreset, BhBiasMonitorProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhBiasMonitor } from './compact';

export { CompactBhBiasMonitor } from './compact';

export const BH_BIAS_MONITOR_PRESETS: Record<BhBiasMonitorPreset, ComponentType<BhBiasMonitorProps>> = {
  compact: CompactBhBiasMonitor,
};
