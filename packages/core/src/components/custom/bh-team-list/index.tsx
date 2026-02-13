/**
 * BhTeamList - Main Export
 * DataTable + Card view of teams with member avatars for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTeamListProps } from './core';
import { BH_TEAM_LIST_DEFAULTS } from './core';
import { BH_TEAM_LIST_PRESETS } from './presets';

export {
  type BhTeamListProps,
  type BhTeamListPreset,
  type TeamMember,
  type TeamSummary,
  BH_TEAM_LIST_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTeamList component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTeamList(props: BhTeamListProps): React.ReactElement {
  const preset = props.preset ?? BH_TEAM_LIST_DEFAULTS.preset ?? 'table';
  const PresetComponent = BH_TEAM_LIST_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTeamList.displayName = 'BhTeamList';

export { TableBhTeamList, CardsBhTeamList } from './presets';
