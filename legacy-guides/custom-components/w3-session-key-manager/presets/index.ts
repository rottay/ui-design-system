/**
 * W3SessionKeyManager - All Presets
 */

export { TableW3SessionKeyManager } from './table';
export { CardsW3SessionKeyManager } from './cards';

import type { W3SessionKeyManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3SessionKeyManagerProps } from '../core';
import { TableW3SessionKeyManager } from './table';
import { CardsW3SessionKeyManager } from './cards';

export const W3_SESSION_KEY_MANAGER_PRESETS: Record<W3SessionKeyManagerPreset, ComponentType<W3SessionKeyManagerProps>> = {
  table: TableW3SessionKeyManager,
  cards: CardsW3SessionKeyManager,
};
