/**
 * SprintBoard - Main Export
 * Automatically selects preset based on props
 */

import type { SprintBoardProps } from './core';
import { SPRINT_BOARD_DEFAULTS } from './core';
import { SPRINT_BOARD_PRESETS } from './presets';

export { type SprintBoardProps, type SprintBoardPreset, type SprintTask, type SprintGroup, type TaskStatus, type TaskPriority, type SprintBoardTab, type SprintBoardFilter, SPRINT_BOARD_DEFAULTS } from './core';
export * from './presets';

/**
 * SprintBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function SprintBoard(props: SprintBoardProps): React.ReactElement {
  const preset = props.preset ?? SPRINT_BOARD_DEFAULTS.preset ?? 'by-project';
  const PresetComponent = SPRINT_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

SprintBoard.displayName = 'SprintBoard';

export { ByProjectSprintBoard, BySprintSprintBoard } from './presets';
