/**
 * MfaConfigPanel - All Presets
 */

import type { MfaConfigPanelPreset, MfaConfigPanelProps } from '../core';
import type { ComponentType } from 'react';
import { SetupMfaConfigPanel } from './setup';
import { ManageMfaConfigPanel } from './manage';
import { PolicyMfaConfigPanel } from './policy';

export { SetupMfaConfigPanel } from './setup';
export { ManageMfaConfigPanel } from './manage';
export { PolicyMfaConfigPanel } from './policy';

export const MFA_CONFIG_PANEL_PRESETS: Record<MfaConfigPanelPreset, ComponentType<MfaConfigPanelProps>> = {
  setup: SetupMfaConfigPanel,
  manage: ManageMfaConfigPanel,
  policy: PolicyMfaConfigPanel,
};
