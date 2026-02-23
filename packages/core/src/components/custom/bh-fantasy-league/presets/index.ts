/**
 * BhFantasyLeague - All Presets
 */

import type { BhFantasyLeaguePreset, BhFantasyLeagueProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhFantasyLeague } from './compact';

export { CompactBhFantasyLeague } from './compact';

export const BH_FANTASY_LEAGUE_PRESETS: Record<BhFantasyLeaguePreset, ComponentType<BhFantasyLeagueProps>> = {
  compact: CompactBhFantasyLeague,
};
