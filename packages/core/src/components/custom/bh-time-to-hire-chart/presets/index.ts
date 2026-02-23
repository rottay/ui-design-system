/**
 * BhTimeToHireChart - All Presets
 */

import type { BhTimeToHireChartPreset, BhTimeToHireChartProps } from '../core';
import type { ComponentType } from 'react';
import { ChartBhTimeToHireChart } from './chart';
import { CompactBhTimeToHireChart } from './compact';

export { ChartBhTimeToHireChart } from './chart';
export { CompactBhTimeToHireChart } from './compact';

export const BH_TIME_TO_HIRE_CHART_PRESETS: Record<BhTimeToHireChartPreset, ComponentType<BhTimeToHireChartProps>> = {
  'chart': ChartBhTimeToHireChart,
  'compact': CompactBhTimeToHireChart,
};
