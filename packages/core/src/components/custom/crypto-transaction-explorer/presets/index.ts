import type { CryptoTransactionExplorerPreset } from '../core';
import { TableCryptoTransactionExplorer } from './table';
import { DetailCryptoTransactionExplorer } from './detail';
import { FeedCryptoTransactionExplorer } from './feed';

export { TableCryptoTransactionExplorer } from './table';
export { DetailCryptoTransactionExplorer } from './detail';
export { FeedCryptoTransactionExplorer } from './feed';

export const CRYPTO_TRANSACTION_EXPLORER_PRESETS: Record<CryptoTransactionExplorerPreset, React.ComponentType<any>> = {
  table: TableCryptoTransactionExplorer,
  detail: DetailCryptoTransactionExplorer,
  feed: FeedCryptoTransactionExplorer,
};
