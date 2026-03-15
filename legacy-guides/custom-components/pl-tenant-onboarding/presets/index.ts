/**
 * PlTenantOnboarding - All Presets
 */

export { WizardPlTenantOnboarding } from './wizard';
export { StepperPlTenantOnboarding } from './stepper';

import type { PlTenantOnboardingPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlTenantOnboardingProps } from '../core';
import { WizardPlTenantOnboarding } from './wizard';
import { StepperPlTenantOnboarding } from './stepper';

export const PL_TENANT_ONBOARDING_PRESETS: Record<PlTenantOnboardingPreset, ComponentType<PlTenantOnboardingProps>> = {
  wizard: WizardPlTenantOnboarding,
  stepper: StepperPlTenantOnboarding,
};
