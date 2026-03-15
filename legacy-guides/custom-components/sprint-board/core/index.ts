import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type SprintBoardPreset = 'by-project' | 'by-sprint';

export type TaskStatus = 'not-started' | 'in-progress' | 'done' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SprintTask {
  id: string;
  taskId: string;
  name: string;
  status: TaskStatus;
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  priority?: TaskPriority;
  sprint?: string;
  project?: string;
  summary?: string;
  tags?: string[];
}

export interface SprintGroup {
  id: string;
  name: string;
  icon?: ReactNode;
  tasks: SprintTask[];
  collapsed?: boolean;
}

export interface SprintBoardTab {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface SprintBoardFilter {
  key: string;
  label: string;
  icon?: ReactNode;
  options?: Array<{ value: string; label: string }>;
  value?: string;
}

export interface SprintBoardProps extends EngineAwareProps {
  preset?: SprintBoardPreset;
  groups: SprintGroup[];
  tabs?: SprintBoardTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  filters?: SprintBoardFilter[];
  onFilterChange?: (key: string, value: string) => void;
  onAddFilter?: () => void;
  onTaskClick?: (task: SprintTask) => void;
  onNewTask?: (groupId: string) => void;
  onGroupToggle?: (groupId: string) => void;
  title?: string;
  headerActions?: ReactNode;
  showCompletionCount?: boolean;
  columns?: Array<{ key: string; label: string; icon?: ReactNode; width?: number | string }>;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  sortable?: boolean;
  onSort?: () => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  // Interactive props
  onTaskMove?: (taskId: string, fromGroupId: string, toGroupId: string, newIndex: number) => void;
  draggable?: boolean;
}

export const SPRINT_BOARD_DEFAULTS: Partial<SprintBoardProps> = {
  preset: 'by-project',
  showCompletionCount: true,
  title: 'Tasks',
};
