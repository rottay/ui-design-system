/**
 * W3TransactionDetail - Main Export
 * View transaction details including gas, confirmations, events, and trace data
 */

import type { W3TransactionDetailProps } from './core';
import { W3_TRANSACTION_DETAIL_DEFAULTS } from './core';
import { W3_TRANSACTION_DETAIL_PRESETS } from './presets';

export { type W3TransactionDetailProps, type W3TransactionDetailPreset, W3_TRANSACTION_DETAIL_DEFAULTS } from './core';
export * from './presets';

export function W3TransactionDetail(props: W3TransactionDetailProps): React.ReactElement {
  const preset = props.preset ?? W3_TRANSACTION_DETAIL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = W3_TRANSACTION_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TransactionDetail.displayName = 'W3TransactionDetail';
