/**
 * PlApiKeyManager - All Presets
 */

export { TablePlApiKeyManager } from './table';
export { CardsPlApiKeyManager } from './cards';

import type { PlApiKeyManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlApiKeyManagerProps } from '../core';
import { TablePlApiKeyManager } from './table';
import { CardsPlApiKeyManager } from './cards';

export const PL_API_KEY_MANAGER_PRESETS: Record<PlApiKeyManagerPreset, ComponentType<PlApiKeyManagerProps>> = {
  table: TablePlApiKeyManager,
  cards: CardsPlApiKeyManager,
};
