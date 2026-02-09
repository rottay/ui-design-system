/**
 * PlCompanyManager - All Presets
 */

export { TablePlCompanyManager } from './table';
export { CardsPlCompanyManager } from './cards';

import type { PlCompanyManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlCompanyManagerProps } from '../core';
import { TablePlCompanyManager } from './table';
import { CardsPlCompanyManager } from './cards';

export const PL_COMPANY_MANAGER_PRESETS: Record<PlCompanyManagerPreset, ComponentType<PlCompanyManagerProps>> = {
  table: TablePlCompanyManager,
  cards: CardsPlCompanyManager,
};
