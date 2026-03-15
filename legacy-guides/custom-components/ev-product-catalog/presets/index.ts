/**
 * EvProductCatalog - All Presets
 */

export { GridEvProductCatalog } from './grid';
export { EditorEvProductCatalog } from './editor';

import type { EvProductCatalogPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvProductCatalogProps } from '../core';
import { GridEvProductCatalog } from './grid';
import { EditorEvProductCatalog } from './editor';

export const EV_PRODUCT_CATALOG_PRESETS: Record<EvProductCatalogPreset, ComponentType<EvProductCatalogProps>> = {
  grid: GridEvProductCatalog,
  editor: EditorEvProductCatalog,
};
