/**
 * W3TransactionDetail - All Presets
 */

export { PanelW3TransactionDetail } from './panel';
export { CardW3TransactionDetail } from './card';

import type { W3TransactionDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TransactionDetailProps } from '../core';
import { PanelW3TransactionDetail } from './panel';
import { CardW3TransactionDetail } from './card';

export const W3_TRANSACTION_DETAIL_PRESETS: Record<W3TransactionDetailPreset, ComponentType<W3TransactionDetailProps>> = {
  panel: PanelW3TransactionDetail,
  card: CardW3TransactionDetail,
};
