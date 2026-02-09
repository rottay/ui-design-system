/**
 * PlSessionManager - All Presets
 */

export { TablePlSessionManager } from './table';
export { CardsPlSessionManager } from './cards';

import type { PlSessionManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlSessionManagerProps } from '../core';
import { TablePlSessionManager } from './table';
import { CardsPlSessionManager } from './cards';

export const PL_SESSION_MANAGER_PRESETS: Record<PlSessionManagerPreset, ComponentType<PlSessionManagerProps>> = {
  table: TablePlSessionManager,
  cards: CardsPlSessionManager,
};
