/**
 * W3TransactionStatus - All Presets
 */

export { TrackerW3TransactionStatus } from './tracker';
export { CompactW3TransactionStatus } from './compact';

import type { W3TransactionStatusPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TransactionStatusProps } from '../core';
import { TrackerW3TransactionStatus } from './tracker';
import { CompactW3TransactionStatus } from './compact';

export const W3_TRANSACTION_STATUS_PRESETS: Record<W3TransactionStatusPreset, ComponentType<W3TransactionStatusProps>> = {
  tracker: TrackerW3TransactionStatus,
  compact: CompactW3TransactionStatus,
};
