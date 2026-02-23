/**
 * BhFantasyLeagueGame - All Presets
 */

export { PredictBhFantasyLeagueGame } from './predict';
export { LeaderboardBhFantasyLeagueGame } from './leaderboard';
export { DashboardBhFantasyLeagueGame } from './dashboard';

import type { BhFantasyLeagueGamePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhFantasyLeagueGameProps } from '../core';
import { PredictBhFantasyLeagueGame } from './predict';
import { LeaderboardBhFantasyLeagueGame } from './leaderboard';
import { DashboardBhFantasyLeagueGame } from './dashboard';

export const BH_FANTASY_LEAGUE_GAME_PRESETS: Record<BhFantasyLeagueGamePreset, ComponentType<BhFantasyLeagueGameProps>> = {
  predict: PredictBhFantasyLeagueGame,
  leaderboard: LeaderboardBhFantasyLeagueGame,
  dashboard: DashboardBhFantasyLeagueGame,
};
