/**
 * BhPipelineKanbanCard - All Presets
 */

import type { BhPipelineKanbanCardPreset } from '../core';
import { StandardBhPipelineKanbanCard } from './standard';
import { MinimalBhPipelineKanbanCard } from './minimal';

export { StandardBhPipelineKanbanCard } from './standard';
export { MinimalBhPipelineKanbanCard } from './minimal';

export const BH_PIPELINE_KANBAN_CARD_PRESETS: Record<BhPipelineKanbanCardPreset, React.ComponentType<any>> = {
  'standard': StandardBhPipelineKanbanCard,
  'minimal': MinimalBhPipelineKanbanCard,
};
