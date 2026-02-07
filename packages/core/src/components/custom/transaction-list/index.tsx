/**
 * TransactionList - Main Export
 */

import type { TransactionListProps } from './core';
import { TRANSACTION_LIST_DEFAULTS } from './core';
import { TRANSACTION_LIST_PRESETS } from './presets';

export {
  type TransactionListProps,
  type TransactionListPreset,
  type Transaction,
  type TransactionStatus,
  type TransactionSummary,
  type TransactionFilter,
  type PaymentMethod,
  type PaymentMethodType,
  type TransactionAction,
  type TransactionRowAction,
  TRANSACTION_LIST_DEFAULTS,
} from './core';
export * from './presets';

export function TransactionList(props: TransactionListProps): React.ReactElement {
  const preset = props.preset ?? TRANSACTION_LIST_DEFAULTS.preset ?? 'standard';
  const PresetComponent = TRANSACTION_LIST_PRESETS[preset];
  return <PresetComponent {...props} />;
}

TransactionList.displayName = 'TransactionList';

export { StandardTransactionList, DetailedTransactionList } from './presets';
