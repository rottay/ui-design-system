/**
 * PlTokenManager - All Presets
 */

export { TablePlTokenManager } from './table';
export { CardsPlTokenManager } from './cards';

import type { PlTokenManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlTokenManagerProps } from '../core';
import { TablePlTokenManager } from './table';
import { CardsPlTokenManager } from './cards';

export const PL_TOKEN_MANAGER_PRESETS: Record<PlTokenManagerPreset, ComponentType<PlTokenManagerProps>> = {
  table: TablePlTokenManager,
  cards: CardsPlTokenManager,
};
