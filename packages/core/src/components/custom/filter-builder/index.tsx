import type { FilterBuilderProps } from './core';
import { FILTER_BUILDER_DEFAULTS } from './core';
import { FILTER_BUILDER_PRESETS } from './presets';

export {
  type FilterBuilderProps,
  type FilterBuilderPreset,
  type FilterFieldConfig,
  type FilterFieldType,
  type FilterFieldOption,
  type QuickPreset as FilterQuickPreset,
  type SavedFilter,
  FILTER_BUILDER_DEFAULTS,
} from './core';
export * from './presets';

export function FilterBuilder(props: FilterBuilderProps): React.ReactElement {
  const preset = props.preset ?? FILTER_BUILDER_DEFAULTS.preset ?? 'panel';
  const PresetComponent = FILTER_BUILDER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

FilterBuilder.displayName = 'FilterBuilder';
