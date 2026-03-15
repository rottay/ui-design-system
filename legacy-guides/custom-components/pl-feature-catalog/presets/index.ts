/**
 * PlFeatureCatalog - All Presets
 */

export { TablePlFeatureCatalog } from './table';
export { CardsPlFeatureCatalog } from './cards';

import type { PlFeatureCatalogPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlFeatureCatalogProps } from '../core';
import { TablePlFeatureCatalog } from './table';
import { CardsPlFeatureCatalog } from './cards';

export const PL_FEATURE_CATALOG_PRESETS: Record<PlFeatureCatalogPreset, ComponentType<PlFeatureCatalogProps>> = {
  table: TablePlFeatureCatalog,
  cards: CardsPlFeatureCatalog,
};
