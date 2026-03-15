/**
 * EvSupplierHub - All Presets
 */

export { DirectoryEvSupplierHub } from './directory';
export { OrdersEvSupplierHub } from './orders';

import type { EvSupplierHubPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvSupplierHubProps } from '../core';
import { DirectoryEvSupplierHub } from './directory';
import { OrdersEvSupplierHub } from './orders';

export const EV_SUPPLIER_HUB_PRESETS: Record<EvSupplierHubPreset, ComponentType<EvSupplierHubProps>> = {
  directory: DirectoryEvSupplierHub,
  orders: OrdersEvSupplierHub,
};
