/**
 * PmPayoutManager - All Presets
 */

export { TablePmPayoutManager } from './table';
export { CardsPmPayoutManager } from './cards';

import type { PmPayoutManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPayoutManagerProps } from '../core';
import { TablePmPayoutManager } from './table';
import { CardsPmPayoutManager } from './cards';

export const PM_PAYOUT_MANAGER_PRESETS: Record<PmPayoutManagerPreset, ComponentType<PmPayoutManagerProps>> = {
  table: TablePmPayoutManager,
  cards: CardsPmPayoutManager,
};
