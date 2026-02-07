/**
 * BhJobBoard - All Presets
 */

export { GridBhJobBoard } from './grid';
export { TableBhJobBoard } from './table';
export { KanbanBhJobBoard } from './kanban';

import type { BhJobBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhJobBoardProps } from '../core';
import { GridBhJobBoard } from './grid';
import { TableBhJobBoard } from './table';
import { KanbanBhJobBoard } from './kanban';

export const BH_JOB_BOARD_PRESETS: Record<BhJobBoardPreset, ComponentType<BhJobBoardProps>> = {
  grid: GridBhJobBoard,
  table: TableBhJobBoard,
  kanban: KanbanBhJobBoard,
};
