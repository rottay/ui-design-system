import type { UserLifecyclePanelProps } from './core';
import { USER_LIFECYCLE_PANEL_DEFAULTS } from './core';
import { USER_LIFECYCLE_PANEL_PRESETS } from './presets';

export { type UserLifecyclePanelProps, type UserLifecyclePanelPreset, type UserLifecycleState, type LifecycleTransition, type UserLifecycleData, USER_LIFECYCLE_PANEL_DEFAULTS } from './core';
export { getStateColors, getStateIcon, getActionLabel } from './core';
export * from './presets';

export function UserLifecyclePanel(props: UserLifecyclePanelProps): React.ReactElement {
  const preset = props.preset ?? USER_LIFECYCLE_PANEL_DEFAULTS.preset ?? 'flow';
  const PresetComponent = USER_LIFECYCLE_PANEL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

UserLifecyclePanel.displayName = 'UserLifecyclePanel';
