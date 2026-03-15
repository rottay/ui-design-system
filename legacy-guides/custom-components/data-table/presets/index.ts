/**
 * DataTable Presets
 */

export { SimpleDataTable } from './simple';
export { SearchableDataTable } from './searchable';
export { SelectableDataTable } from './selectable';
export { FullDataTable } from './full';
export { ExpandableDataTable, type ExpandableDataTableProps } from './expandable';
export {
  ProfessionalDataTable,
  type ProfessionalDataTableProps,
  type FilterOption,
  type RowAction,
  type BulkAction,
} from './professional';

import type { DataTablePreset } from '../core';
import type { ComponentType } from 'react';
import type { DataTableProps } from '../core';
import { SimpleDataTable } from './simple';
import { SearchableDataTable } from './searchable';
import { SelectableDataTable } from './selectable';
import { FullDataTable } from './full';
import { ExpandableDataTable } from './expandable';
import { ProfessionalDataTable } from './professional';

// Type-safe preset mapping
// Using explicit typing to handle the intersection type from createPreset
export const DATA_TABLE_PRESETS: Record<DataTablePreset, ComponentType<DataTableProps>> = {
  simple: SimpleDataTable as ComponentType<DataTableProps>,
  searchable: SearchableDataTable as ComponentType<DataTableProps>,
  selectable: SelectableDataTable as ComponentType<DataTableProps>,
  full: FullDataTable as ComponentType<DataTableProps>,
  expandable: ExpandableDataTable as ComponentType<DataTableProps>,
  professional: ProfessionalDataTable as ComponentType<DataTableProps>,
};
