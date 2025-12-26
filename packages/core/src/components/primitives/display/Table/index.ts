/**
 * Table - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TableProps } from './types';

export {
  type TableProps,
  type ColumnType,
  type TablePaginationConfig,
  type TableRowSelection,
  type ExpandableConfig,
  type TableSize,
  type TableLayout,
  type SortOrder,
  type FilterMode,
  TABLE_DEFAULTS,
} from './types';

export const Table = createEngineComponent<TableProps>('Table', {
  titan: () => import('./engines/titan') as any,
  hermes: () => import('./engines/hermes') as any,
  apollo: () => import('./engines/apollo') as any,
});
