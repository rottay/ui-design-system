/**
 * BarPricingMatrix - All Presets
 */

export { GridBarPricingMatrix } from './grid';
export { TableBarPricingMatrix } from './table';

import type { BarPricingMatrixPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarPricingMatrixProps } from '../core';
import { GridBarPricingMatrix } from './grid';
import { TableBarPricingMatrix } from './table';

export const BAR_PRICING_MATRIX_PRESETS: Record<BarPricingMatrixPreset, ComponentType<BarPricingMatrixProps>> = {
  grid: GridBarPricingMatrix,
  table: TableBarPricingMatrix,
};
