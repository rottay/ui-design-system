/**
 * DataGrid Presets
 */

export { BasicDataGrid } from './basic';
export { EnrichedDataGrid } from './enriched';
export type { EnrichedDataGridProps } from './enriched';

import type { DataGridPreset } from '../core';
import type { ComponentType } from 'react';
import type { DataGridProps } from '../core';
import { BasicDataGrid } from './basic';
import { EnrichedDataGrid } from './enriched';

export const DATA_GRID_PRESETS: Record<DataGridPreset, ComponentType<DataGridProps>> = {
  basic: BasicDataGrid as ComponentType<DataGridProps>,
  enriched: EnrichedDataGrid as ComponentType<DataGridProps>,
};
