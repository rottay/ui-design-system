/**
 * EvMerchStore - All Presets
 */

export { StorefrontEvMerchStore } from './storefront';
export { InventoryEvMerchStore } from './inventory';

import type { EvMerchStorePreset } from '../core';
import type { ComponentType } from 'react';
import type { EvMerchStoreProps } from '../core';
import { StorefrontEvMerchStore } from './storefront';
import { InventoryEvMerchStore } from './inventory';

export const EV_MERCH_STORE_PRESETS: Record<EvMerchStorePreset, ComponentType<EvMerchStoreProps>> = {
  storefront: StorefrontEvMerchStore,
  inventory: InventoryEvMerchStore,
};
