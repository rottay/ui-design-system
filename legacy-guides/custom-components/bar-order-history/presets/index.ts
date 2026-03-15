/**
 * BarOrderHistory - All Presets
 */

export { TableBarOrderHistory } from './table';
export { CompactBarOrderHistory } from './compact';

import type { BarOrderHistoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarOrderHistoryProps } from '../core';
import { TableBarOrderHistory } from './table';
import { CompactBarOrderHistory } from './compact';

export const BAR_ORDER_HISTORY_PRESETS: Record<BarOrderHistoryPreset, ComponentType<BarOrderHistoryProps>> = {
  table: TableBarOrderHistory,
  compact: CompactBarOrderHistory,
};
