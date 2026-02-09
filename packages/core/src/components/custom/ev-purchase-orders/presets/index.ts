/**
 * EvPurchaseOrders - All Presets
 */

export { ListEvPurchaseOrders } from './list';
export { DetailEvPurchaseOrders } from './detail';

import type { EvPurchaseOrdersPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvPurchaseOrdersProps } from '../core';
import { ListEvPurchaseOrders } from './list';
import { DetailEvPurchaseOrders } from './detail';

export const EV_PURCHASE_ORDERS_PRESETS: Record<EvPurchaseOrdersPreset, ComponentType<EvPurchaseOrdersProps>> = {
  list: ListEvPurchaseOrders,
  detail: DetailEvPurchaseOrders,
};
