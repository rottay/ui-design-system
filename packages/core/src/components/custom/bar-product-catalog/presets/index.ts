/**
 * BarProductCatalog - All Presets
 */

export { GridBarProductCatalog } from './grid';
export { TableBarProductCatalog } from './table';

import type { BarProductCatalogPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarProductCatalogProps } from '../core';
import { GridBarProductCatalog } from './grid';
import { TableBarProductCatalog } from './table';

export const BAR_PRODUCT_CATALOG_PRESETS: Record<BarProductCatalogPreset, ComponentType<BarProductCatalogProps>> = {
  grid: GridBarProductCatalog,
  table: TableBarProductCatalog,
};
