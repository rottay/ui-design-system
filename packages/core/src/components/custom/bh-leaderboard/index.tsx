/**
 * BhLeaderboard - Main Export
 * Dashboard widget showing recruiter leaderboard rankings.
 */

import type { BhLeaderboardProps } from './core';
import { BH_LEADERBOARD_DEFAULTS } from './core';
import { BH_LEADERBOARD_PRESETS } from './presets';

export {
  type BhLeaderboardProps,
  type BhLeaderboardPreset,
  type LeaderboardEntry,
  BH_LEADERBOARD_DEFAULTS,
} from './core';
export * from './presets';

export function BhLeaderboard(props: BhLeaderboardProps): React.ReactElement {
  const preset = props.preset ?? BH_LEADERBOARD_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_LEADERBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhLeaderboard.displayName = 'BhLeaderboard';

export { CompactBhLeaderboard } from './presets';
