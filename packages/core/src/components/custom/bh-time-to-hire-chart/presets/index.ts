/**
 * BhTimeToHireChart - All Presets
 */

import type { BhTimeToHireChartPreset } from '../core';
import { ChartBhTimeToHireChart } from './chart';
import { CompactBhTimeToHireChart } from './compact';

export { ChartBhTimeToHireChart } from './chart';
export { CompactBhTimeToHireChart } from './compact';

export const BH_TIME_TO_HIRE_CHART_PRESETS: Record<BhTimeToHireChartPreset, React.ComponentType<any>> = {
  'chart': ChartBhTimeToHireChart,
  'compact': CompactBhTimeToHireChart,
};
