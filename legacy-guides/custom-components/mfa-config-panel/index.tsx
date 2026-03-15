/**
 * MfaConfigPanel - Main Export
 * Automatically selects preset based on props
 */

import type { MfaConfigPanelProps } from './core';
import { MFA_CONFIG_PANEL_DEFAULTS } from './core';
import { MFA_CONFIG_PANEL_PRESETS } from './presets';

export { type MfaConfigPanelProps, type MfaConfigPanelPreset, type MfaMethodConfig, type MfaMethod, type MfaMethodStatus, type MfaPolicyRule, MFA_CONFIG_PANEL_DEFAULTS } from './core';
export { getMethodIcon, getMethodStatusColors } from './core';
export * from './presets';

/**
 * MfaConfigPanel component
 * Renders the appropriate preset based on the preset prop
 */
export function MfaConfigPanel(props: MfaConfigPanelProps): React.ReactElement {
  const preset = props.preset ?? MFA_CONFIG_PANEL_DEFAULTS.preset ?? 'manage';
  const PresetComponent = MFA_CONFIG_PANEL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

MfaConfigPanel.displayName = 'MfaConfigPanel';

export { SetupMfaConfigPanel, ManageMfaConfigPanel, PolicyMfaConfigPanel } from './presets';
