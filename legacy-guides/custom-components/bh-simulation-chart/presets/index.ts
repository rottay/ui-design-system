/**
 * BhSimulationChart - All Presets
 */

export { StandardBhSimulationChart } from './standard';

import type { BhSimulationChartPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSimulationChartProps } from '../core';
import { StandardBhSimulationChart } from './standard';

export const BH_SIMULATION_CHART_PRESETS: Record<BhSimulationChartPreset, ComponentType<BhSimulationChartProps>> = {
  standard: StandardBhSimulationChart,
};
