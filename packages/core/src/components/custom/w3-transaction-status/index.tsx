/**
 * W3TransactionStatus - Main Export
 * Track pending transaction status with confirmation progress and ETA
 */

import type { W3TransactionStatusProps } from './core';
import { W3_TRANSACTION_STATUS_DEFAULTS } from './core';
import { W3_TRANSACTION_STATUS_PRESETS } from './presets';

export { type W3TransactionStatusProps, type W3TransactionStatusPreset, W3_TRANSACTION_STATUS_DEFAULTS } from './core';
export * from './presets';

export function W3TransactionStatus(props: W3TransactionStatusProps): React.ReactElement {
  const preset = props.preset ?? W3_TRANSACTION_STATUS_DEFAULTS.preset ?? 'tracker';
  const PresetComponent = W3_TRANSACTION_STATUS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TransactionStatus.displayName = 'W3TransactionStatus';
