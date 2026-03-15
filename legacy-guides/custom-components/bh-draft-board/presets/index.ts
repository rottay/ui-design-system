/**
 * BhDraftBoard - All Presets
 */

export { SetupBhDraftBoard } from './setup';
export { LiveBhDraftBoard } from './live';
export { ResultsBhDraftBoard } from './results';

import type { BhDraftBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhDraftBoardProps } from '../core';
import { SetupBhDraftBoard } from './setup';
import { LiveBhDraftBoard } from './live';
import { ResultsBhDraftBoard } from './results';

export const BH_DRAFT_BOARD_PRESETS: Record<BhDraftBoardPreset, ComponentType<BhDraftBoardProps>> = {
  setup: SetupBhDraftBoard,
  live: LiveBhDraftBoard,
  results: ResultsBhDraftBoard,
};
