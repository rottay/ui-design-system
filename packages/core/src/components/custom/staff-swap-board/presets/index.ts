/**
 * StaffSwapBoard - All Presets
 */

export { BoardStaffSwapBoard } from './board';
export { TableStaffSwapBoard } from './table';

import type { StaffSwapBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffSwapBoardProps } from '../core';
import { BoardStaffSwapBoard } from './board';
import { TableStaffSwapBoard } from './table';

export const STAFF_SWAP_BOARD_PRESETS: Record<StaffSwapBoardPreset, ComponentType<StaffSwapBoardProps>> = {
  board: BoardStaffSwapBoard,
  table: TableStaffSwapBoard,
};
