/**
 * BarPurchaseOrders - All Presets
 */

export { TableBarPurchaseOrders } from './table';
export { KanbanBarPurchaseOrders } from './kanban';

import type { BarPurchaseOrdersPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarPurchaseOrdersProps } from '../core';
import { TableBarPurchaseOrders } from './table';
import { KanbanBarPurchaseOrders } from './kanban';

export const BAR_PURCHASE_ORDERS_PRESETS: Record<BarPurchaseOrdersPreset, ComponentType<BarPurchaseOrdersProps>> = {
  table: TableBarPurchaseOrders,
  kanban: KanbanBarPurchaseOrders,
};
