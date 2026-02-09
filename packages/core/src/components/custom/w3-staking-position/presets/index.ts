/**
 * W3StakingPosition - All Presets
 */

export { CardsW3StakingPosition } from './cards';
export { TableW3StakingPosition } from './table';

import type { W3StakingPositionPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3StakingPositionProps } from '../core';
import { CardsW3StakingPosition } from './cards';
import { TableW3StakingPosition } from './table';

export const W3_STAKING_POSITION_PRESETS: Record<W3StakingPositionPreset, ComponentType<W3StakingPositionProps>> = {
  cards: CardsW3StakingPosition,
  table: TableW3StakingPosition,
};
