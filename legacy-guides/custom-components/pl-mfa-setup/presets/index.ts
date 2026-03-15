/**
 * PlMfaSetup - All Presets
 */

export { WizardPlMfaSetup } from './wizard';
export { CompactPlMfaSetup } from './compact';

import type { PlMfaSetupPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlMfaSetupProps } from '../core';
import { WizardPlMfaSetup } from './wizard';
import { CompactPlMfaSetup } from './compact';

export const PL_MFA_SETUP_PRESETS: Record<PlMfaSetupPreset, ComponentType<PlMfaSetupProps>> = {
  wizard: WizardPlMfaSetup,
  compact: CompactPlMfaSetup,
};
