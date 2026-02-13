/**
 * BhTeamDetail - Main Export
 * Team detail with member list, positions, performance for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTeamDetailProps } from './core';
import { BH_TEAM_DETAIL_DEFAULTS } from './core';
import { BH_TEAM_DETAIL_PRESETS } from './presets';

export {
  type BhTeamDetailProps,
  type BhTeamDetailPreset,
  type TeamPosition,
  BH_TEAM_DETAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTeamDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTeamDetail(props: BhTeamDetailProps): React.ReactElement {
  const preset = props.preset ?? BH_TEAM_DETAIL_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_TEAM_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTeamDetail.displayName = 'BhTeamDetail';

export { FullBhTeamDetail, CompactBhTeamDetail } from './presets';
