import type { CryptoTransactionExplorerPreset, CryptoTransactionExplorerProps } from '../core';
import type { ComponentType } from 'react';
import { TableCryptoTransactionExplorer } from './table';
import { DetailCryptoTransactionExplorer } from './detail';
import { FeedCryptoTransactionExplorer } from './feed';

export { TableCryptoTransactionExplorer } from './table';
export { DetailCryptoTransactionExplorer } from './detail';
export { FeedCryptoTransactionExplorer } from './feed';

export const CRYPTO_TRANSACTION_EXPLORER_PRESETS: Record<CryptoTransactionExplorerPreset, ComponentType<CryptoTransactionExplorerProps>> = {
  table: TableCryptoTransactionExplorer,
  detail: DetailCryptoTransactionExplorer,
  feed: FeedCryptoTransactionExplorer,
};
