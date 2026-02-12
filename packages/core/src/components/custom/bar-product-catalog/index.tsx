/**
 * BarProductCatalog - Main Export
 * Product management CRUD with categories, pricing, availability
 */

import type { BarProductCatalogProps } from './core';
import { BAR_PRODUCT_CATALOG_DEFAULTS } from './core';
import { BAR_PRODUCT_CATALOG_PRESETS } from './presets';

export {
  type BarProductCatalogProps,
  type BarProductCatalogPreset,
  type CatalogProduct as BarProductCatalogProduct,
  type ProductCategory as BarProductCatalogCategory,
  BAR_PRODUCT_CATALOG_DEFAULTS,
} from './core';
export * from './presets';

export function BarProductCatalog(props: BarProductCatalogProps): React.ReactElement {
  const preset = props.preset ?? BAR_PRODUCT_CATALOG_DEFAULTS.preset ?? 'grid';
  const PresetComponent = BAR_PRODUCT_CATALOG_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarProductCatalog.displayName = 'BarProductCatalog';

export { GridBarProductCatalog, TableBarProductCatalog } from './presets';
