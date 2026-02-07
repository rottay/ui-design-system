import type { EmptyStateProps } from './core';
import { EMPTY_STATE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { EmptyStateProps, EmptyStatePreset, EmptyStateAction } from './core';
export { EMPTY_STATE_DEFAULTS } from './core';

export function EmptyState(props: EmptyStateProps) {
  const mergedProps = { ...EMPTY_STATE_DEFAULTS, ...props };
  const preset = mergedProps.preset || 'standard';
  const PresetComponent = PRESETS[preset];

  return <PresetComponent {...mergedProps} />;
}
