'use client';

/**
 * KanbanBoard<T> - Pattern Component
 *
 * Generic, engine-aware kanban board with drag-and-drop,
 * configurable columns, card rendering, and item management.
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { KanbanBoardProps } from './types';

export type { KanbanBoardProps } from './types';
export type { KanbanColumnDef } from '../types';

export const PatternKanbanBoard = createEngineComponent<KanbanBoardProps<any>>(
  'PatternKanbanBoard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
