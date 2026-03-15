/**
 * BarGoodsReceipt - All Presets
 */

export { FormBarGoodsReceipt } from './form';
export { CompactBarGoodsReceipt } from './compact';

import type { BarGoodsReceiptPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarGoodsReceiptProps } from '../core';
import { FormBarGoodsReceipt } from './form';
import { CompactBarGoodsReceipt } from './compact';

export const BAR_GOODS_RECEIPT_PRESETS: Record<BarGoodsReceiptPreset, ComponentType<BarGoodsReceiptProps>> = {
  form: FormBarGoodsReceipt,
  compact: CompactBarGoodsReceipt,
};
