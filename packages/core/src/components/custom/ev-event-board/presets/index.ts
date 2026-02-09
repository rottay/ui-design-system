/**
 * EvEventBoard - All Presets
 */

export { GridEvEventBoard } from './grid';
export { TableEvEventBoard } from './table';

import type { EvEventBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvEventBoardProps } from '../core';
import { GridEvEventBoard } from './grid';
import { TableEvEventBoard } from './table';

export const EV_EVENT_BOARD_PRESETS: Record<EvEventBoardPreset, ComponentType<EvEventBoardProps>> = {
  grid: GridEvEventBoard,
  table: TableEvEventBoard,
};
