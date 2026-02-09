/**
 * W3TokenHolders - All Presets
 */

export { TableW3TokenHolders } from './table';
export { ChartW3TokenHolders } from './chart';

import type { W3TokenHoldersPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3TokenHoldersProps } from '../core';
import { TableW3TokenHolders } from './table';
import { ChartW3TokenHolders } from './chart';

export const W3_TOKEN_HOLDERS_PRESETS: Record<W3TokenHoldersPreset, ComponentType<W3TokenHoldersProps>> = {
  table: TableW3TokenHolders,
  chart: ChartW3TokenHolders,
};
