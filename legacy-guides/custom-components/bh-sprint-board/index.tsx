/**
 * BhSprintBoard - Main Export
 * Sprint planning board for BitHire recruiting sprints
 * Automatically selects preset based on props
 */

import type { BhSprintBoardProps } from './core';
import { BH_SPRINT_BOARD_DEFAULTS } from './core';
import { BH_SPRINT_BOARD_PRESETS } from './presets';

export {
  type BhSprintBoardProps,
  type BhSprintBoardPreset,
  type BacklogItem,
  type TeamMember,
  type SprintPlanningData,
  BH_SPRINT_BOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSprintBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSprintBoard(props: BhSprintBoardProps): React.ReactElement {
  const preset = props.preset ?? BH_SPRINT_BOARD_DEFAULTS.preset ?? 'planning';
  const PresetComponent = BH_SPRINT_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSprintBoard.displayName = 'BhSprintBoard';

export { PlanningBhSprintBoard } from './presets';
