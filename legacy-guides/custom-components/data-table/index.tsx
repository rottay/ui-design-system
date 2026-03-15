/**
 * DataTable - Main Export
 */

// import React from 'react';
import type { DataTableProps, DataTablePreset } from './core';
import { DATA_TABLE_DEFAULTS } from './core';
import { DATA_TABLE_PRESETS } from './presets';
import type { ProfessionalDataTableProps } from './presets/professional';
import type { ExpandableDataTableProps } from './presets/expandable';

export { type DataTableProps, type DataTablePreset, type DataTableColumn, DATA_TABLE_DEFAULTS } from './core';
export * from './presets';
export type { ExpandableDataTableProps } from './presets/expandable';
export type { ProfessionalDataTableProps, FilterOption, RowAction, BulkAction } from './presets/professional';

// Union type for all preset props - allows using professional or expandable props when that preset is selected
type DataTableUnionProps<T> = DataTableProps<T> & Partial<ProfessionalDataTableProps<T>> & Partial<ExpandableDataTableProps<T>>;

export function DataTable<T = Record<string, unknown>>(props: DataTableUnionProps<T>): React.ReactElement {
  const preset = (props.preset ?? DATA_TABLE_DEFAULTS.preset ?? 'simple') as DataTablePreset;
  const PresetComponent = DATA_TABLE_PRESETS[preset];
  return <PresetComponent {...(props as DataTableProps)} />;
}

DataTable.displayName = 'DataTable';
