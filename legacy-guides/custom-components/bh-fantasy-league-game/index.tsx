/**
 * BhFantasyLeagueGame - Main Export
 * Full Fantasy League game experience for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhFantasyLeagueGameProps } from './core';
import { BH_FANTASY_LEAGUE_GAME_DEFAULTS } from './core';
import { BH_FANTASY_LEAGUE_GAME_PRESETS } from './presets';

export {
  type BhFantasyLeagueGameProps,
  type BhFantasyLeagueGamePreset,
  type FantasyCandidate,
  type FantasyPredictionEntry,
  type FantasyPlayer,
  type FantasyLeagueInfo,
  BH_FANTASY_LEAGUE_GAME_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhFantasyLeagueGame component
 * Renders the appropriate preset based on the preset prop
 */
export function BhFantasyLeagueGame(props: BhFantasyLeagueGameProps): React.ReactElement {
  const preset = props.preset ?? BH_FANTASY_LEAGUE_GAME_DEFAULTS.preset ?? 'predict';
  const PresetComponent = BH_FANTASY_LEAGUE_GAME_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhFantasyLeagueGame.displayName = 'BhFantasyLeagueGame';

export { PredictBhFantasyLeagueGame, LeaderboardBhFantasyLeagueGame, DashboardBhFantasyLeagueGame } from './presets';
