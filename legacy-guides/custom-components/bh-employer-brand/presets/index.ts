/**
 * BhEmployerBrand - All Presets
 */

import type { BhEmployerBrandPreset, BhEmployerBrandProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhEmployerBrand } from './compact';

export { CompactBhEmployerBrand } from './compact';

export const BH_EMPLOYER_BRAND_PRESETS: Record<BhEmployerBrandPreset, ComponentType<BhEmployerBrandProps>> = {
  compact: CompactBhEmployerBrand,
};
