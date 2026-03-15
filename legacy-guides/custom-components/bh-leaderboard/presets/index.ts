/**
 * BhLeaderboard - All Presets
 */

import type { BhLeaderboardPreset, BhLeaderboardProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhLeaderboard } from './compact';

export { CompactBhLeaderboard } from './compact';

export const BH_LEADERBOARD_PRESETS: Record<BhLeaderboardPreset, ComponentType<BhLeaderboardProps>> = {
  compact: CompactBhLeaderboard,
};
