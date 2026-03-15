/**
 * BhSprintBoard - All Presets
 */

export { PlanningBhSprintBoard } from './planning';

import type { BhSprintBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSprintBoardProps } from '../core';
import { PlanningBhSprintBoard } from './planning';

export const BH_SPRINT_BOARD_PRESETS: Record<BhSprintBoardPreset, ComponentType<BhSprintBoardProps>> = {
  planning: PlanningBhSprintBoard,
};
