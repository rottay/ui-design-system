/**
 * BarGoodsReceipt - Main Export
 * Receiving dock form for incoming goods
 */

import type { BarGoodsReceiptProps } from './core';
import { BAR_GOODS_RECEIPT_DEFAULTS } from './core';
import { BAR_GOODS_RECEIPT_PRESETS } from './presets';

export {
  type BarGoodsReceiptProps,
  type BarGoodsReceiptPreset,
  type GoodsReceipt as BarGoodsReceiptData,
  type ReceiptItem as BarGoodsReceiptItem,
  BAR_GOODS_RECEIPT_DEFAULTS,
} from './core';
export * from './presets';

export function BarGoodsReceipt(props: BarGoodsReceiptProps): React.ReactElement {
  const preset = props.preset ?? BAR_GOODS_RECEIPT_DEFAULTS.preset ?? 'form';
  const PresetComponent = BAR_GOODS_RECEIPT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarGoodsReceipt.displayName = 'BarGoodsReceipt';

export { FormBarGoodsReceipt, CompactBarGoodsReceipt } from './presets';
