import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type TaskBoardPreset = 'kanban' | 'timeline';

export interface OperationalTask {
  id: string;
  title: string;
  description?: string;
  department: string;
  assignee?: string;
  status: 'backlog' | 'today' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  checklist?: { item: string; done: boolean }[];
  dependencies?: string[];
}

export interface TaskBoardProps extends EngineAwareProps {
  preset?: TaskBoardPreset;
  tasks?: OperationalTask[];
  onTaskClick?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: OperationalTask['status']) => void;
  onCreateTask?: () => void;
  onAssign?: (taskId: string, assignee: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const TASK_BOARD_DEFAULTS: Required<
  Pick<TaskBoardProps, 'preset' | 'tasks'>
> = {
  preset: 'kanban',
  tasks: [],
};
