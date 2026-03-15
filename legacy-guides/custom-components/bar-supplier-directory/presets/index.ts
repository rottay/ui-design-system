/**
 * BarSupplierDirectory - All Presets
 */

export { TableBarSupplierDirectory } from './table';
export { CardsBarSupplierDirectory } from './cards';

import type { BarSupplierDirectoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarSupplierDirectoryProps } from '../core';
import { TableBarSupplierDirectory } from './table';
import { CardsBarSupplierDirectory } from './cards';

export const BAR_SUPPLIER_DIRECTORY_PRESETS: Record<BarSupplierDirectoryPreset, ComponentType<BarSupplierDirectoryProps>> = {
  table: TableBarSupplierDirectory,
  cards: CardsBarSupplierDirectory,
};
