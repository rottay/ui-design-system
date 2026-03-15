/**
 * W3TransactionHistory - All Presets
 */

export { TableW3TransactionHistory } from './table';
export { TimelineW3TransactionHistory } from './timeline';

import type { W3TransactionHistoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TransactionHistoryProps } from '../core';
import { TableW3TransactionHistory } from './table';
import { TimelineW3TransactionHistory } from './timeline';

export const W3_TRANSACTION_HISTORY_PRESETS: Record<W3TransactionHistoryPreset, ComponentType<W3TransactionHistoryProps>> = {
  table: TableW3TransactionHistory,
  timeline: TimelineW3TransactionHistory,
};
