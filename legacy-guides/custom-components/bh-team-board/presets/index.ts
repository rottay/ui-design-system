/**
 * BhTeamBoard - All Presets
 */

export { GridBhTeamBoard } from './grid';
export { DetailBhTeamBoard } from './detail';

import type { BhTeamBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTeamBoardProps } from '../core';
import { GridBhTeamBoard } from './grid';
import { DetailBhTeamBoard } from './detail';

export const BH_TEAM_BOARD_PRESETS: Record<BhTeamBoardPreset, ComponentType<BhTeamBoardProps>> = {
  grid: GridBhTeamBoard,
  detail: DetailBhTeamBoard,
};
