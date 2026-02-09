/**
 * EvPurchaseOrders - Main Export
 * Purchase order workflow
 * Automatically selects preset based on props
 */

import type { EvPurchaseOrdersProps } from './core';
import { EV_PURCHASE_ORDERS_DEFAULTS } from './core';
import { EV_PURCHASE_ORDERS_PRESETS } from './presets';

export {
  type EvPurchaseOrdersProps,
  type EvPurchaseOrdersPreset,
  type PurchaseOrder as EvPurchaseOrdersPurchaseOrder,
  EV_PURCHASE_ORDERS_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvPurchaseOrders component
 * Renders the appropriate preset based on the preset prop
 */
export function EvPurchaseOrders(props: EvPurchaseOrdersProps): React.ReactElement {
  const preset = props.preset ?? EV_PURCHASE_ORDERS_DEFAULTS.preset ?? 'list';
  const PresetComponent = EV_PURCHASE_ORDERS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvPurchaseOrders.displayName = 'EvPurchaseOrders';

export { ListEvPurchaseOrders, DetailEvPurchaseOrders } from './presets';
