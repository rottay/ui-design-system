/**
 * BhTeamBoard - Main Export
 * Team Management Board for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTeamBoardProps } from './core';
import { BH_TEAM_BOARD_DEFAULTS } from './core';
import { BH_TEAM_BOARD_PRESETS } from './presets';

export {
  type BhTeamBoardProps,
  type BhTeamBoardPreset,
  type TeamItem,
  type TeamMember,
  type TeamKpiData,
  type SprintData,
  type TeamTarget,
  BH_TEAM_BOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTeamBoard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTeamBoard(props: BhTeamBoardProps): React.ReactElement {
  const preset = props.preset ?? BH_TEAM_BOARD_DEFAULTS.preset ?? 'grid';
  const PresetComponent = BH_TEAM_BOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTeamBoard.displayName = 'BhTeamBoard';

export { GridBhTeamBoard, DetailBhTeamBoard } from './presets';
