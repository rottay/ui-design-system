/**
 * PmPaymentManager - All Presets
 */

export { TablePmPaymentManager } from './table';
export { CardsPmPaymentManager } from './cards';

import type { PmPaymentManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmPaymentManagerProps } from '../core';
import { TablePmPaymentManager } from './table';
import { CardsPmPaymentManager } from './cards';

export const PM_PAYMENT_MANAGER_PRESETS: Record<PmPaymentManagerPreset, ComponentType<PmPaymentManagerProps>> = {
  table: TablePmPaymentManager,
  cards: CardsPmPaymentManager,
};
