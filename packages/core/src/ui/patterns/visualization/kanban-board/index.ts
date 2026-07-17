'use client';

/**
 * @fileoverview KanbanBoard pattern -- generic, engine-aware kanban board
 * with drag-and-drop, configurable columns, card rendering, and item management.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { KanbanBoardProps } from './contracts';

export type { KanbanBoardProps } from './contracts';
export type { KanbanColumnDef } from '../../../../foundation/contracts/runtime/components/patterns/core';

export const PatternKanbanBoard = createEngineComponent<KanbanBoardProps<any>>(
  'PatternKanbanBoard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
