/**
 * BhOnboardingFlow - All Presets
 */

import type { BhOnboardingFlowPreset, BhOnboardingFlowProps } from '../core';
import type { ComponentType } from 'react';
import { AdminSetupBhOnboardingFlow } from './admin-setup';
import { RecruiterWelcomeBhOnboardingFlow } from './recruiter-welcome';

export { AdminSetupBhOnboardingFlow } from './admin-setup';
export { RecruiterWelcomeBhOnboardingFlow } from './recruiter-welcome';

export const BH_ONBOARDING_FLOW_PRESETS: Record<BhOnboardingFlowPreset, ComponentType<BhOnboardingFlowProps>> = {
  'admin-setup': AdminSetupBhOnboardingFlow,
  'recruiter-welcome': RecruiterWelcomeBhOnboardingFlow,
};
