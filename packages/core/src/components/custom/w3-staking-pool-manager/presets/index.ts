/**
 * W3StakingPoolManager - All Presets
 */

export { CardsW3StakingPoolManager } from './cards';
export { TableW3StakingPoolManager } from './table';

import type { W3StakingPoolManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3StakingPoolManagerProps } from '../core';
import { CardsW3StakingPoolManager } from './cards';
import { TableW3StakingPoolManager } from './table';

export const W3_STAKING_POOL_MANAGER_PRESETS: Record<W3StakingPoolManagerPreset, ComponentType<W3StakingPoolManagerProps>> = {
  cards: CardsW3StakingPoolManager,
  table: TableW3StakingPoolManager,
};
