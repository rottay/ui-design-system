/**
 * W3StakingTierConfig - All Presets
 */

export { EditorW3StakingTierConfig } from './editor';
export { CardsW3StakingTierConfig } from './cards';

import type { W3StakingTierConfigPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3StakingTierConfigProps } from '../core';
import { EditorW3StakingTierConfig } from './editor';
import { CardsW3StakingTierConfig } from './cards';

export const W3_STAKING_TIER_CONFIG_PRESETS: Record<W3StakingTierConfigPreset, ComponentType<W3StakingTierConfigProps>> = {
  editor: EditorW3StakingTierConfig,
  cards: CardsW3StakingTierConfig,
};
