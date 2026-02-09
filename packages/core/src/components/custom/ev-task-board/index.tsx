import type { TaskBoardProps } from './core';
import { TASK_BOARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  TaskBoardProps,
  OperationalTask,
  TaskBoardPreset,
} from './core';

export type EvTaskBoardProps = TaskBoardProps;

export function TaskBoard(props: TaskBoardProps) {
  const { preset = TASK_BOARD_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

TaskBoard.displayName = 'TaskBoard';

export const EvTaskBoard = TaskBoard;
export { KanbanEvTaskBoard, TimelineEvTaskBoard } from './presets';
