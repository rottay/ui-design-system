/**
 * BhTokenTransfer - All Presets
 */

export { TimelineBhTokenTransfer } from './timeline';
export { CompactBhTokenTransfer } from './compact';

import type { BhTokenTransferPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTokenTransferProps } from '../core';
import { TimelineBhTokenTransfer } from './timeline';
import { CompactBhTokenTransfer } from './compact';

export const BH_TOKEN_TRANSFER_PRESETS: Record<BhTokenTransferPreset, ComponentType<BhTokenTransferProps>> = {
  timeline: TimelineBhTokenTransfer,
  compact: CompactBhTokenTransfer,
};
