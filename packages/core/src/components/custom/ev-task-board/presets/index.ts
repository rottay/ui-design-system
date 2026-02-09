export { KanbanEvTaskBoard } from './kanban';
export { TimelineEvTaskBoard } from './timeline';

import type { TaskBoardPreset } from '../core';
import type { ComponentType } from 'react';
import type { TaskBoardProps } from '../core';
import { KanbanEvTaskBoard } from './kanban';
import { TimelineEvTaskBoard } from './timeline';

export const PRESETS: Record<TaskBoardPreset, ComponentType<TaskBoardProps>> =
  {
    kanban: KanbanEvTaskBoard,
    timeline: TimelineEvTaskBoard,
  };
