/**
 * BhControlChart - All Presets
 */

import type { BhControlChartPreset, BhControlChartProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhControlChart } from './standard';

export { StandardBhControlChart } from './standard';

export const BH_CONTROL_CHART_PRESETS: Record<BhControlChartPreset, ComponentType<BhControlChartProps>> = {
  standard: StandardBhControlChart,
};
