/**
 * Table - Engine Router
 *
 * A data table component that displays tabular data with support for
 * sorting, filtering, pagination, row selection, and expandable rows.
 * Renders using the configured engine (Titan/Hermes/Apollo).
 */

import React from 'react';
import { createEngineComponent } from '../../../../system/engines/factory';
import type { TableProps } from './types';

// Export types
export type {
  TableProps,
  ColumnType,
  TablePaginationConfig,
  TableRowSelection,
  ExpandableConfig,
  TableSize,
  TableLayout,
  SortOrder,
  FilterMode,
} from './types';

export { TABLE_DEFAULTS } from './types';

// Create engine-aware Table component
// Note: Type assertions needed due to generic Table<T> component signature
export const Table = createEngineComponent<TableProps>('Table', {
  titan: () => import('./engines/titan') as Promise<{ default: React.ComponentType<TableProps> }>,
  hermes: () => import('./engines/hermes') as Promise<{ default: React.ComponentType<TableProps> }>,
  apollo: () => import('./engines/apollo') as Promise<{ default: React.ComponentType<TableProps> }>,
});
