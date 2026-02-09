/**
 * PlTenantManager - All Presets
 */

export { TablePlTenantManager } from './table';
export { CardsPlTenantManager } from './cards';

import type { PlTenantManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlTenantManagerProps } from '../core';
import { TablePlTenantManager } from './table';
import { CardsPlTenantManager } from './cards';

export const PL_TENANT_MANAGER_PRESETS: Record<PlTenantManagerPreset, ComponentType<PlTenantManagerProps>> = {
  table: TablePlTenantManager,
  cards: CardsPlTenantManager,
};
