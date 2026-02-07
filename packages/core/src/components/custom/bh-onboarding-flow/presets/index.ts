/**
 * BhOnboardingFlow - All Presets
 */

import type { BhOnboardingFlowPreset } from '../core';
import { AdminSetupBhOnboardingFlow } from './admin-setup';
import { RecruiterWelcomeBhOnboardingFlow } from './recruiter-welcome';

export { AdminSetupBhOnboardingFlow } from './admin-setup';
export { RecruiterWelcomeBhOnboardingFlow } from './recruiter-welcome';

export const BH_ONBOARDING_FLOW_PRESETS: Record<BhOnboardingFlowPreset, React.ComponentType<any>> = {
  'admin-setup': AdminSetupBhOnboardingFlow,
  'recruiter-welcome': RecruiterWelcomeBhOnboardingFlow,
};
