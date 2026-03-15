/**
 * CryptoTransactionExplorer - Main Export
 */

import type { CryptoTransactionExplorerProps } from './core';
import { CRYPTO_TRANSACTION_EXPLORER_DEFAULTS } from './core';
import { CRYPTO_TRANSACTION_EXPLORER_PRESETS } from './presets';

export {
  type CryptoTransactionExplorerProps,
  type CryptoTransactionExplorerPreset,
  type CryptoTransaction,
  type TxStatus,
  type TxType,
  type TxStatusColors,
  CRYPTO_TRANSACTION_EXPLORER_DEFAULTS,
  getTxStatusColors,
  getTxTypeIcon,
  truncateAddress,
  formatUsd,
  formatCryptoAmount,
  formatTimeAgo,
  getTxTypeLabel,
} from './core';

export * from './presets';

export function CryptoTransactionExplorer(props: CryptoTransactionExplorerProps): React.ReactElement {
  const preset = props.preset ?? CRYPTO_TRANSACTION_EXPLORER_DEFAULTS.preset ?? 'table';
  const PresetComponent = CRYPTO_TRANSACTION_EXPLORER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

CryptoTransactionExplorer.displayName = 'CryptoTransactionExplorer';

export { TableCryptoTransactionExplorer } from './presets';
export { DetailCryptoTransactionExplorer } from './presets';
export { FeedCryptoTransactionExplorer } from './presets';
