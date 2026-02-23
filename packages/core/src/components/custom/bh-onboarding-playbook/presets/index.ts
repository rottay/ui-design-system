/**
 * BhOnboardingPlaybook - All Presets
 */

export { GuidedBhOnboardingPlaybook } from './guided';
export { ProgressBhOnboardingPlaybook } from './progress';

import type { BhOnboardingPlaybookPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhOnboardingPlaybookProps } from '../core';
import { GuidedBhOnboardingPlaybook } from './guided';
import { ProgressBhOnboardingPlaybook } from './progress';

export const BH_ONBOARDING_PLAYBOOK_PRESETS: Record<BhOnboardingPlaybookPreset, ComponentType<BhOnboardingPlaybookProps>> = {
  guided: GuidedBhOnboardingPlaybook,
  progress: ProgressBhOnboardingPlaybook,
};
