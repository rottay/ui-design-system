'use client';

/**
 * @fileoverview KanbanBoard pattern -- generic, engine-aware kanban board
 * with drag-and-drop, configurable columns, card rendering, and item management.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { KanbanBoardProps } from './KanbanBoard.types';

export type { KanbanBoardProps } from './KanbanBoard.types';
export type { KanbanColumnDef } from '../../foundation/types';

export const PatternKanbanBoard = createEngineComponent<KanbanBoardProps<any>>(
  'PatternKanbanBoard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
