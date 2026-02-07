import type { KpiGridProps } from './core';
import { KPI_GRID_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { KpiGridProps, KpiGridPreset, KpiItem } from './core';
export { KPI_GRID_DEFAULTS } from './core';

export function KpiGrid(props: KpiGridProps): React.ReactElement {
  const preset = props.preset ?? KPI_GRID_DEFAULTS.preset ?? 'cards';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

KpiGrid.displayName = 'KpiGrid';
