/**
 * BhTeamCard - Main Export
 * Team summary card with performance metrics for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTeamCardProps } from './core';
import { BH_TEAM_CARD_DEFAULTS } from './core';
import { BH_TEAM_CARD_PRESETS } from './presets';

export {
  type BhTeamCardProps,
  type BhTeamCardPreset,
  type TeamMetric,
  BH_TEAM_CARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTeamCard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTeamCard(props: BhTeamCardProps): React.ReactElement {
  const preset = props.preset ?? BH_TEAM_CARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_TEAM_CARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTeamCard.displayName = 'BhTeamCard';

export { StandardBhTeamCard, CompactBhTeamCard } from './presets';
