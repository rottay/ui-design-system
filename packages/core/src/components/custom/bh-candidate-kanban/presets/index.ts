/**
 * BhCandidateKanban - All Presets
 */

import type { BhCandidateKanbanPreset } from '../core';
import { BoardBhCandidateKanban } from './board';
import { SwimlaneBhCandidateKanban } from './swimlane';

export { BoardBhCandidateKanban } from './board';
export { SwimlaneBhCandidateKanban } from './swimlane';

export const BH_CANDIDATE_KANBAN_PRESETS: Record<BhCandidateKanbanPreset, React.ComponentType<any>> = {
  'board': BoardBhCandidateKanban,
  'swimlane': SwimlaneBhCandidateKanban,
};
