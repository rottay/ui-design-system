/**
 * PmRefundManager - All Presets
 */

export { TablePmRefundManager } from './table';
export { CardsPmRefundManager } from './cards';

import type { PmRefundManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmRefundManagerProps } from '../core';
import { TablePmRefundManager } from './table';
import { CardsPmRefundManager } from './cards';

export const PM_REFUND_MANAGER_PRESETS: Record<PmRefundManagerPreset, ComponentType<PmRefundManagerProps>> = {
  table: TablePmRefundManager,
  cards: CardsPmRefundManager,
};
