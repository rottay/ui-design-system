/**
 * BhPipelineVelocityChart - All Presets
 */

import type { BhPipelineVelocityChartPreset } from '../core';
import { LineBhPipelineVelocityChart } from './line';
import { CompactBhPipelineVelocityChart } from './compact';

export { LineBhPipelineVelocityChart } from './line';
export { CompactBhPipelineVelocityChart } from './compact';

export const BH_PIPELINE_VELOCITY_CHART_PRESETS: Record<BhPipelineVelocityChartPreset, React.ComponentType<any>> = {
  'line': LineBhPipelineVelocityChart,
  'compact': CompactBhPipelineVelocityChart,
};
