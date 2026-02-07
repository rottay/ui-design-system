import type { LeaderboardProps } from './core';
import { LEADERBOARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { LeaderboardProps, LeaderboardPreset, LeaderboardEntry } from './core';
export { LEADERBOARD_DEFAULTS } from './core';

export function Leaderboard(props: LeaderboardProps): React.ReactElement {
  const preset = props.preset ?? LEADERBOARD_DEFAULTS.preset ?? 'numbered';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

Leaderboard.displayName = 'Leaderboard';
