/**
 * BhProviderLatency - All Presets
 */

export { ChartBhProviderLatency } from './chart';
export { CompactBhProviderLatency } from './compact';

import type { BhProviderLatencyPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhProviderLatencyProps } from '../core';
import { ChartBhProviderLatency } from './chart';
import { CompactBhProviderLatency } from './compact';

export const BH_PROVIDER_LATENCY_PRESETS: Record<BhProviderLatencyPreset, ComponentType<BhProviderLatencyProps>> = {
  chart: ChartBhProviderLatency,
  compact: CompactBhProviderLatency,
};
