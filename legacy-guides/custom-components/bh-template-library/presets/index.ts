/**
 * BhTemplateLibrary - All Presets
 */

export { CardsBhTemplateLibrary } from './cards';
export { TableBhTemplateLibrary } from './table';

import type { BhTemplateLibraryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTemplateLibraryProps } from '../core';
import { CardsBhTemplateLibrary } from './cards';
import { TableBhTemplateLibrary } from './table';

export const BH_TEMPLATE_LIBRARY_PRESETS: Record<BhTemplateLibraryPreset, ComponentType<BhTemplateLibraryProps>> = {
  cards: CardsBhTemplateLibrary,
  table: TableBhTemplateLibrary,
};
