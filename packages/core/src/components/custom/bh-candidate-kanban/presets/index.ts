/**
 * BhCandidateKanban - All Presets
 */

import type { BhCandidateKanbanPreset, BhCandidateKanbanProps } from '../core';
import type { ComponentType } from 'react';
import { BoardBhCandidateKanban } from './board';
import { SwimlaneBhCandidateKanban } from './swimlane';

export { BoardBhCandidateKanban } from './board';
export { SwimlaneBhCandidateKanban } from './swimlane';

export const BH_CANDIDATE_KANBAN_PRESETS: Record<BhCandidateKanbanPreset, ComponentType<BhCandidateKanbanProps>> = {
  'board': BoardBhCandidateKanban,
  'swimlane': SwimlaneBhCandidateKanban,
};
