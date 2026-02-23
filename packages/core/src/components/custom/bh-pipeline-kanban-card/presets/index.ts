/**
 * BhPipelineKanbanCard - All Presets
 */

import type { BhPipelineKanbanCardPreset, BhPipelineKanbanCardProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhPipelineKanbanCard } from './standard';
import { MinimalBhPipelineKanbanCard } from './minimal';

export { StandardBhPipelineKanbanCard } from './standard';
export { MinimalBhPipelineKanbanCard } from './minimal';

export const BH_PIPELINE_KANBAN_CARD_PRESETS: Record<BhPipelineKanbanCardPreset, ComponentType<BhPipelineKanbanCardProps>> = {
  'standard': StandardBhPipelineKanbanCard,
  'minimal': MinimalBhPipelineKanbanCard,
};
