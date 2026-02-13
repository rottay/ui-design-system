/**
 * BhPipelineKanbanCard - Main Export
 * Enhanced draggable pipeline card for individual candidates
 */

import type { BhPipelineKanbanCardProps } from './core';
import { BH_PIPELINE_KANBAN_CARD_DEFAULTS } from './core';
import { BH_PIPELINE_KANBAN_CARD_PRESETS } from './presets';

export {
  type BhPipelineKanbanCardProps,
  type BhPipelineKanbanCardPreset,
  type KanbanCandidate,
  type QuickActionType,
  BH_PIPELINE_KANBAN_CARD_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhPipelineKanbanCard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPipelineKanbanCard(props: BhPipelineKanbanCardProps): React.ReactElement {
  const preset = props.preset ?? BH_PIPELINE_KANBAN_CARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_PIPELINE_KANBAN_CARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPipelineKanbanCard.displayName = 'BhPipelineKanbanCard';

export { StandardBhPipelineKanbanCard, MinimalBhPipelineKanbanCard } from './presets';
