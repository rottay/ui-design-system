/**
 * BhVoiceCatalog - All Presets
 */

export { GridBhVoiceCatalog } from './grid';
export { CompactBhVoiceCatalog } from './compact';

import type { BhVoiceCatalogPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhVoiceCatalogProps } from '../core';
import { GridBhVoiceCatalog } from './grid';
import { CompactBhVoiceCatalog } from './compact';

export const BH_VOICE_CATALOG_PRESETS: Record<BhVoiceCatalogPreset, ComponentType<BhVoiceCatalogProps>> = {
  grid: GridBhVoiceCatalog,
  compact: CompactBhVoiceCatalog,
};
