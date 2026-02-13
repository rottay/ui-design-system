/**
 * BhPipelineGlobalKanban - All Presets
 */

import type { BhPipelineGlobalKanbanPreset } from '../core';
import { BoardBhPipelineGlobalKanban } from './board';
import { CompactBhPipelineGlobalKanban } from './compact';

export { BoardBhPipelineGlobalKanban } from './board';
export { CompactBhPipelineGlobalKanban } from './compact';

export const BH_PIPELINE_GLOBAL_KANBAN_PRESETS: Record<BhPipelineGlobalKanbanPreset, React.ComponentType<any>> = {
  'board': BoardBhPipelineGlobalKanban,
  'compact': CompactBhPipelineGlobalKanban,
};
