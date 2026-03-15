/**
 * BhPipelineBottleneck - All Presets
 */

import type { BhPipelineBottleneckPreset, BhPipelineBottleneckProps } from '../core';
import type { ComponentType } from 'react';
import { VisualBhPipelineBottleneck } from './visual';
import { ListBhPipelineBottleneck } from './list';

export { VisualBhPipelineBottleneck } from './visual';
export { ListBhPipelineBottleneck } from './list';

export const BH_PIPELINE_BOTTLENECK_PRESETS: Record<BhPipelineBottleneckPreset, ComponentType<BhPipelineBottleneckProps>> = {
  'visual': VisualBhPipelineBottleneck,
  'list': ListBhPipelineBottleneck,
};
