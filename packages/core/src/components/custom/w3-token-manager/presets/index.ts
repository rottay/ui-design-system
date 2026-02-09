/**
 * W3TokenManager - All Presets
 */

export { TableW3TokenManager } from './table';
export { CardsW3TokenManager } from './cards';

import type { W3TokenManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TokenManagerProps } from '../core';
import { TableW3TokenManager } from './table';
import { CardsW3TokenManager } from './cards';

export const W3_TOKEN_MANAGER_PRESETS: Record<W3TokenManagerPreset, ComponentType<W3TokenManagerProps>> = {
  table: TableW3TokenManager,
  cards: CardsW3TokenManager,
};
