import type { ComparisonTableProps } from './core';
import { COMPARISON_TABLE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ComparisonTableProps, ComparisonTablePreset, ComparisonPlan, ComparisonFeature } from './core';
export { COMPARISON_TABLE_DEFAULTS } from './core';

export function ComparisonTable(props: ComparisonTableProps): React.ReactElement {
  const preset = props.preset ?? COMPARISON_TABLE_DEFAULTS.preset ?? 'table';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ComparisonTable.displayName = 'ComparisonTable';
