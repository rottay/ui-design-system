import type { FeatureFlagPanelProps } from './core';
import { FEATURE_FLAG_PANEL_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { FeatureFlagPanelProps, FeatureFlagPanelPreset, FeatureFlag } from './core';
export { FEATURE_FLAG_PANEL_DEFAULTS } from './core';

export function FeatureFlagPanel(props: FeatureFlagPanelProps): React.ReactElement {
  const preset = props.preset ?? FEATURE_FLAG_PANEL_DEFAULTS.preset ?? 'list';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

FeatureFlagPanel.displayName = 'FeatureFlagPanel';
