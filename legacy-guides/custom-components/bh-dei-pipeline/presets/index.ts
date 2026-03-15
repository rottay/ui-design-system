/**
 * BhDeiPipeline - All Presets
 */

import type { BhDeiPipelinePreset, BhDeiPipelineProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhDeiPipeline } from './compact';

export { CompactBhDeiPipeline } from './compact';

export const BH_DEI_PIPELINE_PRESETS: Record<BhDeiPipelinePreset, ComponentType<BhDeiPipelineProps>> = {
  compact: CompactBhDeiPipeline,
};
