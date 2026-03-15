import type { DataSummaryBarProps } from './core';
import { DATA_SUMMARY_BAR_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { DataSummaryBarProps, DataSummaryBarPreset, SummaryMetric } from './core';
export { DATA_SUMMARY_BAR_DEFAULTS } from './core';

export function DataSummaryBar(props: DataSummaryBarProps): React.ReactElement {
  const preset = props.preset ?? DATA_SUMMARY_BAR_DEFAULTS.preset ?? 'pills';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

DataSummaryBar.displayName = 'DataSummaryBar';
