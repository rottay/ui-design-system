/**
 * EvMerchStore - Main Export
 * Merchandise store with product grid, variants, and inventory management
 */

import type { EvMerchStoreProps } from './core';
import { EV_MERCH_STORE_DEFAULTS } from './core';
import { EV_MERCH_STORE_PRESETS } from './presets';

export {
  type EvMerchStoreProps,
  type EvMerchStorePreset,
  type MerchProduct as EvMerchStoreMerchProduct,
  type MerchVariant as EvMerchStoreMerchVariant,
  EV_MERCH_STORE_DEFAULTS,
} from './core';
export * from './presets';

export function EvMerchStore(props: EvMerchStoreProps): React.ReactElement {
  const preset = props.preset ?? EV_MERCH_STORE_DEFAULTS.preset ?? 'storefront';
  const PresetComponent = EV_MERCH_STORE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvMerchStore.displayName = 'EvMerchStore';

export { StorefrontEvMerchStore, InventoryEvMerchStore } from './presets';
