/**
 * BarPurchaseOrders - Main Export
 * PO management with create/approve/receive workflow
 */

import type { BarPurchaseOrdersProps } from './core';
import { BAR_PURCHASE_ORDERS_DEFAULTS } from './core';
import { BAR_PURCHASE_ORDERS_PRESETS } from './presets';

export {
  type BarPurchaseOrdersProps,
  type BarPurchaseOrdersPreset,
  type PurchaseOrder as BarPurchaseOrder,
  type PurchaseOrderItem as BarPurchaseOrderItem,
  type POStatus as BarPOStatus,
  BAR_PURCHASE_ORDERS_DEFAULTS,
} from './core';
export * from './presets';

export function BarPurchaseOrders(props: BarPurchaseOrdersProps): React.ReactElement {
  const preset = props.preset ?? BAR_PURCHASE_ORDERS_DEFAULTS.preset ?? 'table';
  const PresetComponent = BAR_PURCHASE_ORDERS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarPurchaseOrders.displayName = 'BarPurchaseOrders';

export { TableBarPurchaseOrders, KanbanBarPurchaseOrders } from './presets';
