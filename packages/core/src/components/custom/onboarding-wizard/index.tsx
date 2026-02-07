import React from 'react';
import type { OnboardingWizardProps } from './core';
import { ONBOARDING_WIZARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { OnboardingWizardProps, OnboardingWizardPreset, OnboardingStep } from './core';
export { ONBOARDING_WIZARD_DEFAULTS } from './core';

export function OnboardingWizard(props: OnboardingWizardProps) {
  const { preset = ONBOARDING_WIZARD_DEFAULTS.preset!, ...rest } = props;
  const PresetComponent = PRESETS[preset];

  if (!PresetComponent) {
    throw new Error(`Unknown OnboardingWizard preset: ${preset}`);
  }

  return <PresetComponent {...rest} />;
}
