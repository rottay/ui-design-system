/**
 * BhPipelineBottleneck - All Presets
 */

import type { BhPipelineBottleneckPreset } from '../core';
import { VisualBhPipelineBottleneck } from './visual';
import { ListBhPipelineBottleneck } from './list';

export { VisualBhPipelineBottleneck } from './visual';
export { ListBhPipelineBottleneck } from './list';

export const BH_PIPELINE_BOTTLENECK_PRESETS: Record<BhPipelineBottleneckPreset, React.ComponentType<any>> = {
  'visual': VisualBhPipelineBottleneck,
  'list': ListBhPipelineBottleneck,
};
