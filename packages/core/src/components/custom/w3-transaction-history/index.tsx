/**
 * W3TransactionHistory - Main Export
 * Browse blockchain transaction history with filtering, status, and explorer links
 */

import type { W3TransactionHistoryProps } from './core';
import { W3_TRANSACTION_HISTORY_DEFAULTS } from './core';
import { W3_TRANSACTION_HISTORY_PRESETS } from './presets';

export { type W3TransactionHistoryProps, type W3TransactionHistoryPreset, W3_TRANSACTION_HISTORY_DEFAULTS } from './core';
export * from './presets';

export function W3TransactionHistory(props: W3TransactionHistoryProps): React.ReactElement {
  const preset = props.preset ?? W3_TRANSACTION_HISTORY_DEFAULTS.preset ?? 'table';
  const PresetComponent = W3_TRANSACTION_HISTORY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TransactionHistory.displayName = 'W3TransactionHistory';
