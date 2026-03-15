/**
 * BhPipelineGlobalKanban - Main Export
 * Full pipeline Kanban board with columns per stage
 */

import type { BhPipelineGlobalKanbanProps } from './core';
import { BH_PIPELINE_GLOBAL_KANBAN_DEFAULTS } from './core';
import { BH_PIPELINE_GLOBAL_KANBAN_PRESETS } from './presets';

export {
  type BhPipelineGlobalKanbanProps,
  type BhPipelineGlobalKanbanPreset,
  type KanbanStage,
  type KanbanStageCandidate,
  type KanbanFilters,
  BH_PIPELINE_GLOBAL_KANBAN_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineGlobalKanban component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineGlobalKanban(props: BhPipelineGlobalKanbanProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_GLOBAL_KANBAN_DEFAULTS.preset ?? 'board';
  const PresetComponent = BH_PIPELINE_GLOBAL_KANBAN_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineGlobalKanban.displayName = 'BhPipelineGlobalKanban';

export { BoardBhPipelineGlobalKanban, CompactBhPipelineGlobalKanban } from './presets';
