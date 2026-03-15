/**
 * BhTeamCard - All Presets
 */

export { StandardBhTeamCard } from './standard';
export { CompactBhTeamCard } from './compact';

import type { BhTeamCardPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTeamCardProps } from '../core';
import { StandardBhTeamCard } from './standard';
import { CompactBhTeamCard } from './compact';

export const BH_TEAM_CARD_PRESETS: Record<BhTeamCardPreset, ComponentType<BhTeamCardProps>> = {
  standard: StandardBhTeamCard,
  compact: CompactBhTeamCard,
};
