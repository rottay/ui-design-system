/**
 * BhTeamList - All Presets
 */

export { TableBhTeamList } from './table';
export { CardsBhTeamList } from './cards';

import type { BhTeamListPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTeamListProps } from '../core';
import { TableBhTeamList } from './table';
import { CardsBhTeamList } from './cards';

export const BH_TEAM_LIST_PRESETS: Record<BhTeamListPreset, ComponentType<BhTeamListProps>> = {
  table: TableBhTeamList,
  cards: CardsBhTeamList,
};
