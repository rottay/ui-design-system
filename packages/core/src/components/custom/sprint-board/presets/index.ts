/**
 * SprintBoard - All Presets
 */

import type { SprintBoardPreset } from '../core';
import { ByProjectSprintBoard } from './by-project';
import { BySprintSprintBoard } from './by-sprint';

export { ByProjectSprintBoard } from './by-project';
export { BySprintSprintBoard } from './by-sprint';

export const SPRINT_BOARD_PRESETS: Record<SprintBoardPreset, React.ComponentType<any>> = {
  'by-project': ByProjectSprintBoard,
  'by-sprint': BySprintSprintBoard,
};
