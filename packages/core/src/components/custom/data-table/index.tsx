/**
 * DataTable - Main Export
 */

// import React from 'react';
import type { DataTableProps } from './core';
import { DATA_TABLE_DEFAULTS } from './core';
import { DATA_TABLE_PRESETS } from './presets';

export { type DataTableProps, type DataTablePreset, type DataTableColumn, DATA_TABLE_DEFAULTS } from './core';
export * from './presets';

export function DataTable<T = Record<string, unknown>>(props: DataTableProps<T>): React.ReactElement {
  const preset = props.preset ?? DATA_TABLE_DEFAULTS.preset ?? 'simple';
  const PresetComponent = DATA_TABLE_PRESETS[preset];
  return <PresetComponent {...(props as DataTableProps)} />;
}

DataTable.displayName = 'DataTable';
