/**
 * BhPipelineVelocityChart - All Presets
 */

import type { BhPipelineVelocityChartPreset, BhPipelineVelocityChartProps } from '../core';
import type { ComponentType } from 'react';
import { LineBhPipelineVelocityChart } from './line';
import { CompactBhPipelineVelocityChart } from './compact';

export { LineBhPipelineVelocityChart } from './line';
export { CompactBhPipelineVelocityChart } from './compact';

export const BH_PIPELINE_VELOCITY_CHART_PRESETS: Record<BhPipelineVelocityChartPreset, ComponentType<BhPipelineVelocityChartProps>> = {
  'line': LineBhPipelineVelocityChart,
  'compact': CompactBhPipelineVelocityChart,
};
