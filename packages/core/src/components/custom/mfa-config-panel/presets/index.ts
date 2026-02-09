/**
 * MfaConfigPanel - All Presets
 */

import type { MfaConfigPanelPreset } from '../core';
import { SetupMfaConfigPanel } from './setup';
import { ManageMfaConfigPanel } from './manage';
import { PolicyMfaConfigPanel } from './policy';

export { SetupMfaConfigPanel } from './setup';
export { ManageMfaConfigPanel } from './manage';
export { PolicyMfaConfigPanel } from './policy';

export const MFA_CONFIG_PANEL_PRESETS: Record<MfaConfigPanelPreset, React.ComponentType<any>> = {
  setup: SetupMfaConfigPanel,
  manage: ManageMfaConfigPanel,
  policy: PolicyMfaConfigPanel,
};
