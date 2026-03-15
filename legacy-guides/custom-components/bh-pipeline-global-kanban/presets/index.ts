/**
 * BhPipelineGlobalKanban - All Presets
 */

import type { BhPipelineGlobalKanbanPreset, BhPipelineGlobalKanbanProps } from '../core';
import type { ComponentType } from 'react';
import { BoardBhPipelineGlobalKanban } from './board';
import { CompactBhPipelineGlobalKanban } from './compact';

export { BoardBhPipelineGlobalKanban } from './board';
export { CompactBhPipelineGlobalKanban } from './compact';

export const BH_PIPELINE_GLOBAL_KANBAN_PRESETS: Record<BhPipelineGlobalKanbanPreset, ComponentType<BhPipelineGlobalKanbanProps>> = {
  'board': BoardBhPipelineGlobalKanban,
  'compact': CompactBhPipelineGlobalKanban,
};
