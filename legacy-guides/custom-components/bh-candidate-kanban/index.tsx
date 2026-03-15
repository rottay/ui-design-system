/**
 * BhCandidateKanban - Main Export
 * Pipeline Kanban Board for BitHire ATS platform
 */

import type { BhCandidateKanbanProps } from './core';
import { BH_CANDIDATE_KANBAN_DEFAULTS } from './core';
import { BH_CANDIDATE_KANBAN_PRESETS } from './presets';

export {
  type BhCandidateKanbanProps,
  type BhCandidateKanbanPreset,
  type KanbanCandidate,
  type KanbanStage,
  type KanbanFilter,
  type BulkAction,
  type CandidateSource,
  type AiRecommendation,
  type SlaStatus,
  BH_CANDIDATE_KANBAN_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCandidateKanban component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateKanban(props: BhCandidateKanbanProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_KANBAN_DEFAULTS.preset ?? 'board';
  const PresetComponent = BH_CANDIDATE_KANBAN_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateKanban.displayName = 'BhCandidateKanban';

export { BoardBhCandidateKanban, SwimlaneBhCandidateKanban } from './presets';
