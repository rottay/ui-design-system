import type { ContextualToolbarProps } from './core';
import { CONTEXTUAL_TOOLBAR_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ContextualToolbarProps, ContextualToolbarPreset, ToolbarAction } from './core';
export { CONTEXTUAL_TOOLBAR_DEFAULTS } from './core';

export function ContextualToolbar(props: ContextualToolbarProps): React.ReactElement | null {
  const preset = props.preset ?? CONTEXTUAL_TOOLBAR_DEFAULTS.preset ?? 'floating';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ContextualToolbar.displayName = 'ContextualToolbar';
