/**
 * DataGrid - Main Export
 */

import type { DataGridProps } from './core';
import { DATA_GRID_DEFAULTS } from './core';
import { DATA_GRID_PRESETS } from './presets';

export {
  type DataGridProps,
  type DataGridPreset,
  type DataGridColumn,
  type DataGridColumnType,
  type BadgeConfig,
  DATA_GRID_DEFAULTS,
} from './core';
export * from './presets';

export function DataGrid(props: DataGridProps): React.ReactElement {
  const preset = props.preset ?? DATA_GRID_DEFAULTS.preset ?? 'basic';
  const PresetComponent = DATA_GRID_PRESETS[preset];
  return <PresetComponent {...props} />;
}

DataGrid.displayName = 'DataGrid';
export { BasicDataGrid, EnrichedDataGrid } from './presets';
