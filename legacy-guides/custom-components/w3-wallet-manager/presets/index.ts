/**
 * W3WalletManager - All Presets
 */

export { CardsW3WalletManager } from './cards';
export { TableW3WalletManager } from './table';

import type { W3WalletManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3WalletManagerProps } from '../core';
import { CardsW3WalletManager } from './cards';
import { TableW3WalletManager } from './table';

export const W3_WALLET_MANAGER_PRESETS: Record<W3WalletManagerPreset, ComponentType<W3WalletManagerProps>> = {
  cards: CardsW3WalletManager,
  table: TableW3WalletManager,
};
