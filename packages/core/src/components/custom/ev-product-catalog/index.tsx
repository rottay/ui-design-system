/**
 * EvProductCatalog - Main Export
 * Product catalog management
 * Automatically selects preset based on props
 */

import type { EvProductCatalogProps } from './core';
import { EV_PRODUCT_CATALOG_DEFAULTS } from './core';
import { EV_PRODUCT_CATALOG_PRESETS } from './presets';

export {
  type EvProductCatalogProps,
  type EvProductCatalogPreset,
  type CatalogProduct as EvProductCatalogCatalogProduct,
  type ProductCategory as EvProductCatalogProductCategory,
  type ComboItem as EvProductCatalogComboItem,
  EV_PRODUCT_CATALOG_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvProductCatalog component
 * Renders the appropriate preset based on the preset prop
 */
export function EvProductCatalog(props: EvProductCatalogProps): React.ReactElement {
  const preset = props.preset ?? EV_PRODUCT_CATALOG_DEFAULTS.preset ?? 'grid';
  const PresetComponent = EV_PRODUCT_CATALOG_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvProductCatalog.displayName = 'EvProductCatalog';

export { GridEvProductCatalog, EditorEvProductCatalog } from './presets';
