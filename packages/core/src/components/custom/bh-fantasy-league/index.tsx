/**
 * BhFantasyLeague - Main Export
 * Dashboard widget showing fantasy recruiting league stats at a glance.
 */

import type { BhFantasyLeagueProps } from './core';
import { BH_FANTASY_LEAGUE_DEFAULTS } from './core';
import { BH_FANTASY_LEAGUE_PRESETS } from './presets';

export {
  type BhFantasyLeagueProps,
  type BhFantasyLeaguePreset,
  type FantasyLeagueData,
  type FantasyPrediction,
  BH_FANTASY_LEAGUE_DEFAULTS,
} from './core';
export * from './presets';

export function BhFantasyLeague(props: BhFantasyLeagueProps): React.ReactElement {
  const preset = props.preset ?? BH_FANTASY_LEAGUE_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_FANTASY_LEAGUE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhFantasyLeague.displayName = 'BhFantasyLeague';

export { CompactBhFantasyLeague } from './presets';
