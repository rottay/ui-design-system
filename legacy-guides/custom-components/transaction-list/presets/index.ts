/**
 * TransactionList Presets
 */

export { StandardTransactionList } from './standard';
export { DetailedTransactionList } from './detailed';

import type { TransactionListPreset } from '../core';
import type { ComponentType } from 'react';
import type { TransactionListProps } from '../core';
import { StandardTransactionList } from './standard';
import { DetailedTransactionList } from './detailed';

export const TRANSACTION_LIST_PRESETS: Record<TransactionListPreset, ComponentType<TransactionListProps>> = {
  standard: StandardTransactionList,
  detailed: DetailedTransactionList,
};
