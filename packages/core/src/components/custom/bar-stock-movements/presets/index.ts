/**
 * BarStockMovements - All Presets
 */

export { TimelineBarStockMovements } from './timeline';
export { TableBarStockMovements } from './table';

import type { BarStockMovementsPreset } from '../core';
import type { ComponentType } from 'react';
import type { BarStockMovementsProps } from '../core';
import { TimelineBarStockMovements } from './timeline';
import { TableBarStockMovements } from './table';

export const BAR_STOCK_MOVEMENTS_PRESETS: Record<BarStockMovementsPreset, ComponentType<BarStockMovementsProps>> = {
  timeline: TimelineBarStockMovements,
  table: TableBarStockMovements,
};
