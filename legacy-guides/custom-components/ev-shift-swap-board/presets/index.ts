/**
 * EvShiftSwapBoard - All Presets
 */

export { BoardEvShiftSwapBoard } from './board';
export { ListEvShiftSwapBoard } from './list';

import type { EvShiftSwapBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvShiftSwapBoardProps } from '../core';
import { BoardEvShiftSwapBoard } from './board';
import { ListEvShiftSwapBoard } from './list';

export const EV_SHIFT_SWAP_BOARD_PRESETS: Record<EvShiftSwapBoardPreset, ComponentType<EvShiftSwapBoardProps>> = {
  board: BoardEvShiftSwapBoard,
  list: ListEvShiftSwapBoard,
};
