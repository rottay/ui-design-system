/**
 * SprintBoard - All Presets
 */

import type { SprintBoardPreset, SprintBoardProps } from '../core';
import type { ComponentType } from 'react';
import { ByProjectSprintBoard } from './by-project';
import { BySprintSprintBoard } from './by-sprint';

export { ByProjectSprintBoard } from './by-project';
export { BySprintSprintBoard } from './by-sprint';

export const SPRINT_BOARD_PRESETS: Record<SprintBoardPreset, ComponentType<SprintBoardProps>> = {
  'by-project': ByProjectSprintBoard,
  'by-sprint': BySprintSprintBoard,
};
